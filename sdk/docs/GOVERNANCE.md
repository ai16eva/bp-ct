# Governance SDK Documentation

Complete guide for using the Governance SDK to interact with the Boomplay Governance Program.

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

The Governance SDK provides a TypeScript interface for interacting with the Boomplay Governance smart contract on Solana. It enables:

- **Governance configuration management** - Initialize and update governance parameters
- **Quest/Proposal creation** - Create governance items for community voting
- **Voting system** - Vote on quests and track voting power
- **Reward distribution** - Distribute rewards to eligible voters
- **Treasury management** - Manage governance treasury and rewards

**Program ID:** `4qnXaN98wSKWVqA6LUAnM6QAAXS24i6PovDunTmWFdA7`

---

## Installation

```bash
npm install @coral-xyz/anchor @solana/web3.js @solana/spl-token
```

---

## Quick Start

```typescript
import { Connection } from '@solana/web3.js';

import { GovernanceSDK } from './sdk/src/Governance';

// Initialize SDK
const connection = new Connection('https://api.mainnet-beta.solana.com');
const sdk = new GovernanceSDK(connection);

// Get governance config
const config = await sdk.fetchGovernanceConfig();
console.log('Min required NFTs:', config.minRequiredNft);
```

---

## SDK Reference

### Constructor

```typescript
new GovernanceSDK(connection: Connection)
```

**Parameters:**
- `connection` - Solana RPC connection

**Example:**
```typescript
const connection = new Connection('http://localhost:8899');
const sdk = new GovernanceSDK(connection);
```

---

### PDA Methods

#### `getConfigPDA()`

Get the governance config PDA (Program Derived Address).

```typescript
getConfigPDA(): [PublicKey, number]
```

**Returns:** `[PublicKey, bump]` - Config account address and bump seed

**Example:**
```typescript
const [configPDA, bump] = sdk.getConfigPDA();
console.log('Config PDA:', configPDA.toString());
```

---

#### `getGovernancePDA()`

Get the main governance account PDA.

```typescript
getGovernancePDA(): [PublicKey, number]
```

**Returns:** `[PublicKey, bump]` - Governance account address and bump seed

---

#### `getGovernanceItemPDA(questKey)`

Get the PDA for a specific governance item (quest/proposal).

```typescript
getGovernanceItemPDA(questKey: BN): [PublicKey, number]
```

**Parameters:**
- `questKey` - Unique identifier for the quest

**Returns:** `[PublicKey, bump]` - Governance item account address and bump seed

**Example:**
```typescript
const questKey = new BN(1);
const [itemPDA, bump] = sdk.getGovernanceItemPDA(questKey);
```

---

#### `getQuestVotePDA(questKey)`

Get the PDA for quest voting data.

```typescript
getQuestVotePDA(questKey: BN): [PublicKey, number]
```

**Parameters:**
- `questKey` - Quest identifier

**Returns:** `[PublicKey, bump]` - Quest vote account address and bump seed

---

#### `getQuestVoterPDA(questKey, voter)`

Get the PDA for a specific voter's record on a quest.

```typescript
getQuestVoterPDA(questKey: BN, voter: PublicKey): [PublicKey, number]
```

**Parameters:**
- `questKey` - Quest identifier
- `voter` - Voter's public key

**Returns:** `[PublicKey, bump]` - Voter record account address and bump seed

**Example:**
```typescript
const questKey = new BN(1);
const voterKey = new PublicKey('...');
const [voterPDA, bump] = sdk.getQuestVoterPDA(questKey, voterKey);
```

---

#### `getProposalPDA(proposalKey)`

Get the PDA for a proposal.

```typescript
getProposalPDA(proposalKey: BN): [PublicKey, number]
```

**Parameters:**
- `proposalKey` - Proposal identifier

**Returns:** `[PublicKey, bump]` - Proposal account address and bump seed

---

### Administrative Methods

#### `initialize()`

Initialize the governance config (admin only, one-time).

