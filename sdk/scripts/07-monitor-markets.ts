#!/usr/bin/env ts-node

// PublicKey import removed as it's not used in this file
import * as fs from 'node:fs';

import { AnchorProvider, BN, Program, Wallet } from '@coral-xyz/anchor';

import type { BpMarket } from '../../target/types/bp_market';
import { BPMarketSDK } from '../src';
import { CONNECTION, loadIDL, loadWallet } from './config';

async function monitorMarkets() {
  console.log('=== Market Monitor Script ===\n');

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

    // Monitor function
    const displayMarketStatus = async () => {
      console.clear();
      console.log('=== BP MARKET MONITOR ===');
      console.log('Time:', new Date().toLocaleString());
      console.log('========================\n');

      // Get all markets
      const allMarkets = await sdk.getAllMarkets();

      // Group by status
      const marketsByStatus: Record<string, any[]> = {
        prepare: [],
        approve: [],
        success: [],
        adjourn: [],
      };

      for (const { publicKey, account } of allMarkets) {
        const status = Object.keys(account.status)[0];
        marketsByStatus[status].push({ publicKey, account });
      }

      // Display markets by status
      console.log('📊 ACTIVE MARKETS (approve):', marketsByStatus.approve.length);
      for (const { account } of marketsByStatus.approve) {
        const answers = await sdk.fetchAnswer(account.marketKey);
        const totalTokens = account.marketTotalTokens.toNumber() / 10 ** 9;

        console.log(`\n  Market ${account.marketKey.toString()}:`);
        console.log(`    Title: ${account.title}`);
        console.log(`    Total Bets: ${totalTokens} tokens`);
        console.log(`    Distribution:`);

        answers.answers.forEach((answer) => {
          const percentage = totalTokens > 0
            ? (answer.answerTotalTokens.toNumber() / account.marketTotalTokens.toNumber() * 100).toFixed(2)
            : '0.00';
          const bar = '█'.repeat(Math.floor(Number(percentage) / 5));
          console.log(`      Answer ${answer.answerKey}: ${bar} ${percentage}%`);
        });
      }

      console.log('\n⏳ PENDING MARKETS (prepare):', marketsByStatus.prepare.length);
      for (const { account } of marketsByStatus.prepare) {
        console.log(`  - ${account.title} (Key: ${account.marketKey.toString()})`);
      }

      console.log('\n✅ RESOLVED MARKETS (success):', marketsByStatus.success.length);
      for (const { account } of marketsByStatus.success) {
        console.log(`  - ${account.title}`);
        console.log(`    Winner: Answer ${account.correctAnswerKey.toString()}`);
        console.log(`    Resolved: ${new Date(account.successTime.toNumber() * 1000).toLocaleDateString()}`);
      }

      console.log('\n🔄 ADJOURNED MARKETS:', marketsByStatus.adjourn.length);
      for (const { account } of marketsByStatus.adjourn) {
        console.log(`  - ${account.title}`);
        console.log(`    Adjourned: ${new Date(account.adjournTime.toNumber() * 1000).toLocaleDateString()}`);
      }

      // Get recent bets
      console.log('\n📈 RECENT ACTIVITY:');
      const allBets = await program.account.bettingAccount.all();
      const recentBets = allBets
        .sort((a, b) => b.account.createTime.toNumber() - a.account.createTime.toNumber())
        .slice(0, 5);

      for (const bet of recentBets) {
        const market = await sdk.fetchMarket(bet.account.marketKey);
        console.log(`  ${new Date(bet.account.createTime.toNumber() * 1000).toLocaleTimeString()} - `
        + `${bet.account.voter.toString().slice(0, 8)}... bet ${bet.account.tokens.toNumber() / 10 ** 9} tokens `
        + `on Answer ${bet.account.answerKey} in "${market.title.slice(0, 30)}..."`);
      }

      // Calculate platform statistics
      console.log('\n📊 PLATFORM STATISTICS:');
      let totalVolume = new BN(0);
      const totalMarkets = allMarkets.length;
      const totalBetsCount = allBets.length;

      for (const { account } of allMarkets) {
        totalVolume = totalVolume.add(account.marketTotalTokens);
      }

      console.log(`  Total Markets: ${totalMarkets}`);
      console.log(`  Total Bets: ${totalBetsCount}`);
      console.log(`  Total Volume: ${totalVolume.toNumber() / 10 ** 9} tokens`);
      console.log(`  Average per Market: ${totalMarkets > 0 ? (totalVolume.toNumber() / totalMarkets / 10 ** 9).toFixed(2) : 0} tokens`);

      // User stats
      console.log('\n👤 YOUR STATISTICS:');
      const userBets = await sdk.getUserBets(walletKeypair.publicKey);
      const userTotalBet = userBets.reduce((sum, bet) =>
        sum.add(bet.account.tokens), new BN(0));

      let pendingRewards = new BN(0);
      for (const { publicKey: betPDA, account: bet } of userBets) {
        const available = await sdk.availableReceiveTokens(bet.marketKey, betPDA);
        pendingRewards = pendingRewards.add(available);
      }

      console.log(`  Total Bets: ${userBets.length}`);
      console.log(`  Total Wagered: ${userTotalBet.toNumber() / 10 ** 9} tokens`);
      console.log(`  Pending Rewards: ${pendingRewards.toNumber() / 10 ** 9} tokens`);

      // Save snapshot
      const snapshot = {
        timestamp: new Date().toISOString(),
        totalMarkets,
        activeMarkets: marketsByStatus.approve.length,
        resolvedMarkets: marketsByStatus.success.length,
        totalVolume: totalVolume.toString(),
        totalBets: totalBetsCount,
      };

      const snapshotsFile = './devnet-snapshots.json';
      let snapshots = [];
      if (fs.existsSync(snapshotsFile)) {
        snapshots = JSON.parse(fs.readFileSync(snapshotsFile, 'utf-8'));
      }
      snapshots.push(snapshot);
      // Keep only last 100 snapshots
      if (snapshots.length > 100) {
        snapshots = snapshots.slice(-100);
      }
      fs.writeFileSync(snapshotsFile, JSON.stringify(snapshots, null, 2));
    };

    // Initial display
    await displayMarketStatus();

    // Set up interval for updates
    console.log('\n\n🔄 Monitoring markets... (updates every 10 seconds)');
    console.log('Press Ctrl+C to stop\n');

    setInterval(async () => {
      try {
        await displayMarketStatus();
      } catch (error) {
        console.error('Error updating display:', error);
      }
    }, 10000); // Update every 10 seconds
  } catch (error) {
    console.error('\n❌ Error monitoring markets:', error);
    throw error;
  }
}

// Run the script
monitorMarkets().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
