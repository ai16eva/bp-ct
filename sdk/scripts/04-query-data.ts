#!/usr/bin/env ts-node

import * as fs from 'node:fs';

import { AnchorProvider, BN, Program, Wallet } from '@coral-xyz/anchor';

import type { BpMarket } from '../../target/types/bp_market';
import { BPMarketSDK } from '../src';
import { CONNECTION, loadIDL, loadWallet } from './config';

async function queryData() {
  console.log('=== Query Data Script ===\n');

  try {
    // Load wallet
    const walletKeypair = loadWallet();
    const wallet = new Wallet(walletKeypair);
    console.log('Wallet loaded:', walletKeypair.publicKey.toString());

    // Create provider
    const provider = new AnchorProvider(
      CONNECTION,
      wallet,
      { commitment: 'confirmed' },
    );

    // Load program
    const idl = loadIDL();
    const program = new Program(idl, provider) as Program<BpMarket>;

    // Initialize SDK
    const sdk = new BPMarketSDK(program);

    // 1. Query Config Account
    console.log('📋 CONFIG ACCOUNT');
    console.log('=================');
    try {
      const accounts = await sdk.getAccounts();
      console.log('Owner:', accounts.owner.toString());
      console.log('Base Token:', accounts.baseToken.toString());
      console.log('Cojam Fee Account:', accounts.cojamFeeAccount.toString());
      console.log('Charity Fee Account:', accounts.charityFeeAccount.toString());
      console.log('Remain Account:', accounts.remainAccount.toString());

      const lockedUsers = await sdk.getLockedUsers();
      console.log('Locked Users:', lockedUsers.length);
    } catch (error) {
      console.log('Config not initialized');
    }

    // 2. Query All Markets
    console.log('\n📊 ALL MARKETS');
    console.log('==============');
    const allMarkets = await sdk.getAllMarkets();
    console.log(`Total Markets: ${allMarkets.length}\n`);

    for (const { publicKey, account } of allMarkets) {
      console.log(`Market ${account.marketKey.toString()}:`);
      console.log(`  PDA: ${publicKey.toString()}`);
      console.log(`  Title: ${account.title}`);
      console.log(`  Status: ${Object.keys(account.status)[0]}`);
      console.log(`  Creator: ${account.creator.toString()}`);
      console.log(`  Total Tokens: ${account.marketTotalTokens.toNumber() / 10 ** 9}`);
      console.log(`  Reward Base: ${account.marketRewardBaseTokens.toNumber() / 10 ** 9}`);

      // Get fee info
      const fees = await sdk.getMarketFee(account.marketKey);
      console.log(`  Fees: Creator ${fees.creatorFeePercentage.toNumber() / 100}%, `
      + `Service ${fees.serviceFeePercentage.toNumber() / 100}%, `
      + `Charity ${fees.charityFeePercentage.toNumber() / 100}%`);

      // Get answers
      const answers = await sdk.getAllAnswersInfo(account.marketKey);
      console.log(`  Answers:`);
      answers.forEach((answer) => {
        console.log(`    Answer ${answer.answerKey}: ${answer.totalTokens.toNumber() / 10 ** 9} tokens (${answer.percentage.toFixed(2)}%)`);
      });
      console.log('');
    }

    // 3. Query User's Bets
    console.log('🎲 YOUR BETS');
    console.log('============');
    const userBets = await sdk.getUserBets(walletKeypair.publicKey);
    console.log(`Total Bets: ${userBets.length}\n`);

    for (const { publicKey, account } of userBets) {
      console.log(`Bet on Market ${account.marketKey.toString()}, Answer ${account.answerKey.toString()}:`);
      console.log(`  PDA: ${publicKey.toString()}`);
      console.log(`  Amount: ${account.tokens.toNumber() / 10 ** 9} tokens`);
      console.log(`  Created: ${new Date(account.createTime.toNumber() * 1000).toLocaleString()}`);

      // Calculate available tokens
      const available = await sdk.availableReceiveTokens(account.marketKey, publicKey);
      console.log(`  Available to claim: ${available.toNumber() / 10 ** 9} tokens`);
      console.log('');
    }

    // 4. Get User Summary
    console.log('👤 USER SUMMARY');
    console.log('===============');
    const userSummary = await sdk.getUserTotalBets(walletKeypair.publicKey);
    console.log(`Total Bets Placed: ${userSummary.totalBets}`);
    console.log(`Total Tokens Bet: ${userSummary.totalTokensBet.toNumber() / 10 ** 9}`);
    console.log('Markets:');
    userSummary.markets.forEach((m) => {
      console.log(`  Market ${m.marketKey}, Answer ${m.answerKey}: ${m.tokens.toNumber() / 10 ** 9} tokens`);
    });

    // 5. Query Specific Market (if exists)
    if (fs.existsSync('./devnet-markets.json')) {
      const markets = JSON.parse(fs.readFileSync('./devnet-markets.json', 'utf-8'));
      if (markets.length > 0) {
        const marketInfo = markets[markets.length - 1];
        const marketKey = new BN(marketInfo.marketKey);

        console.log('\n🎯 DETAILED MARKET INFO');
        console.log('=======================');
        console.log(`Market ${marketKey.toString()}:`);

        const info = await sdk.getMarketInfo(marketKey);
        console.log('  Title:', info.title);
        console.log('  Status:', info.status);
        console.log('  Creator:', info.creator.toString());
        console.log('  Total Tokens:', info.totalTokens.toNumber() / 10 ** 9);
        console.log('  Remain Tokens:', info.remainTokens.toNumber() / 10 ** 9);
        console.log('  Reward Base:', info.rewardBaseTokens.toNumber() / 10 ** 9);

        if (info.status === 'success') {
          console.log('  Correct Answer:', info.correctAnswerKey?.toString());
        }

        // Get all bets on this market
        const marketBets = await sdk.getMarketBets(marketKey);
        console.log(`\n  Total Bets on Market: ${marketBets.length}`);

        // Show top bettors
        const sortedBets = marketBets.sort((a, b) =>
          b.account.tokens.toNumber() - a.account.tokens.toNumber(),
        );

        console.log('  Top Bettors:');
        sortedBets.slice(0, 5).forEach((bet, index) => {
          console.log(`    ${index + 1}. ${bet.account.voter.toString().slice(0, 8)}... - `
          + `Answer ${bet.account.answerKey}: ${bet.account.tokens.toNumber() / 10 ** 9} tokens`);
        });
      }
    }

    // 6. Search Markets by Creator
    console.log('\n🔍 MARKETS BY CREATOR');
    console.log('=====================');
    const creatorMarkets = await sdk.getMarketsByCreator(walletKeypair.publicKey);
    console.log(`Markets created by you: ${creatorMarkets.length}`);
    creatorMarkets.forEach(({ account }) => {
      console.log(`  - ${account.title} (Key: ${account.marketKey.toString()})`);
    });
  } catch (error) {
    console.error('\n❌ Error querying data:', error);
    throw error;
  }
}

// Run the script
queryData().then(() => {
  console.log('\n=== Query Complete ===');
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
