import * as fs from 'node:fs';
import * as path from 'node:path';

import { AnchorProvider, BN, Program } from '@coral-xyz/anchor';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';

import type { BpMarket } from '../../target/types/bp_market';
import { BPMarketSDK } from '../src';

/**
 * Example demonstrating how to get market fee information
 */
async function getMarketFeeExample() {
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

  // Example market key
  const marketKey = new BN(1);

  try {
    console.log('\n=== Market Fee Information ===');

    // Method 1: Get basic fee information using getMarketFee
    const marketFee = await sdk.getMarketFee(marketKey);
    console.log('\nBasic Fee Information (getMarketFee):');
    console.log('  Creator Fee Amount:', marketFee.creatorFee.toString());
    console.log('  Creator Fee Percentage:', marketFee.creatorFeePercentage.toNumber() / 100, '%');
    console.log('  Service Fee Percentage:', marketFee.serviceFeePercentage.toNumber() / 100, '%');
    console.log('  Charity Fee Percentage:', marketFee.charityFeePercentage.toNumber() / 100, '%');

    // Method 2: Get extended fee information using getMarketFees (includes total)
    const marketFees = await sdk.getMarketFees(marketKey);
    console.log('\nExtended Fee Information (getMarketFees):');
    console.log('  Creator Fee Amount:', marketFees.creatorFee.toString());
    console.log('  Creator Fee Percentage:', marketFees.creatorFeePercentage.toNumber() / 100, '%');
    console.log('  Service Fee Percentage:', marketFees.serviceFeePercentage.toNumber() / 100, '%');
    console.log('  Charity Fee Percentage:', marketFees.charityFeePercentage.toNumber() / 100, '%');
    console.log('  Total Fee Percentage:', marketFees.totalFeePercentage, '%');

    // Calculate fee distribution for a hypothetical bet amount
    const hypotheticalBet = new BN(1000000000); // 1 token (1 billion lamports)
    console.log('\n=== Fee Distribution for 1 Token Bet ===');

    const creatorFeeAmount = hypotheticalBet
      .mul(marketFee.creatorFeePercentage)
      .div(new BN(10000));
    const serviceFeeAmount = hypotheticalBet
      .mul(marketFee.serviceFeePercentage)
      .div(new BN(10000));
    const charityFeeAmount = hypotheticalBet
      .mul(marketFee.charityFeePercentage)
      .div(new BN(10000));

    console.log('  Creator receives:', creatorFeeAmount.toString(), 'lamports');
    console.log('  Service receives:', serviceFeeAmount.toString(), 'lamports');
    console.log('  Charity receives:', charityFeeAmount.toString(), 'lamports');

    const totalFees = creatorFeeAmount.add(serviceFeeAmount).add(charityFeeAmount);
    const rewardPool = hypotheticalBet.sub(totalFees);
    console.log('  Total fees:', totalFees.toString(), 'lamports');
    console.log('  Reward pool:', rewardPool.toString(), 'lamports');

    // Get market info to see actual reward base
    const marketInfo = await sdk.getMarketInfo(marketKey);
    if (marketInfo.status === 'success') {
      console.log('\n=== Actual Market Reward Pool ===');
      console.log('  Total Tokens Bet:', marketInfo.totalTokens.toString());
      console.log('  Reward Base Tokens:', marketInfo.rewardBaseTokens.toString());

      const actualFeesTaken = marketInfo.totalTokens.sub(marketInfo.rewardBaseTokens);
      console.log('  Actual Fees Taken:', actualFeesTaken.toString());

      if (!marketInfo.totalTokens.isZero()) {
        const actualFeePercentage = actualFeesTaken
          .mul(new BN(10000))
          .div(marketInfo.totalTokens)
          .toNumber() / 100;
        console.log('  Actual Fee Percentage:', actualFeePercentage, '%');
      }
    }

    // Compare different fee structures
    console.log('\n=== Fee Structure Comparison ===');
    const scenarios = [
      { creator: 100, service: 200, charity: 50 }, // Current
      { creator: 200, service: 300, charity: 100 }, // Higher fees
      { creator: 50, service: 100, charity: 25 }, // Lower fees
    ];

    for (const scenario of scenarios) {
      const total = (scenario.creator + scenario.service + scenario.charity) / 100;
      console.log(`\nScenario - Creator: ${scenario.creator / 100}%, Service: ${scenario.service / 100}%, Charity: ${scenario.charity / 100}%`);
      console.log(`  Total Fee: ${total}%`);
      console.log(`  Reward Pool: ${100 - total}%`);
    }
  } catch (error) {
    console.error('Error getting market fees:', error);
  }
}

// Run the example
getMarketFeeExample().then(() => {
  console.log('\n=== Fee Information Retrieved Successfully ===');
}).catch(console.error);
