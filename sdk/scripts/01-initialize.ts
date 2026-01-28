#!/usr/bin/env ts-node

import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor';
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from '@solana/spl-token';

import type { BpMarket } from '../../target/types/bp_market';
import { BPMarketSDK } from '../src';
import {
  checkBalance,
  CONNECTION,
  loadIDL,
  loadWallet,
  requestAirdrop,
} from './config';

async function initialize() {
  console.log('=== BP Market Initialization Script ===\n');

  try {
    // Load wallet keypair
    const walletKeypair = loadWallet();
    console.log('Wallet loaded:', walletKeypair.publicKey.toString());

    // Check balance
    const balance = await checkBalance(walletKeypair.publicKey);
    console.log('Wallet balance:', balance, 'SOL');

    // Request airdrop if balance is low
    if (balance < 0.5) {
      console.log('Balance low, requesting airdrop...');
      await requestAirdrop(walletKeypair.publicKey);
    }

    // Create Anchor wallet wrapper
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
    console.log('\nSDK initialized successfully');

    // Check if already initialized
    try {
      const config = await sdk.fetchConfig();
      console.log('\n⚠️  Config already initialized!');
      console.log('Owner:', config.owner.toString());
      console.log('Base Token:', config.baseToken.toString());
      console.log(
        '\nIf you want to reinitialize, you need to deploy a new program.',
      );
      return;
    } catch (error) {
      console.log('\n✅ Config not initialized yet, proceeding...');
    }

    // Create a new token mint for betting
    console.log('\n📝 Creating betting token mint...');
    const mintKeypair = await createMint(
      CONNECTION,
      walletKeypair,
      walletKeypair.publicKey,
      walletKeypair.publicKey,
      9, // 9 decimals like SOL
      undefined,
      { commitment: 'confirmed' },
    );

    console.log('Token mint created:', mintKeypair.toString());

    // Initialize the config
    console.log('\n🚀 Initializing BP Market config...');
    const initTx = await sdk.initialize(mintKeypair, walletKeypair.publicKey);
    console.log('Initialization transaction:', initTx);

    // Fetch and display the initialized config
    const config = await sdk.fetchConfig();
    console.log('\n✅ Config initialized successfully!');
    console.log('\nConfig Details:');
    console.log('  Owner:', config.owner.toString());
    console.log('  Base Token:', config.baseToken.toString());
    console.log('  Cojam Fee Account:', config.cojamFeeAccount.toString());
    console.log('  Charity Fee Account:', config.charityFeeAccount.toString());
    console.log('  Remain Account:', config.remainAccount.toString());

    // Create token account for owner
    console.log('\n💰 Creating token account for owner...');
    const ownerTokenAccount = await getOrCreateAssociatedTokenAccount(
      CONNECTION,
      walletKeypair,
      mintKeypair,
      walletKeypair.publicKey,
    );
    console.log('Owner token account:', ownerTokenAccount.address.toString());

    // Mint some tokens for testing
    console.log('\n🪙 Minting test tokens...');
    const mintAmount = 1000 * 10 ** 9; // 1000 tokens
    await mintTo(
      CONNECTION,
      walletKeypair,
      mintKeypair,
      ownerTokenAccount.address,
      walletKeypair.publicKey,
      mintAmount,
    );
    console.log(`Minted ${mintAmount / 10 ** 9} tokens to owner`);

    // Save important addresses
    const configData = {
      configPDA: sdk.getConfigPDA().toString(),
      owner: walletKeypair.publicKey.toString(),
      baseToken: mintKeypair.toString(),
      ownerTokenAccount: ownerTokenAccount.address.toString(),
      timestamp: new Date().toISOString(),
    };

    console.log('\n📋 Important Addresses (save these):');
    console.log(JSON.stringify(configData, null, 2));

    // Save to file
    const fs = require('node:fs');
    const configPath = './devnet-config.json';
    fs.writeFileSync(configPath, JSON.stringify(configData, null, 2));
    console.log(`\n✅ Configuration saved to ${configPath}`);
  } catch (error) {
    console.error('\n❌ Error during initialization:', error);
    throw error;
  }
}

// Run the initialization
initialize()
  .then(() => {
    console.log('\n=== Initialization Complete ===');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
