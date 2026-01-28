import * as fs from 'node:fs';
import * as path from 'node:path';

import { AnchorProvider, BN, Program } from '@coral-xyz/anchor';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';

import type { BpMarket } from '../../target/types/bp_market';
import { BPMarketSDK } from '../src';

/**
 * Example demonstrating how to calculate available tokens for users to receive
 * This works for both successful markets (winners get rewards) and adjourned markets (everyone gets refund)
 */
async function calculateRewards() {
  // Setup connection
  const connection = new Connection('http://localhost:8899', 'confirmed');

  // Load wallet
  const walletPath = path.join(process.env.HOME!, '.config/solana/id.json');
  const walletKeypair = Keypair.fromSecretKey(
    Buffer.from(JSON.parse(fs.readFileSync(walletPath, 'utf-8'))),
  );

  // Create provider
  const wallet = {
    publicKey: walletKeypair.publicKey,
    signTransaction: async (tx: any) => tx,
    signAllTransactions: async (txs: any[]) => txs,
  };

  const provider = new AnchorProvider(connection, wallet as any, {
    preflightCommitment: 'confirmed',
  });

  // Load the program
  const idlPath = path.join(__dirname, '../../target/idl/bp_market.json');
  const idl = JSON.parse(fs.readFileSync(idlPath, 'utf-8'));
  const programId = new PublicKey('HEWGHU2byaRN4KwyH58vz2JbXywght1PRuSxLM5i8ped');
  const program = new Program(idl, provider) as Program<BpMarket>;

  // Initialize SDK
  const sdk = new BPMarketSDK(program);

  // Example market and user
  const marketKey = new BN(1);
  const voter = walletKeypair.publicKey;
  const answerKey = new BN(1);

  try {
    // Get market information
    const marketInfo = await sdk.getMarketInfo(marketKey);
    console.log('\n=== Market Information ===');
    console.log('Title:', marketInfo.title);
    console.log('Status:', marketInfo.status);
    console.log('Total Tokens:', marketInfo.totalTokens.toString());
    console.log('Reward Base Tokens:', marketInfo.rewardBaseTokens.toString());

    if (marketInfo.status === 'success') {
      console.log('Correct Answer:', marketInfo.correctAnswerKey?.toString());
    }

    // Get all answers and their distribution
    const answers = await sdk.getAllAnswersInfo(marketKey);
    console.log('\n=== Answer Distribution ===');
    answers.forEach((answer) => {
      console.log(`Answer ${answer.answerKey}: ${answer.totalTokens.toString()} tokens (${answer.percentage.toFixed(2)}%)`);
    });

    // Calculate available tokens for a specific user
    console.log('\n=== User Reward Calculation ===');

    // Method 1: Using betting PDA directly
    const bettingPDA = sdk.getBettingPDA(voter, marketKey, answerKey);
    const availableTokens = await sdk.availableReceiveTokens(marketKey, bettingPDA);
    console.log(`Available tokens using PDA: ${availableTokens.toString()}`);

    // Method 2: Using voter address (convenience method)
    const availableTokensByUser = await sdk.availableReceiveTokensByUser(voter, marketKey, answerKey);
    console.log(`Available tokens using voter: ${availableTokensByUser.toString()}`);

    // Get user bet information
    const userBetInfo = await sdk.getUserBetInfo(voter, marketKey, answerKey);
    if (userBetInfo.exists) {
      console.log('\n=== User Bet Details ===');
      console.log('Original Bet:', userBetInfo.tokens.toString());
      console.log('Bet Placed At:', new Date(userBetInfo.createTime.toNumber() * 1000).toLocaleString());
      console.log('Potential Winnings:', userBetInfo.potentialWinnings?.toString() || '0');

      // Calculate return percentage
      if (!userBetInfo.tokens.isZero()) {
        const returnPercentage = availableTokens.mul(new BN(100)).div(userBetInfo.tokens);
        console.log('Return Percentage:', `${returnPercentage.toString()}%`);
      }
    }

    // Example: Calculate for all user's bets
    const userTotalBets = await sdk.getUserTotalBets(voter);
    if (userTotalBets.totalBets > 0) {
      console.log('\n=== All User Bets ===');
      console.log('Total Bets:', userTotalBets.totalBets);
      console.log('Total Tokens Bet:', userTotalBets.totalTokensBet.toString());

      let totalReceivable = new BN(0);
      for (const bet of userTotalBets.markets) {
        const bettingPDA = sdk.getBettingPDA(voter, bet.marketKey, bet.answerKey);
        const receivable = await sdk.availableReceiveTokens(bet.marketKey, bettingPDA);
        totalReceivable = totalReceivable.add(receivable);

        console.log(`Market ${bet.marketKey} Answer ${bet.answerKey}: ${receivable.toString()} tokens`);
      }

      console.log('Total Receivable Across All Bets:', totalReceivable.toString());
    }

    // Example: Check different market statuses
    console.log('\n=== Market Status Examples ===');

    // Success market - only winners receive tokens
    if (marketInfo.status === 'success') {
      console.log('Market is SUCCESSFUL');
      console.log('Winners (bet on answer', marketInfo.correctAnswerKey?.toString(), ') receive rewards');
      console.log('Losers receive 0 tokens');
    }

    // Adjourn market - everyone gets refund
    else if (marketInfo.status === 'adjourn') {
      console.log('Market is ADJOURNED');
      console.log('All participants receive 100% refund of their bets');
    }

    // Other statuses - no tokens available
    else {
      console.log('Market status:', marketInfo.status);
      console.log('No tokens available for claiming in this status');
    }
  } catch (error) {
    console.error('Error calculating rewards:', error);
  }
}

// Run the example
calculateRewards().then(() => {
  console.log('\n=== Calculation Complete ===');
}).catch(console.error);
