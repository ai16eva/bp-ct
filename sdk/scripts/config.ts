import * as fs from 'node:fs';
import * as path from 'node:path';

import { clusterApiUrl, Connection, Keypair, PublicKey } from '@solana/web3.js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Network Configuration
const network = process.env.SOLANA_NETWORK || 'devnet';
export const DEVNET_URL = process.env.SOLANA_RPC_URL || clusterApiUrl(network as any);
export const CONNECTION = new Connection(DEVNET_URL, 'confirmed');

// Load wallet from environment variable or fallback
export function loadWallet(): Keypair {
  let walletData: number[];

  if (process.env.WALLET_PRIVATE_KEY) {
    // Parse wallet from environment variable
    try {
      walletData = JSON.parse(process.env.WALLET_PRIVATE_KEY);
    } catch (error) {
      console.error('Failed to parse WALLET_PRIVATE_KEY from .env file');
      throw new Error('Invalid WALLET_PRIVATE_KEY format. Should be a JSON array of numbers.');
    }
  } else {
    // Fallback to hardcoded wallet (not recommended for production)
    console.warn('⚠️  Using hardcoded wallet. Please set WALLET_PRIVATE_KEY in .env file.');
    walletData = [30, 202, 74, 81, 1, 158, 43, 203, 56, 217, 118, 87, 254, 14, 156, 21, 43, 117, 127, 227, 79, 108, 242, 46, 200, 229, 96, 128, 44, 5, 254, 20, 105, 249, 112, 21, 241, 48, 95, 215, 111, 47, 254, 68, 246, 95, 137, 200, 146, 0, 160, 17, 142, 51, 14, 92, 216, 30, 42, 253, 164, 146, 38, 169];
  }

  return Keypair.fromSecretKey(Buffer.from(walletData));
}

// Load IDL
export function loadIDL() {
  const idlPath = path.join(__dirname, '../../target/idl/bp_market.json');
  return JSON.parse(fs.readFileSync(idlPath, 'utf-8'));
}

// Token mint for testing (you can change this to your preferred SPL token)
// This is USDC-Dev on devnet
export const TEST_TOKEN_MINT = new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr');

// Helper to request airdrop
export async function requestAirdrop(publicKey: PublicKey, amount = 1_000_000_000) {
  console.log(`Requesting airdrop of ${amount / 1_000_000_000} SOL to ${publicKey.toString()}`);
  const signature = await CONNECTION.requestAirdrop(publicKey, amount);
  const latestBlockhash = await CONNECTION.getLatestBlockhash();
  await CONNECTION.confirmTransaction({
    signature,
    ...latestBlockhash,
  });
  console.log('Airdrop confirmed');
  return signature;
}

// Helper to check SOL balance
export async function checkBalance(publicKey: PublicKey): Promise<number> {
  const balance = await CONNECTION.getBalance(publicKey);
  return balance / 1_000_000_000;
}

export default {
  DEVNET_URL,
  CONNECTION,
  loadWallet,
  loadIDL,
  TEST_TOKEN_MINT,
  requestAirdrop,
  checkBalance,
};
