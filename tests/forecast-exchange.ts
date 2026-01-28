import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { ForecastExchange } from '../target/types/forecast_exchange';
import { ForecastExchangeSDK } from '../sdk/src';
import {
  PublicKey,
  Keypair,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  createMint,
  getAssociatedTokenAddress,
  createAssociatedTokenAccount,
  mintTo,
  getAccount,
  getMint,
} from '@solana/spl-token';
import { assert } from 'chai';

const rpcEndpoint = 'http://localhost:8899';
const connection = new anchor.web3.Connection(rpcEndpoint, 'confirmed');

describe.skip('forecast-exchange', () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  let sdk: ForecastExchangeSDK;

  // Test wallets
  const owner = Keypair.generate();
  const buyer = Keypair.generate();
  const seller = Keypair.generate();

  // Mints
  let usdtMint: PublicKey;
  let usdpMint: PublicKey;

  // Token accounts
  let ownerUsdtAccount: PublicKey;
  let ownerUsdpAccount: PublicKey;
  let buyerUsdtAccount: PublicKey;
  let buyerUsdpAccount: PublicKey;
  let sellerUsdtAccount: PublicKey;
  let sellerUsdpAccount: PublicKey;

  const exchangeFeeBps = 30; // 0.3%

  async function airdrop(publicKey: PublicKey, amount = 5 * LAMPORTS_PER_SOL) {
    const signature = await connection.requestAirdrop(publicKey, amount);
    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature,
      ...latestBlockhash,
    });
  }

  before(async () => {
    sdk = new ForecastExchangeSDK(connection);

    // Airdrop SOL
    await airdrop(owner.publicKey);
    await airdrop(buyer.publicKey);
    await airdrop(seller.publicKey);

    // Create USDT mint (simulated stablecoin)
    usdtMint = await createMint(connection, owner, owner.publicKey, null, 6);

    // Create USDP mint (simulated stablecoin)
    usdpMint = await createMint(connection, owner, owner.publicKey, null, 6);

    // Create token accounts
    ownerUsdtAccount = await createAssociatedTokenAccount(connection, owner, usdtMint, owner.publicKey);
    ownerUsdpAccount = await createAssociatedTokenAccount(connection, owner, usdpMint, owner.publicKey);
    buyerUsdtAccount = await createAssociatedTokenAccount(connection, owner, usdtMint, buyer.publicKey);
    buyerUsdpAccount = await createAssociatedTokenAccount(connection, owner, usdpMint, buyer.publicKey);
    sellerUsdtAccount = await createAssociatedTokenAccount(connection, owner, usdtMint, seller.publicKey);
    sellerUsdpAccount = await createAssociatedTokenAccount(connection, owner, usdpMint, seller.publicKey);

    // Mint tokens to owner
    await mintTo(connection, owner, usdtMint, ownerUsdtAccount, owner.publicKey, 1000000 * 1e6);
    await mintTo(connection, owner, usdpMint, ownerUsdpAccount, owner.publicKey, 1000000 * 1e6);

    // Mint USDT to buyer and USDP to seller
    await mintTo(connection, owner, usdtMint, buyerUsdtAccount, owner.publicKey, 10000 * 1e6);
    await mintTo(connection, owner, usdpMint, sellerUsdpAccount, owner.publicKey, 10000 * 1e6);
  });

  describe('Exchange Initialization', () => {
    it('Should initialize exchange', async () => {
      const tx = await sdk.initializeExchange(
        exchangeFeeBps,
        usdtMint,
        usdpMint,
        owner.publicKey
      );
      await sendAndConfirmTransaction(connection, tx, [owner]);

      const exchangeState = await sdk.fetchExchangeState();
      assert.equal(exchangeState.owner.toString(), owner.publicKey.toString());
      assert.equal(exchangeState.usdtMint.toString(), usdtMint.toString());
      assert.equal(exchangeState.usdpMint.toString(), usdpMint.toString());
      assert.equal(exchangeState.exchangeFeeBps, exchangeFeeBps);
      assert.isFalse(exchangeState.isPaused);
    });

    it('Should not allow re-initialization', async () => {
      try {
        const tx = await sdk.initializeExchange(
          exchangeFeeBps,
          usdtMint,
          usdpMint,
          owner.publicKey
        );
        await sendAndConfirmTransaction(connection, tx, [owner]);
        assert.fail('Should have thrown error');
      } catch (err) {
        assert.include(err.toString(), 'already in use');
      }
    });
  });

  describe('Fee Management', () => {
    it('Should update exchange fee', async () => {
      const newFee = 50; // 0.5%
      const tx = await sdk.updateFee(newFee, owner.publicKey);
      await sendAndConfirmTransaction(connection, tx, [owner]);

      const exchangeState = await sdk.fetchExchangeState();
      assert.equal(exchangeState.exchangeFeeBps, newFee);
    });

    it('Should get exchange fee', async () => {
      const fee = await sdk.getExchangeFee();
      assert.equal(fee, 50);
    });
  });

  describe('Pause/Unpause Exchange', () => {
    it('Should pause exchange', async () => {
      const tx = await sdk.pauseExchange(owner.publicKey);
      await sendAndConfirmTransaction(connection, tx, [owner]);

      const isPaused = await sdk.isExchangePaused();
      assert.isTrue(isPaused);
    });

    it('Should not allow trading when paused', async () => {
      const amount = new anchor.BN(100 * 1e6);
      try {
        const tx = await sdk.buyUsdp(amount, buyer.publicKey);
        await sendAndConfirmTransaction(connection, tx, [buyer]);
        assert.fail('Should have thrown error');
      } catch (err) {
        // Expected - exchange is paused
      }
    });

    it('Should unpause exchange', async () => {
      const tx = await sdk.unpauseExchange(owner.publicKey);
      await sendAndConfirmTransaction(connection, tx, [owner]);

      const isPaused = await sdk.isExchangePaused();
      assert.isFalse(isPaused);
    });
  });

  describe('Buy USDP', () => {
    it('Should buy USDP with USDT', async () => {
      const buyAmount = new anchor.BN(100 * 1e6); // 100 USDT

      const buyerUsdtBefore = await getAccount(connection, buyerUsdtAccount);
      const buyerUsdpBefore = await getAccount(connection, buyerUsdpAccount);

      const tx = await sdk.buyUsdp(buyAmount, buyer.publicKey);
      await sendAndConfirmTransaction(connection, tx, [buyer, owner]);

      const buyerUsdtAfter = await getAccount(connection, buyerUsdtAccount);
      const buyerUsdpAfter = await getAccount(connection, buyerUsdpAccount);

      // Buyer should have less USDT
      assert.isBelow(Number(buyerUsdtAfter.amount), Number(buyerUsdtBefore.amount));

      // Buyer should have more USDP
      assert.isAbove(Number(buyerUsdpAfter.amount), Number(buyerUsdpBefore.amount));
    });

    it('Should calculate correct fee on buy', async () => {
      const buyAmount = new anchor.BN(1000 * 1e6); // 1000 USDT
      const fee = await sdk.getExchangeFee(); // 50 bps = 0.5%
      const expectedFee = (1000 * 1e6 * fee) / 10000;
      const expectedUsdpReceived = 1000 * 1e6 - expectedFee;

      const buyerUsdpBefore = await getAccount(connection, buyerUsdpAccount);

      const tx = await sdk.buyUsdp(buyAmount, buyer.publicKey);
      await sendAndConfirmTransaction(connection, tx, [buyer, owner]);

      const buyerUsdpAfter = await getAccount(connection, buyerUsdpAccount);
      const actualReceived = Number(buyerUsdpAfter.amount) - Number(buyerUsdpBefore.amount);

      // Allow 1 token difference for rounding
      assert.approximately(actualReceived, expectedUsdpReceived, 1);
    });
  });

  describe('Sell USDP', () => {
    it('Should sell USDP for USDT', async () => {
      const sellAmount = new anchor.BN(100 * 1e6); // 100 USDP

      const sellerUsdtBefore = await getAccount(connection, sellerUsdtAccount);
      const sellerUsdpBefore = await getAccount(connection, sellerUsdpAccount);

      const tx = await sdk.sellUsdp(sellAmount, seller.publicKey);
      await sendAndConfirmTransaction(connection, tx, [seller, owner]);

      const sellerUsdtAfter = await getAccount(connection, sellerUsdtAccount);
      const sellerUsdpAfter = await getAccount(connection, sellerUsdpAccount);

      // Seller should have more USDT
      assert.isAbove(Number(sellerUsdtAfter.amount), Number(sellerUsdtBefore.amount));

      // Seller should have less USDP
      assert.isBelow(Number(sellerUsdpAfter.amount), Number(sellerUsdpBefore.amount));
    });

    it('Should calculate correct fee on sell', async () => {
      const sellAmount = new anchor.BN(1000 * 1e6); // 1000 USDP
      const fee = await sdk.getExchangeFee(); // 50 bps = 0.5%
      const expectedFee = (1000 * 1e6 * fee) / 10000;
      const expectedUsdtReceived = 1000 * 1e6 - expectedFee;

      const sellerUsdtBefore = await getAccount(connection, sellerUsdtAccount);

      const tx = await sdk.sellUsdp(sellAmount, seller.publicKey);
      await sendAndConfirmTransaction(connection, tx, [seller, owner]);

      const sellerUsdtAfter = await getAccount(connection, sellerUsdtAccount);
      const actualReceived = Number(sellerUsdtAfter.amount) - Number(sellerUsdtBefore.amount);

      // Allow 1 token difference for rounding
      assert.approximately(actualReceived, expectedUsdtReceived, 1);
    });
  });

  describe('Ownership Transfer', () => {
    it('Should transfer ownership', async () => {
      const newOwner = Keypair.generate();
      await airdrop(newOwner.publicKey);

      // Create token accounts for new owner
      const newOwnerUsdtAccount = await createAssociatedTokenAccount(connection, owner, usdtMint, newOwner.publicKey);
      const newOwnerUsdpAccount = await createAssociatedTokenAccount(connection, owner, usdpMint, newOwner.publicKey);

      await mintTo(connection, owner, usdtMint, newOwnerUsdtAccount, owner.publicKey, 1000 * 1e6);
      await mintTo(connection, owner, usdpMint, newOwnerUsdpAccount, owner.publicKey, 1000 * 1e6);

      const tx = await sdk.transferOwnership(owner.publicKey, newOwner.publicKey);
      await sendAndConfirmTransaction(connection, tx, [owner]);

      const exchangeOwner = await sdk.getExchangeOwner();
      assert.equal(exchangeOwner.toString(), newOwner.publicKey.toString());

      // Transfer back for other tests
      const txBack = await sdk.transferOwnership(newOwner.publicKey, owner.publicKey);
      await sendAndConfirmTransaction(connection, txBack, [newOwner]);
    });
  });

  describe('Fee Withdrawal', () => {
    it('Should withdraw collected fees', async () => {
      const recipient = Keypair.generate();
      await airdrop(recipient.publicKey);

      // Create recipient token accounts
      const recipientUsdtAccount = await createAssociatedTokenAccount(connection, owner, usdtMint, recipient.publicKey);
      const recipientUsdpAccount = await createAssociatedTokenAccount(connection, owner, usdpMint, recipient.publicKey);

      const withdrawUsdtAmount = new anchor.BN(10 * 1e6);
      const withdrawUsdpAmount = new anchor.BN(10 * 1e6);

      const recipientUsdtBefore = await getAccount(connection, recipientUsdtAccount);
      const recipientUsdpBefore = await getAccount(connection, recipientUsdpAccount);

      const tx = await sdk.withdrawFees(
        withdrawUsdtAmount,
        withdrawUsdpAmount,
        owner.publicKey,
        recipient.publicKey
      );
      await sendAndConfirmTransaction(connection, tx, [owner]);

      const recipientUsdtAfter = await getAccount(connection, recipientUsdtAccount);
      const recipientUsdpAfter = await getAccount(connection, recipientUsdpAccount);

      // Recipient should have received tokens
      assert.equal(
        Number(recipientUsdtAfter.amount) - Number(recipientUsdtBefore.amount),
        Number(withdrawUsdtAmount)
      );
      assert.equal(
        Number(recipientUsdpAfter.amount) - Number(recipientUsdpBefore.amount),
        Number(withdrawUsdpAmount)
      );
    });
  });

  describe('SDK Utility Methods', () => {
    it('Should get exchange state', async () => {
      const state = await sdk.fetchExchangeState();
      assert.equal(state.owner.toString(), owner.publicKey.toString());
      assert.equal(state.usdtMint.toString(), usdtMint.toString());
      assert.equal(state.usdpMint.toString(), usdpMint.toString());
      assert.isFalse(state.isPaused);
    });

    it('Should get exchange owner', async () => {
      const exchangeOwner = await sdk.getExchangeOwner();
      assert.equal(exchangeOwner.toString(), owner.publicKey.toString());
    });

    it('Should check if exchange is paused', async () => {
      const isPaused = await sdk.isExchangePaused();
      assert.isFalse(isPaused);
    });
  });

  describe('Summary', () => {
    it('Should display final state', async () => {
      const exchangeState = await sdk.fetchExchangeState();

      const buyerUsdt = await getAccount(connection, buyerUsdtAccount);
      const buyerUsdp = await getAccount(connection, buyerUsdpAccount);
      const sellerUsdt = await getAccount(connection, sellerUsdtAccount);
      const sellerUsdp = await getAccount(connection, sellerUsdpAccount);

      assert.isNotNull(exchangeState);
      assert.isAbove(Number(buyerUsdp.amount), 0);
      assert.isAbove(Number(sellerUsdt.amount), 0);
    });
  });
});