#!/usr/bin/env ts-node

import * as fs from 'node:fs';

import { AnchorProvider, BN, Program, Wallet } from '@coral-xyz/anchor';

import type { BpMarket } from '../../target/types/bp_market';
import { BPMarketSDK } from '../src';
import { CONNECTION, loadIDL, loadWallet } from './config';

async function createMarket() {
  console.log('=== Create Market Script ===\n');

  try {
    // Load wallet
    const walletKeypair = loadWallet();
    console.log('Wallet loaded:', walletKeypair.publicKey.toString());

    // Create Anchor wallet
    const wallet = new Wallet(walletKeypair);

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

    // Generate unique market key based on timestamp
    const marketKey = new BN(Date.now());

    // Market configuration
    const marketData = {
      marketKey,
      creator: walletKeypair.publicKey,
      title: 'Who will win the 2024 Championship?',
      createFee: new BN(1000000), // 0.001 tokens
      creatorFeePercentage: new BN(100), // 1%
      serviceFeePercentage: new BN(200), // 2%
      charityFeePercentage: new BN(50), // 0.5%
      answerKeys: [
        new BN(1), // Team A
        new BN(2), // Team B
        new BN(3), // Team C
        new BN(4), // Team D
      ],
    };

    console.log('Creating market with configuration:');
    console.log('  Market Key:', marketKey.toString());
    console.log('  Title:', marketData.title);
    console.log('  Creator:', marketData.creator.toString());
    console.log('  Answers:', marketData.answerKeys.length);
    console.log('  Total Fees:', (marketData.creatorFeePercentage.toNumber()
    + marketData.serviceFeePercentage.toNumber()
    + marketData.charityFeePercentage.toNumber()) / 100, '%');

    // Create the market
    console.log('\n📝 Publishing market...');
    const publishTx = await sdk.publishMarket(marketData, walletKeypair.publicKey);
    console.log('Publish transaction:', publishTx);

    // Fetch and display market details
    const market = await sdk.fetchMarket(marketKey);
    console.log('\n✅ Market created successfully!');
    console.log('\nMarket Details:');
    console.log('  Status:', Object.keys(market.status)[0]);
    console.log('  Creator:', market.creator.toString());
    console.log('  Title:', market.title);

    // Fetch answers
    const answers = await sdk.fetchAnswer(marketKey);
    console.log('\nAnswers:');
    answers.answers.forEach((answer) => {
      console.log(`  Answer ${answer.answerKey}: Total Tokens = ${answer.answerTotalTokens}`);
    });

    // Approve the market
    console.log('\n🎯 Approving market...');
    const approveTx = await sdk.approveMarket(marketKey, walletKeypair.publicKey);
    console.log('Approve transaction:', approveTx);

    // Check updated status
    const updatedMarket = await sdk.fetchMarket(marketKey);
    console.log('\n✅ Market approved!');
    console.log('  Status:', Object.keys(updatedMarket.status)[0]);
    console.log('  Approve Time:', new Date(updatedMarket.approveTime.toNumber() * 1000).toLocaleString());

    // Save market data
    const marketInfo = {
      marketKey: marketKey.toString(),
      marketPDA: sdk.getMarketPDA(marketKey).toString(),
      answerPDA: sdk.getAnswerPDA(marketKey).toString(),
      title: marketData.title,
      creator: marketData.creator.toString(),
      answerKeys: marketData.answerKeys.map(k => k.toString()),
      status: Object.keys(updatedMarket.status)[0],
      timestamp: new Date().toISOString(),
    };

    console.log('\n📋 Market Information:');
    console.log(JSON.stringify(marketInfo, null, 2));

    // Save to file
    const marketsFile = './devnet-markets.json';
    let markets = [];
    if (fs.existsSync(marketsFile)) {
      markets = JSON.parse(fs.readFileSync(marketsFile, 'utf-8'));
    }
    markets.push(marketInfo);
    fs.writeFileSync(marketsFile, JSON.stringify(markets, null, 2));
    console.log(`\n✅ Market saved to ${marketsFile}`);
  } catch (error) {
    console.error('\n❌ Error creating market:', error);
    throw error;
  }
}

// Run the script
createMarket().then(() => {
  console.log('\n=== Market Creation Complete ===');
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
