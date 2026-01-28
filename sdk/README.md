# BP Market SDK

A TypeScript SDK for interacting with the BP Market Solana program.

## Installation

```bash
npm install @bp-market/sdk
```

## Usage

### Initialize the SDK

```typescript
import { BPMarketSDK } from '@bp-market/sdk';
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';

// Initialize connection and provider
const connection = new Connection('https://api.devnet.solana.com');
const provider = new AnchorProvider(connection, wallet, {});

// Load the program
const program = new Program(idl, programId, provider);

// Create SDK instance
const sdk = new BPMarketSDK(program);
```

### Owner Operations

```typescript
// Initialize config with base token
const baseToken = new PublicKey('...');
const owner = wallet.publicKey;
await sdk.initialize(baseToken, owner);

// Update owner
const newOwner = new PublicKey('...');
await sdk.updateOwner(newOwner, owner);

// Lock/unlock users
await sdk.lockUser(userPublicKey, owner);
await sdk.unlockUser(userPublicKey, owner);

// Set fee accounts
await sdk.setAccount(AccountType.CojamFee, cojamAccount, owner);
await sdk.setAccount(AccountType.CharityFee, charityAccount, owner);
await sdk.setAccount(AccountType.Remain, remainAccount, owner);
```

### Market Operations

```typescript
// Publish a new market
const marketData = {
  marketKey: new BN(1),
  creator: creatorPublicKey,
  title: 'Who will win the championship?',
  createFee: new BN(1000000),
  creatorFeePercentage: new BN(100), // 1%
  serviceFeePercentage: new BN(200), // 2%
  charityFeePercentage: new BN(50), // 0.5%
  answerKeys: [new BN(1), new BN(2), new BN(3)]
};
await sdk.publishMarket(marketData, owner);

// Approve market
await sdk.approveMarket(marketKey, owner);

// Mark market as successful
await sdk.successMarket(marketKey, correctAnswerKey, owner);

// Adjourn market
await sdk.adjournMarket(marketKey, owner);
```

### User Operations

```typescript
// Place a bet
const marketKey = new BN(1);
const answerKey = new BN(2);
const amount = new BN(1000000000); // 1 token
const voter = wallet.publicKey;
await sdk.bet(marketKey, answerKey, amount, voter);

// Claim winnings
await sdk.receiveToken(marketKey, answerKey, voter);

// Calculate potential winnings
const winnings = await sdk.calculateWinnings(voter, marketKey, answerKey);

// Calculate available tokens to receive (works for both success and adjourn status)
const availableTokens = await sdk.availableReceiveTokens(marketKey, bettingPDA);
// Or using voter address directly
const availableTokensByUser = await sdk.availableReceiveTokensByUser(voter, marketKey, answerKey);
```

### Query Operations

```typescript
// Fetch accounts
const config = await sdk.fetchConfig();
const market = await sdk.fetchMarket(marketKey);
const answer = await sdk.fetchAnswer(marketKey);
const betting = await sdk.fetchBetting(voter, marketKey, answerKey);

// Get all config accounts at once
const accounts = await sdk.getAccounts();
// Returns: { owner, cojamFeeAccount, charityFeeAccount, remainAccount, baseToken }

// Get specific config information
const owner = await sdk.getOwner();
const baseToken = await sdk.getBaseToken();
const feeAccounts = await sdk.getFeeAccounts();
const lockedUsers = await sdk.getLockedUsers();

// Get market information
const marketInfo = await sdk.getMarketInfo(marketKey);
// Returns: { creator, title, status, totalTokens, remainTokens, rewardBaseTokens, correctAnswerKey, approveTime, successTime, adjournTime }

const marketFee = await sdk.getMarketFee(marketKey);
// Returns: { creatorFee, creatorFeePercentage, serviceFeePercentage, charityFeePercentage }

const marketFees = await sdk.getMarketFees(marketKey);
// Returns: { creatorFee, creatorFeePercentage, serviceFeePercentage, charityFeePercentage, totalFeePercentage }

// Get answer information
const answerInfo = await sdk.getAnswerInfo(marketKey, answerKey);
// Returns: { totalTokens, percentage }

const allAnswers = await sdk.getAllAnswersInfo(marketKey);
// Returns array of: { answerKey, totalTokens, percentage }

// Get user bet information
const userBetInfo = await sdk.getUserBetInfo(voter, marketKey, answerKey);
// Returns: { exists, tokens, createTime, potentialWinnings }

const userTotalBets = await sdk.getUserTotalBets(voter);
// Returns: { totalBets, totalTokensBet, markets: [{ marketKey, answerKey, tokens }] }

// Get all markets
const allMarkets = await sdk.getAllMarkets();

// Get markets by creator
const creatorMarkets = await sdk.getMarketsByCreator(creatorPublicKey);

// Get user bets
const userBets = await sdk.getUserBets(userPublicKey);

// Check if user is locked
const isLocked = await sdk.isUserLocked(userPublicKey);

// Get market status
const status = await sdk.getMarketStatus(marketKey);
```

### Event Listeners

```typescript
// Listen for bet placed events
const listenerId = sdk.addEventListener('betPlaced', (event, slot, signature) => {
  console.log('Bet placed:', event);
});

// Remove listener
await sdk.removeEventListener(listenerId);
```

### Helper Methods

```typescript
// Get PDAs
const configPDA = sdk.getConfigPDA();
const marketPDA = sdk.getMarketPDA(marketKey);
const answerPDA = sdk.getAnswerPDA(marketKey);
const bettingPDA = sdk.getBettingPDA(voter, marketKey, answerKey);

// Get vault token account
const vaultAccount = await sdk.getVaultTokenAccount(marketKey, mint);
```

## Types

The SDK exports the following types:

- `ConfigAccount` - Configuration account structure
- `MarketAccount` - Market account structure
- `AnswerAccount` - Answer account structure
- `BettingAccount` - Betting account structure
- `MarketData` - Market creation parameters
- `AccountType` - Enum for account types (CojamFee, CharityFee, Remain)

## License

MIT
