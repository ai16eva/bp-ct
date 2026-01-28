#!/usr/bin/env ts-node

import * as fs from 'node:fs';

import { AnchorProvider, BN, Program, Wallet } from '@coral-xyz/anchor';
import { Keypair } from '@solana/web3.js';

import type { BpMarket } from '../../target/types/bp_market';
import { AccountType, BPMarketSDK } from '../src';
import { CONNECTION, loadIDL, loadWallet, requestAirdrop } from './config';

async function resolveMarket() {
  console.log('=== Resolve Market Script ===\n');

  try {
    // Load wallet
    const walletKeypair = loadWallet();
    const wallet = new Wallet(walletKeypair);
    console.log('Wallet loaded:', walletKeypair.publicKey.toString());

    // Load markets
    const markets = JSON.parse(fs.readFileSync('./devnet-markets.json', 'utf-8'));
    if (markets.length === 0) {
      console.log('No markets found.');
      return;
    }

    // Use the most recent market
    const marketInfo = markets[markets.length - 1];
    const marketKey = new BN(marketInfo.marketKey);

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

    // Get market status
    const market = await sdk.fetchMarket(marketKey);
    const status = Object.keys(market.status)[0];

    console.log('Market Information:');
    console.log('  Key:', marketKey.toString());
    console.log('  Title:', market.title);
    console.log('  Status:', status);
    console.log('  Total Tokens:', market.marketTotalTokens.toNumber() / 10 ** 9);

    // Get answers
    const answers = await sdk.fetchAnswer(marketKey);
    console.log('\nAnswer Distribution:');
    answers.answers.forEach((answer) => {
      const percentage = market.marketTotalTokens.gt(new BN(0))
        ? (answer.answerTotalTokens.toNumber() / market.marketTotalTokens.toNumber() * 100).toFixed(2)
        : '0.00';
      console.log(`  Answer ${answer.answerKey}: ${answer.answerTotalTokens.toNumber() / 10 ** 9} tokens (${percentage}%)`);
    });

    // Check if market can be resolved
    if (status !== 'approve') {
      console.log(`\n⚠️ Market is not in 'approve' status (current: ${status}).`);
      if (status === 'success') {
        console.log('Market already resolved with correct answer:', market.correctAnswerKey.toString());
      } else if (status === 'adjourn') {
        console.log('Market already adjourned.');
      }
      return;
    }

    // Ask for resolution type
    console.log('\n📊 Resolution Options:');
    console.log('1. Mark as Success (declare winner)');
    console.log('2. Adjourn Market (refund all)');

    // For demo, we'll mark as success with answer 1 as winner
    const resolutionType = 'success';
    const correctAnswerKey = answers.answers[0].answerKey; // First answer wins

    if (resolutionType === 'success') {
      console.log(`\n🏆 Marking market as SUCCESS with winner: Answer ${correctAnswerKey}`);

      // First, set up fee accounts if needed
      const config = await sdk.fetchConfig();

      // Create fee recipient keypairs (for demo)
      const cojam = Keypair.generate();
      const charity = Keypair.generate();

      // Airdrop to fee accounts
      console.log('Setting up fee accounts...');
      await requestAirdrop(cojam.publicKey, 0.1 * 10 ** 9);
      await requestAirdrop(charity.publicKey, 0.1 * 10 ** 9);

      // Update fee accounts
      await sdk.setAccount(AccountType.CojamFee, cojam.publicKey, walletKeypair.publicKey);
      await sdk.setAccount(AccountType.CharityFee, charity.publicKey, walletKeypair.publicKey);
      console.log('Fee accounts updated');

      // Mark market as success
      const successTx = await sdk.successMarket(marketKey, correctAnswerKey, walletKeypair.publicKey);
      console.log('\n✅ Market marked as success!');
      console.log('Transaction:', successTx);

      // Get updated market
      const updatedMarket = await sdk.fetchMarket(marketKey);
      console.log('\nMarket Resolution Details:');
      console.log('  Status:', Object.keys(updatedMarket.status)[0]);
      console.log('  Correct Answer:', updatedMarket.correctAnswerKey.toString());
      console.log('  Success Time:', new Date(updatedMarket.successTime.toNumber() * 1000).toLocaleString());
      console.log('  Reward Base:', updatedMarket.marketRewardBaseTokens.toNumber() / 10 ** 9, 'tokens');

      // Calculate winner rewards
      const winnerAnswer = answers.answers.find(a => a.answerKey.eq(correctAnswerKey));
      if (winnerAnswer && winnerAnswer.answerTotalTokens.gt(new BN(0))) {
        console.log('\n💰 Winner Rewards:');
        console.log('  Total bet on winning answer:', winnerAnswer.answerTotalTokens.toNumber() / 10 ** 9, 'tokens');
        console.log('  Reward multiplier:', updatedMarket.marketRewardBaseTokens.toNumber() / winnerAnswer.answerTotalTokens.toNumber());
      }
    } else {
      console.log('\n⏸️ Adjourning market (all bets will be refunded)...');

      const adjournTx = await sdk.adjournMarket(marketKey, walletKeypair.publicKey);
      console.log('\n✅ Market adjourned!');
      console.log('Transaction:', adjournTx);

      const updatedMarket = await sdk.fetchMarket(marketKey);
      console.log('\nMarket Adjournment Details:');
      console.log('  Status:', Object.keys(updatedMarket.status)[0]);
      console.log('  Adjourn Time:', new Date(updatedMarket.adjournTime.toNumber() * 1000).toLocaleString());
      console.log('  All participants can claim 100% refund');
    }

    // Update saved market info
    marketInfo.status = Object.keys((await sdk.fetchMarket(marketKey)).status)[0];
    marketInfo.resolvedAt = new Date().toISOString();
    if (resolutionType === 'success') {
      marketInfo.correctAnswer = correctAnswerKey.toString();
    }

    const marketsFile = './devnet-markets.json';
    const allMarkets = JSON.parse(fs.readFileSync(marketsFile, 'utf-8'));
    const index = allMarkets.findIndex((m: any) => m.marketKey === marketInfo.marketKey);
    if (index >= 0) {
      allMarkets[index] = marketInfo;
      fs.writeFileSync(marketsFile, JSON.stringify(allMarkets, null, 2));
      console.log(`\n✅ Market resolution saved to ${marketsFile}`);
    }
  } catch (error) {
    console.error('\n❌ Error resolving market:', error);
    throw error;
  }
}

// Run the script
resolveMarket().then(() => {
  console.log('\n=== Market Resolution Complete ===');
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
