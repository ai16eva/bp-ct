#!/usr/bin/env ts-node

import * as fs from 'node:fs';

import { AnchorProvider, BN, Program, Wallet } from '@coral-xyz/anchor';
import { getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';

import type { BpMarket } from '../../target/types/bp_market';
import { BPMarketSDK } from '../src';
import { CONNECTION, loadIDL, loadWallet } from './config';

async function placeBet() {
  console.log('=== Place Bet Script ===\n');

  try {
    // Load wallet
    const walletKeypair = loadWallet();
    const wallet = new Wallet(walletKeypair);
    console.log('Wallet loaded:', walletKeypair.publicKey.toString());

    // Load saved config
    const configData = JSON.parse(fs.readFileSync('./devnet-config.json', 'utf-8'));
    const baseToken = new PublicKey(configData.baseToken);

    // Load markets
    const markets = JSON.parse(fs.readFileSync('./devnet-markets.json', 'utf-8'));
    if (markets.length === 0) {
      console.log('No markets found. Please run 02-create-market.ts first.');
      return;
    }

    // Use the most recent market
    const marketInfo = markets[markets.length - 1];
    const marketKey = new BN(marketInfo.marketKey);

    console.log('\nUsing market:');
    console.log('  Key:', marketKey.toString());
    console.log('  Title:', marketInfo.title);
    console.log('  Status:', marketInfo.status);

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

    // Check market status
    const market = await sdk.fetchMarket(marketKey);
    const status = Object.keys(market.status)[0];

    if (status !== 'approve') {
      console.log(`\n⚠️ Market is not in 'approve' status (current: ${status}). Cannot place bet.`);
      return;
    }

    // Get user's token account
    const userTokenAccount = await getOrCreateAssociatedTokenAccount(
      CONNECTION,
      walletKeypair,
      baseToken,
      walletKeypair.publicKey,
    );

    // Check token balance
    const tokenBalance = await CONNECTION.getTokenAccountBalance(userTokenAccount.address);
    console.log('\nToken balance:', tokenBalance.value.uiAmount ?? 0, 'tokens');

    // If balance is low, mint more tokens (only works if wallet is mint authority)
    if ((tokenBalance.value.uiAmount ?? 0) < 10) {
      console.log('Minting more tokens...');
      try {
        await mintTo(
          CONNECTION,
          walletKeypair,
          baseToken,
          userTokenAccount.address,
          walletKeypair.publicKey,
          100 * 10 ** 9, // 100 tokens
        );
        console.log('Minted 100 tokens');
      } catch (error) {
        console.log('Could not mint tokens (not mint authority)');
      }
    }

    // Get answers
    const answers = await sdk.fetchAnswer(marketKey);
    console.log('\nAvailable answers:');
    answers.answers.forEach((answer, index) => {
      const percentage = market.marketTotalTokens.gt(new BN(0))
        ? (answer.answerTotalTokens.toNumber() / market.marketTotalTokens.toNumber() * 100).toFixed(2)
        : '0.00';
      console.log(`  ${index + 1}. Answer ${answer.answerKey}: ${answer.answerTotalTokens.toString()} tokens (${percentage}%)`);
    });

    // Choose an answer (using first answer for demo)
    const answerKey = answers.answers[0].answerKey;
    const betAmount = new BN(10 * 10 ** 9); // 10 tokens

    console.log('\n💰 Placing bet:');
    console.log('  Answer:', answerKey.toString());
    console.log('  Amount:', betAmount.toNumber() / 10 ** 9, 'tokens');

    // Build and send the bet transaction
    const betTx = await sdk.bet(marketKey, answerKey, betAmount, walletKeypair.publicKey);

    console.log('\n✅ Bet placed successfully!');
    console.log('Transaction:', betTx);

    // Fetch updated market data
    const updatedMarket = await sdk.fetchMarket(marketKey);
    const updatedAnswers = await sdk.fetchAnswer(marketKey);
    const betting = await sdk.fetchBetting(walletKeypair.publicKey, marketKey, answerKey);

    console.log('\n📊 Updated Market Stats:');
    console.log('  Total Tokens:', updatedMarket.marketTotalTokens.toNumber() / 10 ** 9);
    console.log('  Remain Tokens:', updatedMarket.marketRemainTokens.toNumber() / 10 ** 9);

    console.log('\n📊 Updated Answer Distribution:');
    updatedAnswers.answers.forEach((answer) => {
      const percentage = updatedMarket.marketTotalTokens.gt(new BN(0))
        ? (answer.answerTotalTokens.toNumber() / updatedMarket.marketTotalTokens.toNumber() * 100).toFixed(2)
        : '0.00';
      console.log(`  Answer ${answer.answerKey}: ${answer.answerTotalTokens.toNumber() / 10 ** 9} tokens (${percentage}%)`);
    });

    console.log('\n👤 Your Bet:');
    console.log('  Answer:', betting.answerKey.toString());
    console.log('  Amount:', betting.tokens.toNumber() / 10 ** 9, 'tokens');
    console.log('  Placed at:', new Date(betting.createTime.toNumber() * 1000).toLocaleString());

    // Calculate potential winnings
    const winnings = await sdk.calculateWinnings(walletKeypair.publicKey, marketKey, answerKey);
    if (winnings) {
      console.log('  Potential winnings:', winnings.toNumber() / 10 ** 9, 'tokens');
    }

    // Save bet info
    const betInfo = {
      marketKey: marketKey.toString(),
      voter: walletKeypair.publicKey.toString(),
      answerKey: answerKey.toString(),
      amount: betAmount.toString(),
      transaction: betTx,
      timestamp: new Date().toISOString(),
    };

    const betsFile = './devnet-bets.json';
    let bets = [];
    if (fs.existsSync(betsFile)) {
      bets = JSON.parse(fs.readFileSync(betsFile, 'utf-8'));
    }
    bets.push(betInfo);
    fs.writeFileSync(betsFile, JSON.stringify(bets, null, 2));
    console.log(`\n✅ Bet saved to ${betsFile}`);
  } catch (error) {
    console.error('\n❌ Error placing bet:', error);
    throw error;
  }
}

// Run the script
placeBet().then(() => {
  console.log('\n=== Bet Placement Complete ===');
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