```typescript
initialize(
  minTotalVote: BN,
  maxTotalVote: BN,
  minRequiredNft: number,
  maxVotableNft: number,
  durationHours: BN,
  constantRewardToken: BN,
  baseTokenMint: PublicKey,
  baseNftCollection: PublicKey,
  treasuryTokenAccount: PublicKey,
  authority: PublicKey
): Promise<Transaction>
```

**Parameters:**
- `minTotalVote` - Minimum votes required for quest to pass
- `maxTotalVote` - Maximum votes allowed per quest
- `minRequiredNft` - Minimum NFTs required to create quest
- `maxVotableNft` - Maximum NFTs that can be used for voting
- `durationHours` - Duration of voting period in hours
- `constantRewardToken` - Reward multiplier per vote (in base token units)
- `baseTokenMint` - Token mint used for rewards
- `baseNftCollection` - NFT collection for governance participation
- `treasuryTokenAccount` - Treasury token account for rewards
- `authority` - Admin authority public key

**Returns:** Transaction to sign and send

**Example:**
```typescript
const tx = await sdk.initialize(
  new BN(10), // minTotalVote
  new BN(1000), // maxTotalVote
  1, // minRequiredNft
  5, // maxVotableNft
  new BN(24), // 24 hours voting duration
  new BN(100), // 100 tokens reward per vote
  tokenMint,
  nftCollection,
  treasuryAccount,
  authority.publicKey
);

await sendAndConfirmTransaction(connection, tx, [authority]);
```

---

#### `updateConfig()`

Update governance configuration parameters (admin only).

```typescript
updateConfig(
  minTotalVote: BN,
  maxTotalVote: BN,
  minRequiredNft: number,
  maxVotableNft: number,
  durationHours: BN,
  constantRewardToken: BN,
  authority: PublicKey
): Promise<Transaction>
```

**Parameters:** Same as initialize, excluding one-time setup parameters

**Example:**
```typescript
const tx = await sdk.updateConfig(
  new BN(20), // Increase min votes
  new BN(2000), // Increase max votes
  2, // Require 2 NFTs now
  10, // Allow 10 NFTs for voting
  new BN(48), // Extend to 48 hours
  new BN(150), // Increase reward
  authority.publicKey
);

await sendAndConfirmTransaction(connection, tx, [authority]);
```

---

### Quest/Proposal Management

#### `createGovernance()`

Create a new governance item (quest/proposal).

```typescript
createGovernance(
  questKey: BN,
  answers: string[],
  title: string,
  description: string,
  imageUrl: string,
  creator: PublicKey,
  creatorNftTokenAccount: PublicKey
): Promise<Transaction>
```

**Parameters:**
- `questKey` - Unique identifier for this quest
- `answers` - Array of possible answers (2-10 answers)
- `title` - Quest title (max 200 chars)
- `description` - Quest description
- `imageUrl` - Image URL for quest
- `creator` - Creator's public key
- `creatorNftTokenAccount` - Creator's NFT token account (must hold min NFTs)

**Returns:** Transaction to sign and send

**Example:**
```typescript
const questKey = new BN(Date.now());
const tx = await sdk.createGovernance(
  questKey,
  ['Yes', 'No', 'Abstain'],
  'Should we implement feature X?',
  'Detailed description of the proposal...',
  'https://example.com/image.png',
  creator.publicKey,
  creatorNftAccount
);

await sendAndConfirmTransaction(connection, tx, [creator]);
```

---

#### `voteQuest()`

Vote on a quest using NFT voting power.

```typescript
voteQuest(
  questKey: BN,
  answerKey: BN,
  voter: PublicKey,
  voterNftTokenAccount: PublicKey
): Promise<Transaction>
```

**Parameters:**
- `questKey` - Quest identifier
- `answerKey` - Answer to vote for (0-based index)
- `voter` - Voter's public key
- `voterNftTokenAccount` - Voter's NFT token account

**Returns:** Transaction to sign and send

**Example:**
```typescript
const questKey = new BN(1);
const answerKey = new BN(0); // Vote for first answer

const tx = await sdk.voteQuest(
  questKey,
  answerKey,
  voter.publicKey,
  voterNftAccount
);

await sendAndConfirmTransaction(connection, tx, [voter]);
```

