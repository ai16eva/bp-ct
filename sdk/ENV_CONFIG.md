# Environment Configuration Guide

## Setup

1. **Install dependencies**:
   ```bash
   npm install dotenv
   ```

2. **Create `.env` file**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

3. **Configure your wallet**:
   Edit `.env` and set your wallet private key:
   ```env
   WALLET_PRIVATE_KEY=[1,2,3,...,64]
   ```

## Configuration Options

### Required
- `WALLET_PRIVATE_KEY`: Your Solana wallet private key as a JSON array of bytes

### Optional
- `SOLANA_NETWORK`: Network to connect to (mainnet-beta, devnet, testnet, localnet). Default: `devnet`
- `SOLANA_RPC_URL`: Custom RPC endpoint URL. Default: uses cluster URL for selected network
- `PROGRAM_ID`: BP Market program ID. Default: `HEWGHU2byaRN4KwyH58vz2JbXywght1PRuSxLM5i8ped`

## Getting Your Wallet Private Key

### From Solana CLI
If you have a wallet created with Solana CLI:
```bash
cat ~/.config/solana/id.json
```

### From Phantom/Other Wallets
1. Export your private key from your wallet (usually in base58 format)
2. Convert to byte array using Node.js:
   ```javascript
   const bs58 = require('bs58');
   const privateKey = 'your-base58-private-key-here';
   const bytes = Array.from(bs58.decode(privateKey));
   console.log(JSON.stringify(bytes));
   ```

## Security Best Practices

⚠️ **IMPORTANT**: Never commit your `.env` file to version control!

1. The `.env` file is included in `.gitignore`
2. Never share your private key
3. Use different wallets for development and production
4. Consider using hardware wallets for production

## Using Environment Variables in Code

### In Scripts
```typescript
import * as dotenv from 'dotenv';
dotenv.config();

// Wallet will be loaded from WALLET_PRIVATE_KEY env var
const wallet = loadWallet();
```

### Custom Configuration
```typescript
// Access any env variable
const network = process.env.SOLANA_NETWORK || 'devnet';
const rpcUrl = process.env.SOLANA_RPC_URL || clusterApiUrl(network);
```

## Multiple Environments

Create environment-specific files:
- `.env.development`
- `.env.production`
- `.env.testnet`

Load specific environment:
```typescript
import * as dotenv from 'dotenv';
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
```

## Troubleshooting

### Invalid WALLET_PRIVATE_KEY format
Ensure your private key is a valid JSON array:
```env
# ✅ Correct
WALLET_PRIVATE_KEY=[30,202,74,81,...]

# ❌ Wrong (missing brackets)
WALLET_PRIVATE_KEY=30,202,74,81,...

# ❌ Wrong (quotes around array)
WALLET_PRIVATE_KEY="[30,202,74,81,...]"
```

### Environment variables not loading
1. Check `.env` file exists in the SDK root directory
2. Ensure `dotenv` is installed: `npm install dotenv`
3. Check file permissions on `.env`
