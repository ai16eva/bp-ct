import * as fs from 'node:fs';
import * as path from 'node:path';

import { AnchorProvider, BN, Program, setProvider, Wallet } from '@coral-xyz/anchor';
import { createAssociatedTokenAccount, createMint, getAssociatedTokenAddress, mintTo } from '@solana/spl-token';
import type { PublicKey } from '@solana/web3.js';
import { clusterApiUrl, Connection, Keypair } from '@solana/web3.js';
import * as dotenv from 'dotenv';

import type { BpMarket } from '../../target/types/bp_market';
import { BPMarketSDK } from '../src';

// Load environment variables
dotenv.config();

async function main() {
  // Setup connection from environment
  const network = process.env.SOLANA_NETWORK || 'devnet';
  const rpcUrl = process.env.SOLANA_RPC_URL || clusterApiUrl(network as any);
  const connection = new Connection(rpcUrl, 'confirmed');

  // Load wallet from environment or use fallback
  let walletData: number[];
  if (process.env.WALLET_PRIVATE_KEY) {
    try {
      walletData = JSON.parse(process.env.WALLET_PRIVATE_KEY);
      console.log('Wallet loaded from .env file');
    } catch (error) {
      console.error('Failed to parse WALLET_PRIVATE_KEY:', error);
      process.exit(1);
    }
  } else {
    console.warn('⚠️  Using fallback wallet. Set WALLET_PRIVATE_KEY in .env file.');
    walletData = [30, 202, 74, 81, 1, 158, 43, 203, 56, 217, 118, 87, 254, 14, 156, 21, 43, 117, 127, 227, 79, 108, 242, 46, 200, 229, 96, 128, 44, 5, 254, 20, 105, 249, 112, 21, 241, 48, 95, 215, 111, 47, 254, 68, 246, 95, 137, 200, 146, 0, 160, 17, 142, 51, 14, 92, 216, 30, 42, 253, 164, 146, 38, 169];
  }

  const walletKeypair = Keypair.fromSecretKey(Buffer.from(walletData));
  console.log('Wallet address:', walletKeypair.publicKey.toString());
  console.log('Network:', network);
  console.log('RPC URL:', rpcUrl);

  // Create Anchor wallet wrapper
  const wallet = new Wallet(walletKeypair);

  const provider = new AnchorProvider(connection, wallet, {
    preflightCommitment: 'confirmed',
  });
  setProvider(provider);

  // Load the program IDL and create program instance
  const idlPath = path.join(__dirname, '../../target/idl/bp_market.json');
  const idl = JSON.parse(fs.readFileSync(idlPath, 'utf-8'));
  const program = new Program(idl, provider) as Program<BpMarket>;

  // Initialize SDK
  const sdk = new BPMarketSDK(program);

  console.log('SDK initialized successfully!');

  // Check if config is already initialized
  let config: any;
  let baseToken: PublicKey;
  try {
    config = await sdk.fetchConfig();
    baseToken = config.baseToken;
    console.log('✅ Config already initialized');
    console.log('Config account:', {
      owner: config.owner.toString(),
      baseToken: config.baseToken.toString(),
    });
  } catch (error) {
    // Config not initialized, so initialize it
    console.log('Config not initialized, creating new config...');

    // Create a token mint to use as base token
    const mint = await createMint(
      connection,
      walletKeypair,
      walletKeypair.publicKey,
      null,
      9,
    );

    console.log('Created base token mint:', mint.toString());

    // Initialize the config
    const txSig = await sdk.initialize(mint, walletKeypair.publicKey);
    console.log('Config initialized:', txSig);

    // Fetch the newly created config
    config = await sdk.fetchConfig();
    baseToken = config.baseToken;
    console.log('Config account:', {
      owner: config.owner.toString(),
      baseToken: config.baseToken.toString(),
    });
  }

  // Generate a unique market key
  const marketKey = new BN(Date.now()); // Use timestamp as unique key

  // Example: Create and approve a market
  try {
    // Publish market
    const marketData = {
      marketKey,
      creator: walletKeypair.publicKey,
      title: `Test Market ${marketKey.toString()}`,
      createFee: new BN(1000000),
      creatorFeePercentage: new BN(100), // 1%
      serviceFeePercentage: new BN(200), // 2%
      charityFeePercentage: new BN(50), // 0.5%
      answerKeys: [new BN(1), new BN(2), new BN(3)],
    };

    const publishTx = await sdk.publishMarket(marketData, walletKeypair.publicKey);
    console.log('Market published:', publishTx);

    // Approve market
    const approveTx = await sdk.approveMarket(marketKey, walletKeypair.publicKey);
    console.log('Market approved:', approveTx);

    // Fetch and display market
    const market = await sdk.fetchMarket(marketKey);
    console.log('Market:', {
      title: market.title,
      status: Object.keys(market.status)[0],
      creator: market.creator.toString(),
    });

    // Fetch answers
    const answers = await sdk.fetchAnswer(marketKey);
    console.log('Answers:', answers.answers.map(a => ({
      key: a.answerKey.toString(),
      totalTokens: a.answerTotalTokens.toString(),
    })));
  } catch (error) {
    console.error('Error creating market:', error);
  }

  // Example: Place a bet on the market we just created
  try {
    // Use the marketKey from above (the one we just created)
    const answerKey = new BN(1);
    const amount = new BN(1000000000); // 1 token

    // Use the baseToken from config (already fetched above)
    const userTokenAccount = await getAssociatedTokenAddress(
      baseToken,
      walletKeypair.publicKey,
    );

    // Check if account exists, create if not
    const accountInfo = await connection.getAccountInfo(userTokenAccount);
    if (!accountInfo) {
      await createAssociatedTokenAccount(
        connection,
        walletKeypair,
        baseToken,
        walletKeypair.publicKey,
      );

      // Mint some tokens for testing (only if we're the mint authority)
      try {
        await mintTo(
          connection,
          walletKeypair,
          baseToken,
          userTokenAccount,
          walletKeypair,
          10000000000, // 10 tokens
        );
        console.log('Minted 10 tokens for testing');
      } catch (mintError) {
        console.log('Could not mint tokens (not mint authority)');
      }
    }

    // Place bet
    const betTx = await sdk.bet(marketKey, answerKey, amount, walletKeypair.publicKey);
    console.log('Bet placed:', betTx);

    // Fetch betting account
    const betting = await sdk.fetchBetting(walletKeypair.publicKey, marketKey, answerKey);
    console.log('Betting account:', {
      voter: betting.voter.toString(),
      answerKey: betting.answerKey.toString(),
      tokens: betting.tokens.toString(),
    });
  } catch (error) {
    console.error('Error placing bet:', error);
  }

  // Example: Query markets
  try {
    // Get all markets
    const allMarkets = await sdk.getAllMarkets();
    console.log(`Total markets: ${allMarkets.length}`);

    // Get user's bets
    const userBets = await sdk.getUserBets(walletKeypair.publicKey);
    console.log(`User has ${userBets.length} bets`);

    // Check if user is locked
    const isLocked = await sdk.isUserLocked(walletKeypair.publicKey);
    console.log('User locked status:', isLocked);
  } catch (error) {
    console.error('Error querying data:', error);
  }

  // Example: Listen for events
  const listenerId = sdk.addEventListener('betPlaced', (event, _slot, signature) => {
    console.log('New bet placed:', {
      voter: event.voter.toString(),
      marketKey: event.marketKey.toString(),
      answerKey: event.answerKey.toString(),
      signature,
    });
  });

  // Clean up listener after 30 seconds
  setTimeout(async () => {
    await sdk.removeEventListener(listenerId);
    console.log('Event listener removed');
  }, 30000);
}

main().catch(console.error);