---

#### `finalizeAnswer()`

Finalize the voting and set the winning answer (admin only).

```typescript
finalizeAnswer(
  questKey: BN,
  answerKey: BN,
  authority: PublicKey
): Promise<Transaction>
```

**Parameters:**
- `questKey` - Quest identifier
- `answerKey` - Winning answer index
- `authority` - Admin authority

**Example:**
```typescript
const tx = await sdk.finalizeAnswer(
  questKey,
  new BN(0), // First answer wins
  authority.publicKey
);

await sendAndConfirmTransaction(connection, tx, [authority]);
```

---

#### `cancelAnswer()`

Cancel a quest (admin only).

```typescript
cancelAnswer(
  questKey: BN,
  authority: PublicKey
): Promise<Transaction>
```

---

### Reward Distribution

#### `distributeReward()`

Distribute reward to an eligible voter.

```typescript
distributeReward(
  questKey: BN,
  answerKey: BN,
  voter: PublicKey,
  treasuryAuthority: PublicKey
): Promise<Transaction>
```

**Parameters:**
- `questKey` - Quest identifier
- `answerKey` - Answer the voter voted for
- `voter` - Voter to receive reward
- `treasuryAuthority` - Treasury authority (must sign)

**Returns:** Transaction to sign and send

**Eligibility Requirements:**
1. Answer vote must be finalized
2. Voter voted for the winning answer
3. Voter has not already claimed
4. Treasury has sufficient balance

**Example:**
```typescript
const tx = await sdk.distributeReward(
  questKey,
  winningAnswerKey,
  voter.publicKey,
  treasuryAuthority.publicKey
);

await sendAndConfirmTransaction(connection, tx, [treasuryAuthority]);
```

**Reward Calculation:**
```
Reward (lamports) = vote_count × CONSTANT_REWARD_TOKEN × 10^9

Example:
- Voter has 3 NFTs (3 votes)
- CONSTANT_REWARD_TOKEN = 5 tokens
- Reward = 3 × 5 × 1,000,000,000 = 15,000,000,000 lamports = 15 tokens
```

---

### Query Methods

#### `fetchGovernanceConfig()`

Fetch the governance configuration.

```typescript
fetchGovernanceConfig(): Promise<GovernanceConfig>
```

**Returns:** Governance config account data

**Example:**
```typescript
const config = await sdk.fetchGovernanceConfig();
console.log('Min votes:', config.minTotalVote.toString());
console.log('Max votes:', config.maxTotalVote.toString());
console.log('Min NFTs:', config.minRequiredNft);
console.log('Duration:', config.durationHours.toString(), 'hours');
console.log('Reward per vote:', config.constantRewardToken.toString());
```

---

#### `fetchGovernanceItem()`

Fetch a specific governance item.

```typescript
fetchGovernanceItem(questKey: BN): Promise<GovernanceItem>
```

**Returns:** Governance item account data

**Example:**
```typescript
const questKey = new BN(1);
const item = await sdk.fetchGovernanceItem(questKey);
console.log('Title:', item.title);
console.log('Creator:', item.creator.toString());
console.log('Answers:', item.answers);
```

---

#### `fetchQuestVote()`

Fetch voting data for a quest.

```typescript
fetchQuestVote(questKey: BN): Promise<QuestVote>
```

**Returns:** Quest vote account data with vote counts

**Example:**
```typescript
const voteData = await sdk.fetchQuestVote(questKey);
console.log('Total votes:', voteData.totalVoteCount.toString());
console.log('Vote counts:', voteData.voteCount.map(v => v.toString()));
console.log('Is finalized:', voteData.isFinalized);
console.log('Answer result:', voteData.answerResult.toString());
```

---

#### `fetchQuestVoter()`

Fetch a voter's record for a quest.

```typescript
fetchQuestVoter(questKey: BN, voter: PublicKey): Promise<QuestVoter>
```

**Returns:** Voter record with vote details

