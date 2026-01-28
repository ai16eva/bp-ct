# Forecast Exchange Documentation

## Overview

The Forecast Exchange program provides a 1:1 stablecoin exchange mechanism between USDT and USDP tokens with configurable fees and owner-controlled liquidity management.

## Table of Contents

1. [Architecture](#architecture)
2. [Program Structure](#program-structure)
3. [SDK Integration](#sdk-integration)
4. [API Reference](#api-reference)
5. [Examples](#examples)
6. [Testing](#testing)

---

## Architecture

### Core Concepts

The Forecast Exchange operates as a simple order book exchange where:
- **Owner provides liquidity** for both USDT and USDP tokens
- **Users can buy USDP** with USDT at a 1:1 rate minus fees
- **Users can sell USDP** for USDT at a 1:1 rate minus fees
- **Fees are configurable** by the owner (in basis points)
- **Owner must sign** all buy/sell transactions to authorize liquidity transfers

### Key Features

- ✅ 1:1 exchange rate between USDT and USDP
- ✅ Configurable exchange fees (in basis points)
- ✅ Pause/unpause exchange functionality
- ✅ Owner-controlled liquidity
- ✅ Fee withdrawal mechanism
- ✅ Ownership transfer capability
- ✅ Volume tracking

### Account Structure

```
ExchangeState (PDA: seeds = ["exchange"])
├── owner: Pubkey                    // Exchange owner
├── usdt_mint: Pubkey                // USDT mint address
├── usdp_mint: Pubkey                // USDP mint address
├── owner_usdt_account: Pubkey       // Owner's USDT token account
├── owner_usdp_account: Pubkey       // Owner's USDP token account
├── exchange_fee_bps: u16            // Fee in basis points (1 = 0.01%)
├── is_paused: bool                  // Pause state
├── total_volume_traded: u64         // Total volume in lamports
└── bump: u8                         // PDA bump seed
```

---

## Program Structure

### Program ID

```
Program ID: 73Bwxzt1QUVjkP1rkLTEraPScRLhxhukGXWuZNDSxbs8
```

### Instructions

#### Admin Instructions

1. **initializeExchange**
   - Initialize the exchange state
   - Sets up owner token accounts
   - Configures initial fee

2. **updateFee**
   - Update exchange fee basis points
   - Owner-only operation

3. **pauseExchange**
   - Pause all trading operations
   - Owner-only operation

4. **unpauseExchange**
   - Resume trading operations
   - Owner-only operation

5. **transferOwnership**
   - Transfer exchange ownership to new owner
   - Creates new owner token accounts

6. **withdrawFees**
   - Withdraw collected fees to recipient
   - Owner-only operation

#### User Instructions

7. **buyUsdp**
   - Buy USDP tokens with USDT
   - Requires both buyer and owner signatures

8. **sellUsdp**
   - Sell USDP tokens for USDT
   - Requires both seller and owner signatures

---

## SDK Integration

### Installation

```bash
npm install @bp-market/sdk
```

### Initialization

```typescript
import { ForecastExchangeSDK } from '@bp-market/sdk';
import { Connection } from '@solana/web3.js';

const connection = new Connection('https://api.devnet.solana.com');
const sdk = new ForecastExchangeSDK(connection);
```

### Basic Usage

```typescript
import { BN } from '@coral-xyz/anchor';
import { Keypair, PublicKey } from '@solana/web3.js';

// Get exchange state
const exchangeState = await sdk.fetchExchangeState();

// Check if paused
const isPaused = await sdk.isExchangePaused();

// Get current fee
const feeBps = await sdk.getExchangeFee(); // Returns basis points (e.g., 50 = 0.5%)
```

---

## API Reference

### Class: ForecastExchangeSDK

#### Constructor

```typescript
constructor(connection: Connection, programOrProvider?: Program<ForecastExchange> | Provider)
```

**Parameters:**
- `connection`: Solana RPC connection
- `programOrProvider`: (Optional) Custom program or provider

---

### Admin Methods

#### initializeExchange()

Initialize the exchange with configuration.

```typescript
async initializeExchange(
  exchangeFeeBps: number,
  usdtMint: PublicKey,
  usdpMint: PublicKey,
  owner: PublicKey
): Promise<Transaction>
```

**Parameters:**
- `exchangeFeeBps`: Fee in basis points (e.g., 30 = 0.3%)
- `usdtMint`: USDT token mint address
- `usdpMint`: USDP token mint address
- `owner`: Exchange owner public key

**Returns:** Transaction to be signed and sent

**Example:**
```typescript
const tx = await sdk.initializeExchange(
  50, // 0.5% fee
  usdtMint,
  usdpMint,
  owner.publicKey
);
await sendAndConfirmTransaction(connection, tx, [owner]);
```

---

#### updateFee()

Update the exchange fee.

```typescript
async updateFee(
  newFeeBps: number,
  owner: PublicKey
): Promise<Transaction>
```

**Parameters:**
- `newFeeBps`: New fee in basis points
- `owner`: Exchange owner public key

**Example:**
```typescript
const tx = await sdk.updateFee(30, owner.publicKey); // Set to 0.3%
await sendAndConfirmTransaction(connection, tx, [owner]);
```

---

#### pauseExchange()

Pause the exchange to prevent trading.

```typescript
async pauseExchange(owner: PublicKey): Promise<Transaction>
```

**Example:**
```typescript
const tx = await sdk.pauseExchange(owner.publicKey);
await sendAndConfirmTransaction(connection, tx, [owner]);
```

---

#### unpauseExchange()

Resume exchange operations.

```typescript
async unpauseExchange(owner: PublicKey): Promise<Transaction>
```

**Example:**
```typescript
const tx = await sdk.unpauseExchange(owner.publicKey);
await sendAndConfirmTransaction(connection, tx, [owner]);
```

---

#### transferOwnership()

Transfer exchange ownership to a new owner.

```typescript
async transferOwnership(
  currentOwner: PublicKey,
  newOwner: PublicKey
): Promise<Transaction>
```

**Parameters:**
- `currentOwner`: Current owner public key
- `newOwner`: New owner public key

**Example:**
```typescript
const tx = await sdk.transferOwnership(
  currentOwner.publicKey,
  newOwner.publicKey
);
await sendAndConfirmTransaction(connection, tx, [currentOwner]);
```

---

#### withdrawFees()

Withdraw collected fees to a recipient.

```typescript
async withdrawFees(
  usdtAmount: BN,
  usdpAmount: BN,
  owner: PublicKey,
  recipient: PublicKey
): Promise<Transaction>
```

**Parameters:**
- `usdtAmount`: Amount of USDT to withdraw (in lamports)
- `usdpAmount`: Amount of USDP to withdraw (in lamports)
- `owner`: Exchange owner public key
- `recipient`: Recipient public key

**Example:**
```typescript
const tx = await sdk.withdrawFees(
  new BN(1000 * 1e6), // 1000 USDT
  new BN(500 * 1e6), // 500 USDP
  owner.publicKey,
  recipient.publicKey
);
await sendAndConfirmTransaction(connection, tx, [owner]);
```

---

### User Methods

#### buyUsdp()

Buy USDP tokens with USDT.

```typescript
async buyUsdp(
  amount: BN,
  buyer: PublicKey
): Promise<Transaction>
```

**Parameters:**
- `amount`: Amount of USDT to spend (in lamports)
- `buyer`: Buyer public key

**Returns:** Transaction requiring both buyer and owner signatures

**Example:**
```typescript
const tx = await sdk.buyUsdp(
  new BN(100 * 1e6), // 100 USDT
  buyer.publicKey
);
// IMPORTANT: Both buyer and owner must sign
await sendAndConfirmTransaction(connection, tx, [buyer, owner]);
```

**Fee Calculation:**
```
USDT Input: 100 USDT
Fee (0.5%): 0.5 USDT
USDP Output: 99.5 USDP
```

---

#### sellUsdp()

Sell USDP tokens for USDT.

```typescript
async sellUsdp(
  amount: BN,
  seller: PublicKey
): Promise<Transaction>
```

**Parameters:**
- `amount`: Amount of USDP to sell (in lamports)
- `seller`: Seller public key

**Returns:** Transaction requiring both seller and owner signatures

**Example:**
```typescript
const tx = await sdk.sellUsdp(
  new BN(100 * 1e6), // 100 USDP
  seller.publicKey
);
// IMPORTANT: Both seller and owner must sign
await sendAndConfirmTransaction(connection, tx, [seller, owner]);
```

**Fee Calculation:**
```
USDP Input: 100 USDP
Fee (0.5%): 0.5 USDT
USDT Output: 99.5 USDT
```

---

### Query Methods

#### fetchExchangeState()

Fetch the current exchange state.

```typescript
async fetchExchangeState(): Promise<ExchangeState>
```

**Returns:** Exchange state account data

**Example:**
```typescript
const state = await sdk.fetchExchangeState();
console.log('Owner:', state.owner.toString());
console.log('Fee (bps):', state.exchangeFeeBps);
console.log('Is Paused:', state.isPaused);
console.log('Volume:', state.totalVolumeTraded.toString());
```

---

#### isExchangePaused()

Check if exchange is paused.

```typescript
async isExchangePaused(): Promise<boolean>
```

**Example:**
```typescript
const isPaused = await sdk.isExchangePaused();
if (isPaused) {
  console.log('Exchange is currently paused');
}
```

---

#### getExchangeFee()

Get current exchange fee in basis points.

```typescript
async getExchangeFee(): Promise<number>
```

**Example:**
```typescript
const feeBps = await sdk.getExchangeFee();
const feePercent = feeBps / 100;
console.log(`Fee: ${feePercent}%`);
```

---

#### getExchangeOwner()

Get the exchange owner address.

```typescript
async getExchangeOwner(): Promise<PublicKey>
```

**Example:**
```typescript
const owner = await sdk.getExchangeOwner();
console.log('Exchange Owner:', owner.toString());
```

---

#### getExchangeStatePDA()

Get the exchange state PDA address.

```typescript
getExchangeStatePDA(): PublicKey
```

**Example:**
```typescript
const exchangePDA = sdk.getExchangeStatePDA();
console.log('Exchange PDA:', exchangePDA.toString());
```

---

## Examples

### Complete Exchange Setup

```typescript
import { ForecastExchangeSDK } from '@bp-market/sdk';
import { BN } from '@coral-xyz/anchor';
import { createMint, getAssociatedTokenAddress, mintTo } from '@solana/spl-token';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';

async function setupExchange() {
  const connection = new Connection('https://api.devnet.solana.com');
  const owner = Keypair.generate();
  const sdk = new ForecastExchangeSDK(connection);

  // 1. Create token mints
  const usdtMint = await createMint(
    connection,
    owner,
    owner.publicKey,
    null,
    6 // 6 decimals
  );

  const usdpMint = await createMint(
    connection,
    owner,
    owner.publicKey,
    null,
    6
  );

  // 2. Create and fund owner token accounts
  const ownerUsdt = await getAssociatedTokenAddress(usdtMint, owner.publicKey);
  const ownerUsdp = await getAssociatedTokenAddress(usdpMint, owner.publicKey);

  await mintTo(connection, owner, usdtMint, ownerUsdt, owner, 1_000_000 * 1e6);
  await mintTo(connection, owner, usdpMint, ownerUsdp, owner, 1_000_000 * 1e6);

  // 3. Initialize exchange
  const initTx = await sdk.initializeExchange(
    50, // 0.5% fee
    usdtMint,
    usdpMint,
    owner.publicKey
  );
  await sendAndConfirmTransaction(connection, initTx, [owner]);

  console.log('Exchange initialized!');
  return { sdk, owner, usdtMint, usdpMint };
}
```

---

### User Trading Flow

```typescript
async function tradeExample(sdk: ForecastExchangeSDK, owner: Keypair) {
  const buyer = Keypair.generate();

  // Check exchange status
  const isPaused = await sdk.isExchangePaused();
  if (isPaused) {
    console.log('Exchange is paused');
    return;
  }

  // Get fee info
  const feeBps = await sdk.getExchangeFee();
  console.log(`Exchange fee: ${feeBps / 100}%`);

  // Buy USDP
  const buyAmount = new BN(100 * 1e6); // 100 USDT
  const buyTx = await sdk.buyUsdp(buyAmount, buyer.publicKey);

  // IMPORTANT: Both buyer and owner must sign
  await sendAndConfirmTransaction(connection, buyTx, [buyer, owner]);

  console.log('Bought USDP successfully!');

  // Sell USDP
  const sellAmount = new BN(50 * 1e6); // 50 USDP
  const sellTx = await sdk.sellUsdp(sellAmount, buyer.publicKey);

  // IMPORTANT: Both seller and owner must sign
  await sendAndConfirmTransaction(connection, sellTx, [buyer, owner]);

  console.log('Sold USDP successfully!');
}
```

---

### Admin Operations

```typescript
async function adminOperations(sdk: ForecastExchangeSDK, owner: Keypair) {
  // Pause exchange
  const pauseTx = await sdk.pauseExchange(owner.publicKey);
  await sendAndConfirmTransaction(connection, pauseTx, [owner]);
  console.log('Exchange paused');

  // Update fee
  const updateFeeTx = await sdk.updateFee(30, owner.publicKey); // 0.3%
  await sendAndConfirmTransaction(connection, updateFeeTx, [owner]);
  console.log('Fee updated to 0.3%');

  // Unpause exchange
  const unpauseTx = await sdk.unpauseExchange(owner.publicKey);
  await sendAndConfirmTransaction(connection, unpauseTx, [owner]);
  console.log('Exchange resumed');

  // Withdraw fees
  const recipient = Keypair.generate();
  const withdrawTx = await sdk.withdrawFees(
    new BN(10 * 1e6), // 10 USDT
    new BN(10 * 1e6), // 10 USDP
    owner.publicKey,
    recipient.publicKey
  );
  await sendAndConfirmTransaction(connection, withdrawTx, [owner]);
  console.log('Fees withdrawn');
}
```

---

## Testing

### Running Tests

```bash
# Run all tests
anchor test

# Run only forecast-exchange tests
anchor test -- --grep "forecast-exchange"
```

### Test Coverage

The test suite includes:
- ✅ Exchange initialization and validation
- ✅ Fee management (update and query)
- ✅ Pause/unpause functionality
- ✅ Buy USDP operations with fee calculation
- ✅ Sell USDP operations with fee calculation
- ✅ Ownership transfer
- ✅ Fee withdrawal
- ✅ SDK utility methods
- ✅ Edge cases and error handling

### Test Results

```
  forecast-exchange
    Exchange Initialization
      ✔ Should initialize exchange
      ✔ Should not allow re-initialization
    Fee Management
      ✔ Should update exchange fee
      ✔ Should get exchange fee
    Pause/Unpause Exchange
      ✔ Should pause exchange
      ✔ Should not allow trading when paused
      ✔ Should unpause exchange
    Buy USDP
      ✔ Should buy USDP with USDT
      ✔ Should calculate correct fee on buy
    Sell USDP
      ✔ Should sell USDP for USDT
      ✔ Should calculate correct fee on sell
    Ownership Transfer
      ✔ Should transfer ownership
    Fee Withdrawal
      ✔ Should withdraw collected fees
    SDK Utility Methods
      ✔ Should get exchange state
      ✔ Should get exchange owner
      ✔ Should check if exchange is paused
    Summary
      ✔ Should display final state

  17 passing (20s)
```

---

## Important Notes

### Signature Requirements

**CRITICAL:** All buy/sell operations require **BOTH** the user (buyer/seller) **AND** the exchange owner to sign the transaction. This is because:

1. User must authorize spending their tokens
2. Owner must authorize releasing liquidity from their token accounts

```typescript
// ✅ CORRECT - Both signers included
await sendAndConfirmTransaction(connection, tx, [buyer, owner]);

// ❌ WRONG - Missing owner signature
await sendAndConfirmTransaction(connection, tx, [buyer]);
```

### Fee Calculation

Fees are calculated in basis points:
- 1 basis point (bps) = 0.01%
- 100 bps = 1%
- Fee is deducted from the output amount

**Example:**
```
Fee: 50 bps (0.5%)
Buy 100 USDT → Receive 99.5 USDP
Sell 100 USDP → Receive 99.5 USDT
```

### Liquidity Management

The exchange owner must:
1. Maintain sufficient USDT balance for sell operations
2. Maintain sufficient USDP balance for buy operations
3. Monitor and withdraw accumulated fees periodically

### Error Handling

Common errors:
- `ExchangePaused`: Trading is paused by owner
- `InvalidAmount`: Amount is zero or negative
- `InsufficientBalance`: User doesn't have enough tokens
- `InsufficientReserve`: Owner doesn't have enough liquidity
- `Unauthorized`: Non-owner attempting admin operations

---

## Support

For issues, questions, or contributions:
- GitHub: [bp-market repository](https://github.com/your-org/bp-market)
- Documentation: `/sdk/docs/`
- Tests: `/tests/forecast-exchange.ts`

---

## License

MIT License - See LICENSE file for details
