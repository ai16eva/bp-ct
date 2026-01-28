#!/usr/bin/env ts-node

// PublicKey import removed as it's not used in this file
import * as fs from 'node:fs';

import { AnchorProvider, BN, Program, Wallet } from '@coral-xyz/anchor';

import type { BpMarket } from '../../target/types/bp_market';
import { BPMarketSDK } from '../src';
import { CONNECTION, loadIDL, loadWallet } from './config';

async function claimRewards() {
  console.log('=== Claim Rewards Script ===\n');

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

    // Get all user bets
    const userBets = await sdk.getUserBets(walletKeypair.publicKey);
    console.log(`Found ${userBets.length} bets\n`);

    if (userBets.length === 0) {
      console.log('No bets found. Place some bets first using 03-place-bet.ts');
      return;
    }

    // Check each bet for claimable rewards
    const claimableBets = [];

    for (const { publicKey: betPDA, account: bet } of userBets) {
      const market = await sdk.fetchMarket(bet.marketKey);
      const status = Object.keys(market.status)[0];

      console.log(`Checking Market ${bet.marketKey.toString()}, Answer ${bet.answerKey.toString()}:`);
      console.log(`  Market Status: ${status}`);
      console.log(`  Your Bet: ${bet.tokens.toNumber() / 10 ** 9} tokens`);

      if (status === 'success' || status === 'adjourn') {
        const available = await sdk.availableReceiveTokens(bet.marketKey, betPDA);
        console.log(`  Available to claim: ${available.toNumber() / 10 ** 9} tokens`);

        if (available.gt(new BN(0))) {
          claimableBets.push({
            marketKey: bet.marketKey,
            answerKey: bet.answerKey,
            betPDA,
            available,
            isWinner: status === 'success' && market.correctAnswerKey.eq(bet.answerKey),
            originalBet: bet.tokens,
          });
          console.log(`  ✅ Can claim!`);
        } else {
          if (status === 'success') {
            console.log(`  ❌ Lost bet (correct answer was ${market.correctAnswerKey.toString()})`);
          }
        }
      } else {
        console.log(`  ⏳ Market not resolved yet`);
      }
      console.log('');
    }

    if (claimableBets.length === 0) {
      console.log('No rewards available to claim.');
      return;
    }

    // Claim all available rewards
    console.log(`\n💰 Claiming rewards from ${claimableBets.length} bet(s)...\n`);

    // Config data is loaded by the SDK when needed

    for (const claim of claimableBets) {
      console.log(`Claiming from Market ${claim.marketKey.toString()}, Answer ${claim.answerKey.toString()}`);
      console.log(`  Original bet: ${claim.originalBet.toNumber() / 10 ** 9} tokens`);
      console.log(`  Claiming: ${claim.available.toNumber() / 10 ** 9} tokens`);

      if (claim.isWinner) {
        const returnRate = claim.available.mul(new BN(100)).div(claim.originalBet).toNumber();
        console.log(`  🏆 Winner! Return: ${returnRate}%`);
      } else {
        console.log(`  🔄 Refund (market adjourned)`);
      }

      try {
        // Claim the rewards
        const claimTx = await sdk.receiveToken(claim.marketKey, claim.answerKey, walletKeypair.publicKey);

        console.log(`  ✅ Claimed! Transaction: ${claimTx.slice(0, 8)}...`);

        // Save claim info
        const claimInfo = {
          marketKey: claim.marketKey.toString(),
          answerKey: claim.answerKey.toString(),
          amount: claim.available.toString(),
          isWinner: claim.isWinner,
          transaction: claimTx,
          timestamp: new Date().toISOString(),
        };

        const claimsFile = './devnet-claims.json';
        let claims = [];
        if (fs.existsSync(claimsFile)) {
          claims = JSON.parse(fs.readFileSync(claimsFile, 'utf-8'));
        }
        claims.push(claimInfo);
        fs.writeFileSync(claimsFile, JSON.stringify(claims, null, 2));
      } catch (error) {
        console.log(`  ❌ Failed to claim: ${error}`);
      }
      console.log('');
    }

    // Show summary
    console.log('📊 CLAIM SUMMARY');
    console.log('================');
    const totalClaimed = claimableBets.reduce((sum, claim) =>
      sum.add(claim.available), new BN(0));
    const totalOriginal = claimableBets.reduce((sum, claim) =>
      sum.add(claim.originalBet), new BN(0));

    console.log(`Total Original Bets: ${totalOriginal.toNumber() / 10 ** 9} tokens`);
    console.log(`Total Claimed: ${totalClaimed.toNumber() / 10 ** 9} tokens`);

    const profit = totalClaimed.sub(totalOriginal);
    if (profit.gt(new BN(0))) {
      const profitPercent = profit.mul(new BN(100)).div(totalOriginal).toNumber();
      console.log(`Profit: ${profit.toNumber() / 10 ** 9} tokens (+${profitPercent}%)`);
    } else if (profit.lt(new BN(0))) {
      const lossPercent = profit.abs().mul(new BN(100)).div(totalOriginal).toNumber();
      console.log(`Loss: ${profit.abs().toNumber() / 10 ** 9} tokens (-${lossPercent}%)`);
    } else {
      console.log('Break even (full refund)');
    }
  } catch (error) {
    console.error('\n❌ Error claiming rewards:', error);
    throw error;
  }
}

// Run the script
claimRewards().then(() => {
  console.log('\n=== Claim Complete ===');
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