**Example:**
```typescript
const voterData = await sdk.fetchQuestVoter(questKey, voter.publicKey);
console.log('Answer voted:', voterData.answerKey.toString());
console.log('Vote count:', voterData.voteCount.toString());
console.log('Has claimed:', voterData.hasClaimed);
```

---

## Usage Examples

### Complete Voting Flow

```typescript
import { BN } from '@coral-xyz/anchor';
import { Connection, Keypair, sendAndConfirmTransaction } from '@solana/web3.js';

import { GovernanceSDK } from './sdk/src/Governance';

const connection = new Connection('http://localhost:8899');
const sdk = new GovernanceSDK(connection);

// 1. Create a quest
const creator = Keypair.generate();
const questKey = new BN(Date.now());

const createTx = await sdk.createGovernance(
  questKey,
  ['Option A', 'Option B', 'Option C'],
  'Which feature should we prioritize?',
  'Help us decide the next feature to build',
  'https://example.com/quest.png',
  creator.publicKey,
  creatorNftAccount
);
await sendAndConfirmTransaction(connection, createTx, [creator]);

// 2. Vote on the quest
const voter = Keypair.generate();
const voteTx = await sdk.voteQuest(
  questKey,
  new BN(0), // Vote for Option A
  voter.publicKey,
  voterNftAccount
);
await sendAndConfirmTransaction(connection, voteTx, [voter]);

// 3. Check voting results
const voteData = await sdk.fetchQuestVote(questKey);
console.log('Vote counts:', voteData.voteCount.map(v => v.toString()));

// 4. Finalize (after voting period ends)
const authority = Keypair.generate();
const finalizeTx = await sdk.finalizeAnswer(
  questKey,
  new BN(0), // Option A wins
  authority.publicKey
);
await sendAndConfirmTransaction(connection, finalizeTx, [authority]);

// 5. Distribute rewards to voters
const distributeTx = await sdk.distributeReward(
  questKey,
  new BN(0), // Winning answer
  voter.publicKey,
  treasuryAuthority.publicKey
);
await sendAndConfirmTransaction(connection, distributeTx, [treasuryAuthority]);

// 6. Verify reward claimed
const voterRecord = await sdk.fetchQuestVoter(questKey, voter.publicKey);
console.log('Has claimed:', voterRecord.hasClaimed);
```

---

### Check Reward Eligibility

```typescript
async function checkRewardEligibility(
  sdk: GovernanceSDK,
  questKey: BN,
  voter: PublicKey
): Promise<{
    eligible: boolean;
    reason?: string;
    rewardAmount?: number;
  }> {
  try {
    // Fetch quest vote data
    const voteData = await sdk.fetchQuestVote(questKey);

    // Check if finalized
    if (!voteData.isFinalized) {
      return { eligible: false, reason: 'Quest not finalized' };
    }

    // Check if answer result is set
    if (voteData.answerResult.toNumber() === 0) {
      return { eligible: false, reason: 'No winning answer set' };
    }

    // Fetch voter record
    const voterRecord = await sdk.fetchQuestVoter(questKey, voter);

    // Check if already claimed
    if (voterRecord.hasClaimed) {
      return { eligible: false, reason: 'Already claimed' };
    }

    // Check if voted for winning answer
    const winningAnswer = voteData.answerResult.toNumber() - 1; // Convert to 0-based
    if (voterRecord.answerKey.toNumber() !== winningAnswer) {
      return { eligible: false, reason: 'Did not vote for winning answer' };
    }

    // Check if has votes
    if (voterRecord.voteCount.toNumber() === 0) {
      return { eligible: false, reason: 'No votes' };
    }

    // Calculate reward
    const config = await sdk.fetchGovernanceConfig();
    const rewardAmount = voterRecord.voteCount.toNumber()
      * config.constantRewardToken.toNumber()
      * 1_000_000_000; // Convert to lamports

    return {
      eligible: true,
      rewardAmount
    };
  } catch (error) {
    return {
      eligible: false,
      reason: `Error: ${error.message}`
    };
  }
}

// Usage
const result = await checkRewardEligibility(sdk, questKey, voterPublicKey);
if (result.eligible) {
  console.log('Eligible! Reward:', result.rewardAmount, 'lamports');
} else {
  console.log('Not eligible:', result.reason);
}
```

