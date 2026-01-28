# BP-Market SDK Documentation

Complete guide for using the BP-Market SDK to interact with the Boomplay Prediction Market Program.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [SDK Reference](#sdk-reference)
- [Usage Examples](#usage-examples)
- [Types](#types)
- [Error Handling](#error-handling)

---

## Overview

The BP-Market SDK provides a TypeScript interface for interacting with the Boomplay Prediction Market smart contract on Solana. It enables:

- **Market creation** - Create prediction markets with multiple answer options
- **Betting system** - Place bets on market outcomes
- **Fee management** - Automatic fee distribution (creator, service, charity)
- **Market resolution** - Set winning answers and distribute winnings
- **User management** - Lock/unlock user accounts

**Program ID:** `8k3g1vPzYf9EXebiQLUgyxwSD4E855qCcEJJaFjg8QuK`

---

## Installation

```bash
npm install @coral-xyz/anchor @solana/web3.js @solana/spl-token
```

---

## Quick Start

```typescript
import { Connection } from '@solana/web3.js';

import { BPMarketSDK } from './sdk/src';

// Initialize SDK
const connection = new Connection('https://api.mainnet-beta.solana.com');
const sdk = new BPMarketSDK(connection);

// Get config
const config = await sdk.fetchConfig();
console.log('Base token:', config.baseToken.toString());
```

---

## SDK Reference

### Constructor

```typescript
new BPMarketSDK(connection: Connection)
```

**Parameters:**
- `connection` - Solana RPC connection

**Example:**
```typescript
const connection = new Connection('http://localhost:8899');
const sdk = new BPMarketSDK(connection);
```

---

### PDA Methods

#### `getConfigPDA()`

Get the global config PDA.

```typescript
getConfigPDA(): PublicKey
```

**Returns:** Config account address

**Example:**
```typescript
const configPDA = sdk.getConfigPDA();
console.log('Config PDA:', configPDA.toString());
```

---

#### `getMarketPDA(marketKey)`

Get the PDA for a specific market.

```typescript
getMarketPDA(marketKey: BN): [PublicKey, number]
```

**Parameters:**
- `marketKey` - Unique market identifier

**Returns:** `[PublicKey, bump]` - Market account address and bump seed

**Example:**
```typescript
const marketKey = new BN(1);
const [marketPDA, bump] = sdk.getMarketPDA(marketKey);
```

---

#### `getAnswerPDA(marketKey, answerKey)`

Get the PDA for a specific answer in a market.

```typescript
getAnswerPDA(marketKey: BN, answerKey: BN): [PublicKey, number]
```

**Parameters:**
- `marketKey` - Market identifier
- `answerKey` - Answer identifier

**Returns:** `[PublicKey, bump]` - Answer account address and bump seed

**Example:**
```typescript
const marketKey = new BN(1);
const answerKey = new BN(0);
const [answerPDA, bump] = sdk.getAnswerPDA(marketKey, answerKey);
```

---

#### `getBettingPDA(marketKey, answerKey, user)`

Get the PDA for a user's bet on a specific answer.

```typescript
getBettingPDA(
  marketKey: BN,
  answerKey: BN,
  user: PublicKey
): [PublicKey, number]
```

**Parameters:**
- `marketKey` - Market identifier
- `answerKey` - Answer identifier
- `user` - Bettor's public key

**Returns:** `[PublicKey, bump]` - Betting account address and bump seed

**Example:**
```typescript
const [bettingPDA, bump] = sdk.getBettingPDA(
  marketKey,
  answerKey,
  user.publicKey
);
```

---

### Administrative Methods

#### `initialize()`

Initialize the market config (admin only, one-time).

```typescript
initialize(
  baseToken: PublicKey,
  cojamFeeAccount: PublicKey,
  charityFeeAccount: PublicKey,
  remainAccount: PublicKey,
  owner: PublicKey
): Promise<Transaction>
```

**Parameters:**
- `baseToken` - Token mint used for betting
- `cojamFeeAccount` - Service fee recipient token account
- `charityFeeAccount` - Charity fee recipient token account
- `remainAccount` - Remaining balance recipient token account
- `owner` - Admin owner public key

**Returns:** Transaction to sign and send

**Example:**
```typescript
const tx = await sdk.initialize(
  usdcMint,
  cojamTokenAccount,
  charityTokenAccount,
  remainTokenAccount,
  owner.publicKey
);

await sendAndConfirmTransaction(connection, tx, [owner]);
```

---

#### `updateOwner()`

Transfer ownership to a new owner (admin only).

```typescript
updateOwner(
  newOwner: PublicKey,
  currentOwner: PublicKey
): Promise<Transaction>
```

**Parameters:**
- `newOwner` - New owner's public key
- `currentOwner` - Current owner (must sign)

**Example:**
```typescript
const tx = await sdk.updateOwner(
  newOwner.publicKey,
  currentOwner.publicKey
);

await sendAndConfirmTransaction(connection, tx, [currentOwner]);
```

---

#### `updateAccounts()`

Update fee recipient accounts (admin only).

```typescript
updateAccounts(
  accountType: AccountType,
  newAccount: PublicKey,
  owner: PublicKey
): Promise<Transaction>
```

**Parameters:**
- `accountType` - Type of account: `'cojamFee'`, `'charityFee'`, or `'remain'`
- `newAccount` - New token account address
- `owner` - Current owner (must sign)

**Example:**
```typescript
const tx = await sdk.updateAccounts(
  'cojamFee',
  newCojamAccount,
  owner.publicKey
);

await sendAndConfirmTransaction(connection, tx, [owner]);
```

---

#### `lockUser()` / `unlockUser()`

Lock or unlock a user account (admin only).

```typescript
lockUser(user: PublicKey, owner: PublicKey): Promise<Transaction>
unlockUser(user: PublicKey, owner: PublicKey): Promise<Transaction>
```

**Parameters:**
- `user` - User to lock/unlock
- `owner` - Admin owner (must sign)

**Example:**
```typescript
// Lock user
const lockTx = await sdk.lockUser(maliciousUser, owner.publicKey);
await sendAndConfirmTransaction(connection, lockTx, [owner]);

// Unlock user
const unlockTx = await sdk.unlockUser(maliciousUser, owner.publicKey);
await sendAndConfirmTransaction(connection, unlockTx, [owner]);
```

---

### Market Management

#### `createMarket()`

Create a new prediction market.

```typescript
createMarket(
  marketKey: BN,
  answerKeys: BN[],
  title: string,
  creatorFeePercentage: BN,
  serviceFeePercentage: BN,
  charityFeePercentage: BN,
  createFee: BN,
  creator: PublicKey
): Promise<Transaction>
```

**Parameters:**
- `marketKey` - Unique market identifier
- `answerKeys` - Array of answer identifiers (2-10 answers)
- `title` - Market question/title
- `creatorFeePercentage` - Creator's fee in basis points (e.g., 100 = 1%)
- `serviceFeePercentage` - Service fee in basis points
- `charityFeePercentage` - Charity fee in basis points
- `createFee` - Fee to create market (in base token smallest units)
- `creator` - Market creator's public key

**Returns:** Transaction to sign and send

**Fee Percentages:**
- Basis points: 10000 = 100%
- Example: 100 = 1%, 250 = 2.5%, 500 = 5%

**Example:**
```typescript
const marketKey = new BN(Date.now());
const answerKeys = [new BN(0), new BN(1), new BN(2)];

const tx = await sdk.createMarket(
  marketKey,
  answerKeys,
  'Will Bitcoin reach $100k by end of 2024?',
  new BN(100), // 1% creator fee
  new BN(200), // 2% service fee
  new BN(50), // 0.5% charity fee
  new BN(1000000), // 0.001 token creation fee
  creator.publicKey
);

await sendAndConfirmTransaction(connection, tx, [creator]);
```

---

#### `setAnswer()`

Set the winning answer for a market (creator only).

```typescript
setAnswer(
  marketKey: BN,
  answerKey: BN,
  creator: PublicKey
): Promise<Transaction>
```

**Parameters:**
- `marketKey` - Market identifier
- `answerKey` - Winning answer identifier
- `creator` - Market creator (must sign)

**Returns:** Transaction to sign and send

**Example:**
```typescript
const tx = await sdk.setAnswer(
  marketKey,
  winningAnswerKey,
  creator.publicKey
);

await sendAndConfirmTransaction(connection, tx, [creator]);
```

---

### Betting

#### `placeBet()`

Place a bet on a market answer.

```typescript
placeBet(
  marketKey: BN,
  answerKey: BN,
  amount: BN,
  user: PublicKey
): Promise<Transaction>
```

**Parameters:**
- `marketKey` - Market identifier
- `answerKey` - Answer to bet on
- `amount` - Bet amount (in token smallest units)
- `user` - Bettor's public key

**Returns:** Transaction to sign and send

**Fee Distribution:**
When a bet is placed, fees are automatically distributed:
1. **Creator Fee** → Market creator
2. **Service Fee** → Platform (cojam)
3. **Charity Fee** → Charity account
4. **Remaining** → Prize pool

**Example:**
```typescript
const betAmount = new BN(1_000_000); // 0.001 token (assuming 9 decimals)

const tx = await sdk.placeBet(
  marketKey,
  answerKey,
  betAmount,
  user.publicKey
);

await sendAndConfirmTransaction(connection, tx, [user]);
```

**Fee Calculation Example:**
```
Bet: 100 tokens
Creator Fee (1%): 1 token
Service Fee (2%): 2 tokens
Charity Fee (0.5%): 0.5 tokens
Remaining (96.5%): 96.5 tokens → Prize pool
```

---

#### `claimWin()`

Claim winnings after market is resolved (winner only).

```typescript
claimWin(
  marketKey: BN,
  answerKey: BN,
  user: PublicKey
): Promise<Transaction>
```

**Parameters:**
- `marketKey` - Market identifier
- `answerKey` - Winning answer the user bet on
- `user` - Winner's public key

**Returns:** Transaction to sign and send

**Requirements:**
1. Market answer must be set
2. User bet on the winning answer
3. User hasn't claimed yet

**Payout Calculation:**
```
User's Payout = (User's Bet / Total Winning Bets) × Total Prize Pool

Example:
- User bet: 10 tokens on Answer A
- Total bets on Answer A: 100 tokens
- Total prize pool: 200 tokens
- User's payout: (10 / 100) × 200 = 20 tokens
```

**Example:**
```typescript
const tx = await sdk.claimWin(
  marketKey,
  winningAnswerKey,
  user.publicKey
);

await sendAndConfirmTransaction(connection, tx, [user]);
console.log('Winnings claimed!');
```

---

### Query Methods

#### `fetchConfig()`

Fetch the global market configuration.

```typescript
fetchConfig(): Promise<ConfigAccount>
```

**Returns:** Config account data

**Example:**
```typescript
const config = await sdk.fetchConfig();
console.log('Owner:', config.owner.toString());
console.log('Base token:', config.baseToken.toString());
console.log('Cojam fee account:', config.cojamFeeAccount.toString());
console.log('Charity fee account:', config.charityFeeAccount.toString());
console.log('Remain account:', config.remainAccount.toString());
```

---

#### `fetchMarket()`

Fetch a specific market's data.

```typescript
fetchMarket(marketKey: BN): Promise<MarketAccount>
```

**Returns:** Market account data

**Example:**
```typescript
const marketKey = new BN(1);
const market = await sdk.fetchMarket(marketKey);

console.log('Market Key:', market.marketKey.toString());
console.log('Title:', market.title);
console.log('Creator:', market.creator.toString());
console.log('Creator Fee:', market.creatorFeePercentage.toString(), 'bps');
console.log('Service Fee:', market.serviceFeePercentage.toString(), 'bps');
console.log('Charity Fee:', market.charityFeePercentage.toString(), 'bps');
console.log('Answer Keys:', market.answerKeys.map(k => k.toString()));
console.log('Answer Set:', market.answerKey?.toString() || 'Not set');
```

---

#### `fetchAnswer()`

Fetch answer data including betting statistics.

```typescript
fetchAnswer(marketKey: BN, answerKey: BN): Promise<AnswerAccount>
```

**Returns:** Answer account data

**Example:**
```typescript
const answer = await sdk.fetchAnswer(marketKey, answerKey);

console.log('Market Key:', answer.marketKey.toString());
console.log('Answer Key:', answer.answerKey.toString());
console.log('Total Bet Amount:', answer.totalBetAmount.toString());
console.log('Total Bettors:', answer.totalBettors.toString());
```

---

#### `fetchBetting()`

Fetch a user's betting data for a specific answer.

```typescript
fetchBetting(
  marketKey: BN,
  answerKey: BN,
  user: PublicKey
): Promise<BettingAccount>
```

**Returns:** Betting account data

**Example:**
```typescript
const betting = await sdk.fetchBetting(marketKey, answerKey, user.publicKey);

console.log('User:', betting.user.toString());
console.log('Market Key:', betting.marketKey.toString());
console.log('Answer Key:', betting.answerKey.toString());
console.log('Bet Amount:', betting.betAmount.toString());
console.log('Has Claimed:', betting.isClaimed);
```

---

#### Helper Query Methods

```typescript
// Get owner
await sdk.getOwner(): Promise<PublicKey>

// Get base token
await sdk.getBaseToken(): Promise<PublicKey>

// Get all accounts
await sdk.getAccounts(): Promise<{
  owner: PublicKey;
  cojamFeeAccount: PublicKey;
  charityFeeAccount: PublicKey;
  remainAccount: PublicKey;
  baseToken: PublicKey;
}>

// Get fee accounts
await sdk.getFeeAccounts(): Promise<{
  cojamFeeAccount: PublicKey;
  charityFeeAccount: PublicKey;
  remainAccount: PublicKey;
}>
```

---

## Usage Examples

### Complete Market Flow

```typescript
import { BN } from '@coral-xyz/anchor';
import { Connection, Keypair, sendAndConfirmTransaction } from '@solana/web3.js';

import { BPMarketSDK } from './sdk/src';

const connection = new Connection('http://localhost:8899');
const sdk = new BPMarketSDK(connection);

// 1. Create a market
const creator = Keypair.generate();
const marketKey = new BN(Date.now());

const createTx = await sdk.createMarket(
  marketKey,
  [new BN(0), new BN(1)], // Yes/No market
  'Will it rain tomorrow?',
  new BN(100), // 1% creator fee
  new BN(200), // 2% service fee
  new BN(50), // 0.5% charity fee
  new BN(0), // No creation fee
  creator.publicKey
);
await sendAndConfirmTransaction(connection, createTx, [creator]);
console.log('Market created!');

// 2. Users place bets
const user1 = Keypair.generate();
const user2 = Keypair.generate();

// User 1 bets on "Yes" (answer 0)
const bet1Tx = await sdk.placeBet(
  marketKey,
  new BN(0),
  new BN(1_000_000_000), // 1 token
  user1.publicKey
);
await sendAndConfirmTransaction(connection, bet1Tx, [user1]);

// User 2 bets on "No" (answer 1)
const bet2Tx = await sdk.placeBet(
  marketKey,
  new BN(1),
  new BN(2_000_000_000), // 2 tokens
  user2.publicKey
);
await sendAndConfirmTransaction(connection, bet2Tx, [user2]);

// 3. Check market statistics
const answer0 = await sdk.fetchAnswer(marketKey, new BN(0));
const answer1 = await sdk.fetchAnswer(marketKey, new BN(1));

console.log('Answer 0 bets:', answer0.totalBetAmount.toString());
console.log('Answer 1 bets:', answer1.totalBetAmount.toString());

// 4. Set winning answer
const setAnswerTx = await sdk.setAnswer(
  marketKey,
  new BN(0), // "Yes" wins
  creator.publicKey
);
await sendAndConfirmTransaction(connection, setAnswerTx, [creator]);
console.log('Winner set: Answer 0');

// 5. Winners claim
const claimTx = await sdk.claimWin(
  marketKey,
  new BN(0),
  user1.publicKey
);
await sendAndConfirmTransaction(connection, claimTx, [user1]);
console.log('User 1 claimed winnings!');

// 6. Check if claimed
const betting = await sdk.fetchBetting(marketKey, new BN(0), user1.publicKey);
console.log('Has claimed:', betting.isClaimed);
```

---

### Calculate Potential Winnings

```typescript
async function calculatePotentialWinnings(
  sdk: BPMarketSDK,
  marketKey: BN,
  answerKey: BN,
  userBetAmount: BN
): Promise<number> {
  const market = await sdk.fetchMarket(marketKey);

  // Get total bets on this answer
  const answer = await sdk.fetchAnswer(marketKey, answerKey);
  const totalBetsOnAnswer = answer.totalBetAmount;

  // Get total prize pool (bets on all answers)
  let totalPrizePool = new BN(0);
  for (const ak of market.answerKeys) {
    const ans = await sdk.fetchAnswer(marketKey, ak);
    totalPrizePool = totalPrizePool.add(ans.totalBetAmount);
  }

  // Calculate payout
  if (totalBetsOnAnswer.isZero()) {
    return 0;
  }

  const payout = userBetAmount
    .mul(totalPrizePool)
    .div(totalBetsOnAnswer);

  return payout.toNumber();
}

// Usage
const potentialWinnings = await calculatePotentialWinnings(
  sdk,
  marketKey,
  answerKey,
  new BN(1_000_000_000) // User's bet: 1 token
);

console.log('Potential winnings:', potentialWinnings / 1_000_000_000, 'tokens');
```

---

### Check If User Can Claim

```typescript
async function canUserClaim(
  sdk: BPMarketSDK,
  marketKey: BN,
  answerKey: BN,
  user: PublicKey
): Promise<{ canClaim: boolean; reason?: string }> {
  try {
    // Check if market has answer set
    const market = await sdk.fetchMarket(marketKey);
    if (!market.answerKey) {
      return { canClaim: false, reason: 'Market not resolved yet' };
    }

    // Check if user bet on winning answer
    if (market.answerKey.toString() !== answerKey.toString()) {
      return { canClaim: false, reason: 'Did not bet on winning answer' };
    }

    // Check if user has betting account
    let betting;
    try {
      betting = await sdk.fetchBetting(marketKey, answerKey, user);
    } catch {
      return { canClaim: false, reason: 'No bet placed' };
    }

    // Check if already claimed
    if (betting.isClaimed) {
      return { canClaim: false, reason: 'Already claimed' };
    }

    // Check if bet amount > 0
    if (betting.betAmount.isZero()) {
      return { canClaim: false, reason: 'No bet amount' };
    }

    return { canClaim: true };
  } catch (error) {
    return { canClaim: false, reason: `Error: ${error.message}` };
  }
}

// Usage
const result = await canUserClaim(sdk, marketKey, answerKey, user.publicKey);
if (result.canClaim) {
  console.log('User can claim winnings!');
} else {
  console.log('Cannot claim:', result.reason);
}
```

---

### Get Market Summary

```typescript
async function getMarketSummary(
  sdk: BPMarketSDK,
  marketKey: BN
) {
  const market = await sdk.fetchMarket(marketKey);

  // Get stats for each answer
  const answerStats = await Promise.all(
    market.answerKeys.map(async (ak) => {
      const answer = await sdk.fetchAnswer(marketKey, ak);
      return {
        answerKey: ak.toString(),
        totalBets: answer.totalBetAmount.toString(),
        totalBettors: answer.totalBettors.toString()
      };
    })
  );

  // Calculate total pool
  const totalPool = answerStats.reduce(
    (sum, stat) => sum.add(new BN(stat.totalBets)),
    new BN(0)
  );

  return {
    marketKey: market.marketKey.toString(),
    title: market.title,
    creator: market.creator.toString(),
    creatorFee: `${market.creatorFeePercentage.toString()} bps`,
    serviceFee: `${market.serviceFeePercentage.toString()} bps`,
    charityFee: `${market.charityFeePercentage.toString()} bps`,
    answerSet: market.answerKey?.toString() || 'Not set',
    totalPool: totalPool.toString(),
    answers: answerStats
  };
}

// Usage
const summary = await getMarketSummary(sdk, marketKey);
console.log(JSON.stringify(summary, null, 2));
```

---

## Types

### ConfigAccount

```typescript
type ConfigAccount = {
  owner: PublicKey;
  baseToken: PublicKey;
  cojamFeeAccount: PublicKey;
  charityFeeAccount: PublicKey;
  remainAccount: PublicKey;
  bump: number;
};
```

### MarketAccount

```typescript
type MarketAccount = {
  marketKey: BN;
  creator: PublicKey;
  title: string;
  createFee: BN;
  creatorFeePercentage: BN;
  serviceFeePercentage: BN;
  charityFeePercentage: BN;
  answerKeys: BN[];
  answerKey?: BN; // Winning answer, undefined if not set
  bump: number;
};
```

### AnswerAccount

```typescript
type AnswerAccount = {
  marketKey: BN;
  answerKey: BN;
  totalBetAmount: BN;
  totalBettors: BN;
  bump: number;
};
```

### BettingAccount

```typescript
type BettingAccount = {
  user: PublicKey;
  marketKey: BN;
  answerKey: BN;
  betAmount: BN;
  isClaimed: boolean;
  bump: number;
};
```

### AccountType

```typescript
enum AccountType {
  CojamFee = 'cojamFee',
  CharityFee = 'charityFee',
  Remain = 'remain'
}
```

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Account does not exist` | Market/bet not initialized | Check if market exists |
| `User is locked` | User account locked by admin | Contact support |
| `Market already resolved` | Answer already set | Cannot change answer |
| `Not the creator` | Only creator can set answer | Use creator's key |
| `Already claimed` | Winnings already claimed | Check isClaimed flag |
| `Not a winner` | Bet on losing answer | Only winners can claim |
| `Insufficient funds` | Not enough tokens | Fund user's account |

### Error Handling Example

```typescript
try {
  const tx = await sdk.placeBet(marketKey, answerKey, amount, user);
  await sendAndConfirmTransaction(connection, tx, [user]);
  console.log('Bet placed successfully!');
} catch (error) {
  if (error.message.includes('User is locked')) {
    console.error('Your account is locked');
  } else if (error.message.includes('Insufficient funds')) {
    console.error('Not enough tokens to place bet');
  } else if (error.message.includes('Market does not exist')) {
    console.error('Invalid market');
  } else {
    console.error('Unexpected error:', error);
  }
}
```

---

## Best Practices

1. **Validate market exists before betting**
   ```typescript
   try {
     await sdk.fetchMarket(marketKey);
   } catch {
     throw new Error('Market does not exist');
   }
   ```

2. **Check user lock status**
   ```typescript
   // Locked users cannot place bets
   ```

3. **Verify answer is set before claiming**
   ```typescript
   const market = await sdk.fetchMarket(marketKey);
   if (!market.answerKey) {
     throw new Error('Market not resolved yet');
   }
   ```

4. **Calculate fees before creating market**
   ```typescript
   // Total fees should not exceed 100% (10000 bps)
   const totalFees = creatorFee + serviceFee + charityFee;
   if (totalFees > 10000) {
     throw new Error('Total fees exceed 100%');
   }
   ```

5. **Use transaction confirmations**
   ```typescript
   const signature = await sendAndConfirmTransaction(connection, tx, [signer]);
   await connection.confirmTransaction(signature, 'confirmed');
   ```

---

## Fee Structure

### Creating a Market

When creating a market, specify three fee types:

1. **Creator Fee** - Goes to market creator
2. **Service Fee** - Goes to platform (cojam)
3. **Charity Fee** - Goes to charity

**Example Fee Setup:**
```typescript
const creatorFeePercentage = new BN(100); // 1%
const serviceFeePercentage = new BN(200); // 2%
const charityFeePercentage = new BN(50); // 0.5%
// Remaining: 96.5% goes to prize pool
```

### Bet Distribution

When a user places a 100 token bet with above fees:
- Creator receives: 1 token
- Platform receives: 2 tokens
- Charity receives: 0.5 tokens
- Prize pool receives: 96.5 tokens

---

## Additional Resources

- **Smart Contract:** `/programs/bp-market/src/`
- **Tests:** `/tests/bp-market.ts`
- **SDK Source:** `/sdk/src/BPMarket.ts`

---

**Questions?** Check the [main documentation](./README.md) or review the test file for more examples.
