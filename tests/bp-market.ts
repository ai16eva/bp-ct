import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { BpMarket } from '../target/types/bp_market';
import { BPMarketSDK, AccountType } from '../sdk/src';
import {
  PublicKey,
  Keypair,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  createMint,
  createAssociatedTokenAccount,
  mintTo,
} from '@solana/spl-token';
import { assert } from 'chai';

const rpcEndpoint = 'http://localhost:8899';
const connection = new anchor.web3.Connection(rpcEndpoint, 'confirmed');

describe('bp-market', () => {
  // Set up the provider
  anchor.setProvider(anchor.AnchorProvider.env());

  // Configure the client to use the local cluster
  const program = anchor.workspace.BpMarket as Program<BpMarket>;

  // Initialize SDK
  let sdk: BPMarketSDK;

  // Test wallets
  const owner = Keypair.generate();
  const user1 = Keypair.generate();
  const user2 = Keypair.generate();
  const user3 = Keypair.generate();
  const lockedUser = Keypair.generate();

  // Fee recipient wallets
  const creator = Keypair.generate();
  const cojam = Keypair.generate();
  const charity = Keypair.generate();

  // Market variables
  const marketKey = new anchor.BN(1);

  // Token mint
  let betMint: PublicKey;
  let ownerTokenAccount: PublicKey;
  let user1TokenAccount: PublicKey;
  let user2TokenAccount: PublicKey;
  let user3TokenAccount: PublicKey;

  // Test data
  const marketTitle = 'Who will win the championship?';
  const answerKeys = [new anchor.BN(1), new anchor.BN(2), new anchor.BN(3)];
  const creatorFeePercentage = new anchor.BN(100); // 1%
  const serviceFeePercentage = new anchor.BN(200); // 2%
  const charityFeePercentage = new anchor.BN(50); // 0.5%
  const createFee = new anchor.BN(1000000); // 0.001 token

  // Helper function to airdrop SOL
  async function airdrop(publicKey: PublicKey, amount = 2 * LAMPORTS_PER_SOL) {
    const signature = await connection.requestAirdrop(publicKey, amount);
    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature,
      ...latestBlockhash,
    });
  }

  before(async () => {
    // Initialize SDK
    sdk = new BPMarketSDK(connection);

    // Airdrop SOL to test wallets
    await airdrop(owner.publicKey);
    await airdrop(user1.publicKey);
    await airdrop(user2.publicKey);
    await airdrop(user3.publicKey);
    await airdrop(lockedUser.publicKey);

    // Airdrop SOL to fee recipient wallets
    await airdrop(creator.publicKey);
    await airdrop(cojam.publicKey);
    await airdrop(charity.publicKey);

    // Create token mint
    betMint = await createMint(connection, owner, owner.publicKey, null, 9);

    // Create token accounts
    ownerTokenAccount = await createAssociatedTokenAccount(
      connection,
      owner,
      betMint,
      owner.publicKey
    );

    user1TokenAccount = await createAssociatedTokenAccount(
      connection,
      owner,
      betMint,
      user1.publicKey
    );

    user2TokenAccount = await createAssociatedTokenAccount(
      connection,
      owner,
      betMint,
      user2.publicKey
    );

    user3TokenAccount = await createAssociatedTokenAccount(
      connection,
      owner,
      betMint,
      user3.publicKey
    );

    // Create token accounts for fee recipients
    await createAssociatedTokenAccount(
      connection,
      owner,
      betMint,
      creator.publicKey
    );

    await createAssociatedTokenAccount(
      connection,
      owner,
      betMint,
      cojam.publicKey
    );

    await createAssociatedTokenAccount(
      connection,
      owner,
      betMint,
      charity.publicKey
    );

    // Mint tokens to users
    await mintTo(
      connection,
      owner,
      betMint,
      user1TokenAccount,
      owner.publicKey,
      10 * LAMPORTS_PER_SOL
    );

    await mintTo(
      connection,
      owner,
      betMint,
      user2TokenAccount,
      owner.publicKey,
      10 * LAMPORTS_PER_SOL
    );

    await mintTo(
      connection,
      owner,
      betMint,
      user3TokenAccount,
      owner.publicKey,
      10 * LAMPORTS_PER_SOL
    );
  });

  describe('Owner Instructions', () => {
    it('Should initialize config account', async () => {
      const tx = await sdk.initialize(betMint, owner.publicKey);
      const sig = await sendAndConfirmTransaction(connection, tx, [owner]);

      // Verify config account
      const configAccount = await sdk.fetchConfig();
      assert.equal(configAccount.owner.toString(), owner.publicKey.toString());
      assert.equal(configAccount.baseToken.toString(), betMint.toString());
      assert.equal(configAccount.lockedUsers.length, 0);
    });

    it('Should not allow re-initialization', async () => {
      try {
        const tx = await sdk.initialize(betMint, owner.publicKey);
        await sendAndConfirmTransaction(connection, tx, [owner]);
        assert.fail('Should have thrown error');
      } catch (err) {
        assert.include(err.toString(), 'already in use');
      }
    });

    it('Should update owner', async () => {
      const newOwner = Keypair.generate();

      const tx = await sdk.updateOwner(newOwner.publicKey, owner.publicKey);
      const sig = await sendAndConfirmTransaction(connection, tx, [owner]);

      const configAccount = await sdk.fetchConfig();
      assert.equal(
        configAccount.owner.toString(),
        newOwner.publicKey.toString()
      );

      // Update back to original owner using SDK with explicit owner
      const airdropSig = await connection.requestAirdrop(
        newOwner.publicKey,
        LAMPORTS_PER_SOL
      );
      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature: airdropSig,
        ...latestBlockhash,
      });

      // Create a new provider with the new owner
      const newOwnerWallet = {
        publicKey: newOwner.publicKey,
        signTransaction: async (tx: any) => tx,
        signAllTransactions: async (txs: any[]) => txs,
      };
      const newOwnerProvider = new anchor.AnchorProvider(
        connection,
        newOwnerWallet as any,
        {}
      );

      // Need to sign with newOwner, so we'll use the program directly here
      await program.methods
        .updateOwner(owner.publicKey)
        .accountsPartial({
          owner: newOwner.publicKey,
          configAccount: sdk.getConfigPDA(),
        })
        .signers([newOwner])
        .rpc();
    });

    it('Should lock a user', async () => {
      const tx = await sdk.lockUser(lockedUser.publicKey, owner.publicKey);
      const sig = await sendAndConfirmTransaction(connection, tx, [owner]);

      const configAccount = await sdk.fetchConfig();
      assert.equal(configAccount.lockedUsers.length, 1);
      assert.equal(
        configAccount.lockedUsers[0].toString(),
        lockedUser.publicKey.toString()
      );

      // Verify using SDK helper
      const isLocked = await sdk.isUserLocked(lockedUser.publicKey);
      assert.isTrue(isLocked);
    });

    it('Should not lock already locked user', async () => {
      try {
        const tx = await sdk.lockUser(lockedUser.publicKey, owner.publicKey);
        await sendAndConfirmTransaction(connection, tx, [owner]);
        assert.fail('Should have thrown error');
      } catch (err) {
        assert.include(err.toString(), 'UserAlreadyLocked');
      }
    });

    it('Should unlock a user', async () => {
      const tx = await sdk.unlockUser(lockedUser.publicKey, owner.publicKey);
      const sig = await sendAndConfirmTransaction(connection, tx, [owner]);

      const configAccount = await sdk.fetchConfig();
      assert.equal(configAccount.lockedUsers.length, 0);

      // Verify using SDK helper
      const isLocked = await sdk.isUserLocked(lockedUser.publicKey);
      assert.isFalse(isLocked);
    });

    it('Should not unlock non-locked user', async () => {
      try {
        const tx = await sdk.unlockUser(user1.publicKey, owner.publicKey);
        await sendAndConfirmTransaction(connection, tx, [owner]);
        assert.fail('Should have thrown error');
      } catch (err) {
        assert.include(err.toString(), 'UserNotLocked');
      }
    });

    it('Should set cojam fee account', async () => {
      const newCojamAccount = Keypair.generate();

      const tx = await sdk.setAccount(
        AccountType.CojamFee,
        newCojamAccount.publicKey,
        owner.publicKey
      );
      const sig = await sendAndConfirmTransaction(connection, tx, [owner]);

      const configAccount = await sdk.fetchConfig();
      assert.equal(
        configAccount.cojamFeeAccount.toString(),
        newCojamAccount.publicKey.toString()
      );
    });

    it('Should set charity fee account', async () => {
      const newCharityAccount = Keypair.generate();

      const tx = await sdk.setAccount(
        AccountType.CharityFee,
        newCharityAccount.publicKey,
        owner.publicKey
      );
      const sig = await sendAndConfirmTransaction(connection, tx, [owner]);

      const configAccount = await sdk.fetchConfig();
      assert.equal(
        configAccount.charityFeeAccount.toString(),
        newCharityAccount.publicKey.toString()
      );
    });

    it('Should set remain account', async () => {
      const newRemainAccount = Keypair.generate();

      const tx = await sdk.setAccount(
        AccountType.Remain,
        newRemainAccount.publicKey,
        owner.publicKey
      );
      const sig = await sendAndConfirmTransaction(connection, tx, [owner]);

      const configAccount = await sdk.fetchConfig();
      assert.equal(
        configAccount.remainAccount.toString(),
        newRemainAccount.publicKey.toString()
      );
    });
  });

  describe('Market Lifecycle', () => {
    it('Should publish a market', async () => {
      const marketData = {
        marketKey,
        creator: owner.publicKey,
        title: marketTitle,
        createFee,
        creatorFeePercentage,
        serviceFeePercentage,
        charityFeePercentage,
        answerKeys,
      };

      const tx = await sdk.publishMarket(marketData, owner.publicKey);
      const sig = await sendAndConfirmTransaction(connection, tx, [owner]);

      // Verify market account
      const marketAccount = await sdk.fetchMarket(marketKey);
      assert.equal(
        marketAccount.creator.toString(),
        owner.publicKey.toString()
      );
      assert.equal(marketAccount.title, marketTitle);
      assert.equal(marketAccount.status.approve !== undefined, true);
      assert.equal(
        marketAccount.creatorFeePercentage.toNumber(),
        creatorFeePercentage.toNumber()
      );
      assert.equal(
        marketAccount.serviceFeePercentage.toNumber(),
        serviceFeePercentage.toNumber()
      );
      assert.equal(
        marketAccount.charityFeePercentage.toNumber(),
        charityFeePercentage.toNumber()
      );

      // Verify answer account
      const answerAccount = await sdk.fetchAnswer(marketKey);
      assert.equal(answerAccount.answers.length, answerKeys.length);
      answerAccount.answers.forEach((answer, index) => {
        assert.equal(answer.answerKey.toNumber(), answerKeys[index].toNumber());
        assert.equal(answer.answerTotalTokens.toNumber(), 0);
      });

      // Verify using SDK helper
      const status = await sdk.getMarketStatus(marketKey);
      assert.equal(status, 'approve');
    });
  });

  describe('Betting', () => {
    it('User1 should bet on answer 1', async () => {
      const betAmount = new anchor.BN(1 * LAMPORTS_PER_SOL);
      const answerKey = new anchor.BN(1);

      // Use SDK bet function
      const tx = await sdk.bet(marketKey, answerKey, betAmount, user1.publicKey);
      const sig = await sendAndConfirmTransaction(connection, tx, [user1]);

      // Verify bet account
      const betAccount = await sdk.fetchBetting(
        user1.publicKey,
        marketKey,
        answerKey
      );
      assert.equal(betAccount.voter.toString(), user1.publicKey.toString());
      assert.equal(betAccount.answerKey.toNumber(), answerKey.toNumber());
      assert.equal(betAccount.tokens.toNumber(), betAmount.toNumber());

      // Verify market total tokens updated
      const marketAccount = await sdk.fetchMarket(marketKey);
      assert.equal(
        marketAccount.marketTotalTokens.toNumber(),
        betAmount.toNumber()
      );

      // Verify answer total tokens updated
      const answerAccount = await sdk.fetchAnswer(marketKey);
      const answer = answerAccount.answers.find(
        (a) => a.answerKey.toNumber() === answerKey.toNumber()
      );
      assert.equal(answer.answerTotalTokens.toNumber(), betAmount.toNumber());
    });

    it('User2 should bet on answer 2', async () => {
      const betAmount = new anchor.BN(2 * LAMPORTS_PER_SOL);
      const answerKey = new anchor.BN(2);

      // Use SDK bet function
      const tx = await sdk.bet(marketKey, answerKey, betAmount, user2.publicKey);
      const sig = await sendAndConfirmTransaction(connection, tx, [user2]);

      // Verify updated totals
      const marketAccount = await sdk.fetchMarket(marketKey);
      assert.equal(
        marketAccount.marketTotalTokens.toNumber(),
        3 * LAMPORTS_PER_SOL
      );
    });

    it('User3 should bet on answer 1', async () => {
      const betAmount = new anchor.BN(1.5 * LAMPORTS_PER_SOL);
      const answerKey = new anchor.BN(1);

      // Use SDK bet function
      const tx = await sdk.bet(marketKey, answerKey, betAmount, user3.publicKey);
      const sig = await sendAndConfirmTransaction(connection, tx, [user3]);

      // Verify answer 1 has correct total
      const answerAccount = await sdk.fetchAnswer(marketKey);
      const answer1 = answerAccount.answers.find(
        (a) => a.answerKey.toNumber() === 1
      );
      assert.equal(
        answer1.answerTotalTokens.toNumber(),
        2.5 * LAMPORTS_PER_SOL
      );

      // Test SDK helper - calculate potential winnings
      const potentialWinnings = await sdk.calculateWinnings(
        user3.publicKey,
        marketKey,
        answerKey
      );
    });

    it('Locked user should not be able to bet', async () => {
      // First lock the user
      const lockTx = await sdk.lockUser(lockedUser.publicKey, owner.publicKey);
      await sendAndConfirmTransaction(connection, lockTx, [owner]);

      // Create token account for locked user
      const lockedUserTokenAccount = await createAssociatedTokenAccount(
        connection,
        owner,
        betMint,
        lockedUser.publicKey
      );

      // Mint tokens to locked user
      await mintTo(
        connection,
        owner,
        betMint,
        lockedUserTokenAccount,
        owner.publicKey,
        10 * LAMPORTS_PER_SOL
      );

      // Try to bet
      const betAmount = new anchor.BN(1 * LAMPORTS_PER_SOL);
      const answerKey = new anchor.BN(1);

      try {
        // Use SDK bet function
        const tx = await sdk.bet(marketKey, answerKey, betAmount, lockedUser.publicKey);
        await sendAndConfirmTransaction(connection, tx, [lockedUser]);
        assert.fail('Should have thrown error');
      } catch (err) {
        assert.include(err.toString(), 'UserAlreadyLocked');
      }
    });
  });

  describe('Market Resolution', () => {
    it('Should mark market as success with correct answer', async () => {
      const correctAnswerKey = new anchor.BN(1);

      // First, update the config to set the proper fee recipients
      const cojamTx = await sdk.setAccount(
        AccountType.CojamFee,
        cojam.publicKey,
        owner.publicKey
      );
      await sendAndConfirmTransaction(connection, cojamTx, [owner]);
      const charityTx = await sdk.setAccount(
        AccountType.CharityFee,
        charity.publicKey,
        owner.publicKey
      );
      await sendAndConfirmTransaction(connection, charityTx, [owner]);

      const tx = await sdk.successMarket(
        marketKey,
        correctAnswerKey,
        owner.publicKey
      );
      const sig = await sendAndConfirmTransaction(connection, tx, [owner]);

      const marketAccount = await sdk.fetchMarket(marketKey);
      assert.equal(marketAccount.status.success !== undefined, true);
      assert.equal(
        marketAccount.correctAnswerKey.toNumber(),
        correctAnswerKey.toNumber()
      );
      assert.isAbove(marketAccount.successTime.toNumber(), 0);

      // Calculate expected rewards
      const totalTokens = marketAccount.marketTotalTokens.toNumber();
      const totalFees =
        (creatorFeePercentage.toNumber() +
          serviceFeePercentage.toNumber() +
          charityFeePercentage.toNumber()) /
        10000;
      const expectedRewardBase = Math.floor(totalTokens * (1 - totalFees));

      assert.approximately(
        marketAccount.marketRewardBaseTokens.toNumber(),
        expectedRewardBase,
        100 // Allow small rounding difference
      );

      // Verify using SDK helper
      const status = await sdk.getMarketStatus(marketKey);
      assert.equal(status, 'success');
    });

    it('Should adjourn market', async () => {
      // Create a new market for adjournment
      const adjournMarketKey = new anchor.BN(3);
      // Publish
      const publishTx = await sdk.publishMarket(
        {
          marketKey: adjournMarketKey,
          creator: creator.publicKey,
          title: 'Market to Adjourn',
          createFee,
          creatorFeePercentage,
          serviceFeePercentage,
          charityFeePercentage,
          answerKeys: [new anchor.BN(1), new anchor.BN(2)],
        },
        owner.publicKey
      );
      await sendAndConfirmTransaction(connection, publishTx, [owner]);
      // Adjourn
      const tx = await sdk.adjournMarket(adjournMarketKey, owner.publicKey);
      const sig = await sendAndConfirmTransaction(connection, tx, [owner]);

      const marketAccount = await sdk.fetchMarket(adjournMarketKey);
      assert.equal(marketAccount.status.adjourn !== undefined, true);
      assert.isAbove(marketAccount.adjournTime.toNumber(), 0);

      // Verify using SDK helper
      const status = await sdk.getMarketStatus(adjournMarketKey);
      assert.equal(status, 'adjourn');
    });

    it('Should finish market', async () => {
      // Create a new market for finishing
      const finishMarketKey = new anchor.BN(4);
      // Publish
      const publishTx = await sdk.publishMarket(
        {
          marketKey: finishMarketKey,
          creator: creator.publicKey,
          title: 'Market to Finish',
          createFee,
          creatorFeePercentage,
          serviceFeePercentage,
          charityFeePercentage,
          answerKeys: [new anchor.BN(1), new anchor.BN(2)],
        },
        owner.publicKey
      );
      await sendAndConfirmTransaction(connection, publishTx, [owner]);

      // Place some bets to have token data
      const betAmount = new anchor.BN(1 * LAMPORTS_PER_SOL);
      const answerKey = new anchor.BN(1);
      const betTx = await sdk.bet(finishMarketKey, answerKey, betAmount, user1.publicKey);
      await sendAndConfirmTransaction(connection, betTx, [user1]);

      // Get market total tokens before finishing
      const marketBeforeFinish = await sdk.fetchMarket(finishMarketKey);
      const totalTokens = marketBeforeFinish.marketTotalTokens;

      // Finish
      const tx = await sdk.finishMarket(finishMarketKey, owner.publicKey);
      const sig = await sendAndConfirmTransaction(connection, tx, [owner]);

      const marketAccount = await sdk.fetchMarket(finishMarketKey);
      assert.equal(marketAccount.status.finished !== undefined, true);
      assert.isAbove(marketAccount.finishTime.toNumber(), 0);
      assert.equal(
        marketAccount.marketRemainTokens.toNumber(),
        totalTokens.toNumber(),
        'market_remain_tokens should equal market_total_tokens'
      );

      // Verify using SDK helper
      const status = await sdk.getMarketStatus(finishMarketKey);
      assert.equal(status, 'finished');
    });

    it('Should not finish market if not approved', async () => {
      // Create a market but don't approve it (this creates it in Draft status initially, then moves to Approve)
      // We need to test finishing a market that's already been finished or in another state
      const finishMarketKey2 = new anchor.BN(5);

      // Publish (which approves it)
      const publishTx = await sdk.publishMarket(
        {
          marketKey: finishMarketKey2,
          creator: creator.publicKey,
          title: 'Market to Test Finish Constraint',
          createFee,
          creatorFeePercentage,
          serviceFeePercentage,
          charityFeePercentage,
          answerKeys: [new anchor.BN(1), new anchor.BN(2)],
        },
        owner.publicKey
      );
      await sendAndConfirmTransaction(connection, publishTx, [owner]);

      // Finish it first
      const finishTx1 = await sdk.finishMarket(finishMarketKey2, owner.publicKey);
      await sendAndConfirmTransaction(connection, finishTx1, [owner]);

      // Try to finish it again (should fail because status is no longer Approve)
      try {
        const finishTx2 = await sdk.finishMarket(finishMarketKey2, owner.publicKey);
        await sendAndConfirmTransaction(connection, finishTx2, [owner]);
        assert.fail('Should have thrown error');
      } catch (err) {
        assert.include(err.toString(), 'MarketNotApproved');
      }
    });

    it('Should not allow non-owner to finish market', async () => {
      const finishMarketKey3 = new anchor.BN(6);

      // Publish
      const publishTx = await sdk.publishMarket(
        {
          marketKey: finishMarketKey3,
          creator: creator.publicKey,
          title: 'Market to Test Owner Constraint',
          createFee,
          creatorFeePercentage,
          serviceFeePercentage,
          charityFeePercentage,
          answerKeys: [new anchor.BN(1), new anchor.BN(2)],
        },
        owner.publicKey
      );
      await sendAndConfirmTransaction(connection, publishTx, [owner]);

      // Try to finish as non-owner (should fail)
      try {
        const finishTx = await sdk.finishMarket(finishMarketKey3, user1.publicKey);
        await sendAndConfirmTransaction(connection, finishTx, [user1]);
        assert.fail('Should have thrown error');
      } catch (err) {
        assert.include(err.toString(), 'Unauthorized');
      }
    });
  });

  describe('Token Claiming and Retrieval', () => {
    it('Winners should receive tokens after market success', async () => {
      const answerKey1 = new anchor.BN(1);

      // Calculate expected winnings BEFORE claiming (while betting account still exists)
      const expectedWinnings = await sdk.calculateWinnings(
        user1.publicKey,
        marketKey,
        answerKey1
      );
      assert.isAbove(expectedWinnings.toNumber(), 0, 'Expected winnings should be greater than 0');

      // Record user1's token balance before claiming
      const user1BalanceBefore = await connection.getTokenAccountBalance(
        user1TokenAccount
      );

      // User1 claims their winnings using SDK
      const tx = await sdk.receiveToken(marketKey, answerKey1, user1.publicKey);
      const sig = await sendAndConfirmTransaction(connection, tx, [user1]);

      // Check user1's balance after claiming
      const user1BalanceAfter = await connection.getTokenAccountBalance(
        user1TokenAccount
      );

      // User1 should have received tokens (their bet + share of reward pool)
      assert.isAbove(
        parseInt(user1BalanceAfter.value.amount),
        parseInt(user1BalanceBefore.value.amount),
        'User1 should have received tokens'
      );

      // Verify the actual received amount matches expected
      const actualReceived = parseInt(user1BalanceAfter.value.amount) - parseInt(user1BalanceBefore.value.amount);
      assert.approximately(
        actualReceived,
        expectedWinnings.toNumber(),
        100, // Allow small rounding difference
        'Received amount should match calculated winnings'
      );
    });

    it('Owner should not be able to retrieve remaining tokens before 180 days', async () => {
      // Try to retrieve tokens (should fail due to 180-day restriction)
      try {
        const tx = await sdk.retrieveTokens(
          marketKey,
          ownerTokenAccount,
          owner.publicKey
        );
        await sendAndConfirmTransaction(connection, tx, [owner]);
        assert.fail('Should have thrown error due to 180-day restriction');
      } catch (err) {
        assert.include(err.toString(), 'CannotRetrieveBeforeDate');
      }
    });
  });

  describe('SDK Query Methods', () => {
    it('Should get all markets', async () => {
      const allMarkets = await sdk.getAllMarkets();
      assert.isAtLeast(allMarkets.length, 2); // At least the main market and adjourn market
    });

    it('Should get markets by creator', async () => {
      const creatorMarkets = await sdk.getMarketsByCreator(creator.publicKey);
      assert.isAtLeast(creatorMarkets.length, 1);
    });

    it('Should get user bets', async () => {
      // Note: user1's betting account was closed after claiming winnings
      // So we test with user2 who hasn't claimed yet
      const user2Bets = await sdk.getUserBets(user2.publicKey);
      assert.isAtLeast(user2Bets.length, 1, 'user2 should have at least 1 unclaimed bet');

      // Verify bet details
      assert.equal(user2Bets[0].account.voter.toString(), user2.publicKey.toString());
      assert.equal(user2Bets[0].account.marketKey.toNumber(), marketKey.toNumber());
    });

    it('Should get market bets', async () => {
      const marketBets = await sdk.getMarketBets(marketKey);
      // Only 2 bets remain - user1's account was closed after claiming
      assert.equal(marketBets.length, 2, 'Should have 2 unclaimed bets (user2 and user3)');

      // Verify all bets are for the correct market
      marketBets.forEach(bet => {
        assert.equal(bet.account.marketKey.toNumber(), marketKey.toNumber());
      });
    });
  });

  describe('Summary', () => {
    it('Should display final state', async () => {

      // Config state
      const configAccount = await sdk.fetchConfig();

      // Market state
      const marketAccount = await sdk.fetchMarket(marketKey);

      // Answer distribution
      const answerAccount = await sdk.fetchAnswer(marketKey);
      answerAccount.answers.forEach((answer) => {
        const percentage = (
          (answer.answerTotalTokens.toNumber() /
            marketAccount.marketTotalTokens.toNumber()) *
          100
        ).toFixed(2);
      });

    });
  });
});