---

## Types

### GovernanceConfig

```typescript
type GovernanceConfig = {
  authority: PublicKey;
  baseTokenMint: PublicKey;
  baseNftCollection: PublicKey;
  treasuryTokenAccount: PublicKey;
  minTotalVote: BN;
  maxTotalVote: BN;
  minRequiredNft: number;
  maxVotableNft: number;
  durationHours: BN;
  constantRewardToken: BN;
  bump: number;
};
```

### GovernanceItem

```typescript
type GovernanceItem = {
  questKey: BN;
  creator: PublicKey;
  answers: string[];
  title: string;
  description: string;
  imageUrl: string;
  timestamp: BN;
  bump: number;
};
```

### QuestVote

```typescript
type QuestVote = {
  questKey: BN;
  totalVoteCount: BN;
  voteCount: BN[]; // One per answer
  isFinalized: boolean;
  answerResult: BN; // Winning answer (1-based), 0 = not set
  bump: number;
};
```

### QuestVoter

```typescript
type QuestVoter = {
  voter: PublicKey;
  questKey: BN;
  answerKey: BN;
  voteCount: BN;
  hasClaimed: boolean;
  bump: number;
};
```

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Account does not exist` | Quest/voter not initialized | Check if quest exists on-chain |
| `Insufficient NFTs` | Not enough NFTs to create quest | User needs min NFTs |
| `Already voted` | User already voted on this quest | Cannot vote twice |
| `Quest not finalized` | Trying to claim before finalization | Wait for admin to finalize |
| `Already claimed` | Reward already distributed | Check hasClaimed flag |
| `Insufficient treasury balance` | Not enough tokens in treasury | Fund treasury account |
| `Invalid answer` | Answer doesn't match winning answer | Check answerResult |

### Error Handling Example

```typescript
try {
  const tx = await sdk.voteQuest(questKey, answerKey, voter, nftAccount);
  await sendAndConfirmTransaction(connection, tx, [voter]);
  console.log('Vote successful!');
} catch (error) {
  if (error.message.includes('Already voted')) {
    console.error('You have already voted on this quest');
  } else if (error.message.includes('Insufficient NFTs')) {
    console.error('You need more NFTs to vote');
  } else if (error.message.includes('Quest not found')) {
    console.error('Quest does not exist');
  } else {
    console.error('Unexpected error:', error);
  }
}
```

---

## Best Practices

1. **Always check eligibility before claiming rewards**
   ```typescript
   const eligible = await checkRewardEligibility(sdk, questKey, voter);
   if (!eligible.eligible) {
     throw new Error(eligible.reason);
   }
   ```

2. **Use transaction confirmations**
   ```typescript
   const tx = await sdk.voteQuest(...);
   const signature = await sendAndConfirmTransaction(connection, tx, [signer]);
   await connection.confirmTransaction(signature, 'confirmed');
   ```

3. **Handle account not found gracefully**
   ```typescript
   let voteData;
   try {
     voteData = await sdk.fetchQuestVote(questKey);
   } catch (error) {
     console.log('Quest vote account not initialized yet');
   }
   ```

4. **Cache PDA calculations**
   ```typescript
   const [questVotePDA] = sdk.getQuestVotePDA(questKey);
   // Reuse questVotePDA instead of recalculating
   ```

---

## Additional Resources

- **Smart Contract:** `/programs/governance/src/`
- **Tests:** `/tests/governance.ts`
- **Backend Integration Guide:** [REWARD_DISTRIBUTION_BACKEND.md](./REWARD_DISTRIBUTION_BACKEND.md)
- **Flow Diagrams:** [REWARD_DISTRIBUTION_FLOWS.md](./REWARD_DISTRIBUTION_FLOWS.md)

---

**Questions?** Check the [main documentation](./README.md) or review the test file for more examples.
