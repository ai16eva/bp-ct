import type { IdlAccounts } from '@coral-xyz/anchor';
import * as anchor from '@coral-xyz/anchor';
import { BN } from '@coral-xyz/anchor';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import {
  ComputeBudgetProgram,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';

import IDL from '../../target/idl/bp_market.json';
import type { BpMarket } from './utils/types/bp_market';

export type ConfigAccount = IdlAccounts<BpMarket>['configAccount'];
export type MarketAccount = IdlAccounts<BpMarket>['marketAccount'];
export type AnswerAccount = IdlAccounts<BpMarket>['answerAccount'];
export type BettingAccount = IdlAccounts<BpMarket>['bettingAccount'];

export enum AccountType {
  CojamFee = 'cojamFee',
  CharityFee = 'charityFee',
  Remain = 'remain',
}

export interface MarketData {
  marketKey: BN;
  creator: PublicKey;
  title: string;
  bettingToken: PublicKey;  // Token mint for this market's bets
  createFee: BN;
  creatorFeePercentage: BN;
  serviceFeePercentage: BN;
  charityFeePercentage: BN;
  answerKeys: BN[];
}

export class BPMarketSDK {
  public idl = Object.assign({}, IDL as BpMarket);

  private configPDA: PublicKey;

  // PDA seeds
  private readonly CONFIG_SEED = 'config';
  private readonly MARKET_SEED = 'market';
  private readonly ANSWER_SEED = 'answer';
  private readonly BETTING_SEED = 'betting';

  constructor(public readonly connection: anchor.web3.Connection) {
    const [configPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from(this.CONFIG_SEED)],
      this.program.programId,
    );
    this.configPDA = configPDA;
  }

  get program(): anchor.Program<BpMarket> {
    return new anchor.Program(this.idl, {
      connection: this.connection,
    }) as anchor.Program<BpMarket>;
  }
  // ============= Helper Methods =============

  getConfigPDA(): PublicKey {
    return this.configPDA;
  }

  async getAccounts(): Promise<{
    owner: PublicKey;
    cojamFeeAccount: PublicKey;
    charityFeeAccount: PublicKey;
    remainAccount: PublicKey;
    baseToken: PublicKey;
  }> {
    const config = await this.fetchConfig();
    return {
      owner: config.owner,
      cojamFeeAccount: config.cojamFeeAccount,
      charityFeeAccount: config.charityFeeAccount,
      remainAccount: config.remainAccount,
      baseToken: config.baseToken,
    };
  }

  async getOwner(): Promise<PublicKey> {
    const config = await this.fetchConfig();
    return config.owner;
  }

  async getBaseToken(): Promise<PublicKey> {
    const config = await this.fetchConfig();
    return config.baseToken;
  }

  async getFeeAccounts(): Promise<{
    cojamFeeAccount: PublicKey;
    charityFeeAccount: PublicKey;
    remainAccount: PublicKey;
  }> {
    const config = await this.fetchConfig();
    return {
      cojamFeeAccount: config.cojamFeeAccount,
      charityFeeAccount: config.charityFeeAccount,
      remainAccount: config.remainAccount,
    };
  }

  async getLockedUsers(): Promise<PublicKey[]> {
    const config = await this.fetchConfig();
    return config.lockedUsers;
  }

  getMarketPDA(marketKey: BN): PublicKey {
    const [marketPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from(this.MARKET_SEED), marketKey.toArrayLike(Buffer, 'le', 8)],
      this.program.programId,
    );
    return marketPDA;
  }

  getAnswerPDA(marketKey: BN): PublicKey {
    const [answerPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from(this.ANSWER_SEED), marketKey.toArrayLike(Buffer, 'le', 8)],
      this.program.programId,
    );
    return answerPDA;
  }

  getBettingPDA(voter: PublicKey, marketKey: BN, answerKey: BN): PublicKey {
    const [bettingPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from(this.BETTING_SEED),
        voter.toBuffer(),
        marketKey.toArrayLike(Buffer, 'le', 8),
        answerKey.toArrayLike(Buffer, 'le', 8),
      ],
      this.program.programId,
    );
    return bettingPDA;
  }

  async getVaultTokenAccount(
    marketKey: BN,
    mint: PublicKey,
  ): Promise<PublicKey> {
    const marketPDA = this.getMarketPDA(marketKey);
    return getAssociatedTokenAddress(mint, marketPDA, true);
  }

  // ============= Fetch Account Methods =============

  async fetchConfig(): Promise<ConfigAccount> {
    return await this.program.account.configAccount.fetch(this.configPDA);
  }

  async fetchMarket(marketKey: BN): Promise<MarketAccount> {
    const marketPDA = this.getMarketPDA(marketKey);
    return await this.program.account.marketAccount.fetch(marketPDA);
  }

  /**
   * Get the betting token for a specific market
   * @param marketKey The market key
   * @returns The betting token mint address for this market
   */
  async getMarketBettingToken(marketKey: BN): Promise<PublicKey> {
    const market = await this.fetchMarket(marketKey);
    return market.bettingToken;
  }

  async fetchAnswer(marketKey: BN): Promise<AnswerAccount> {
    const answerPDA = this.getAnswerPDA(marketKey);
    return await this.program.account.answerAccount.fetch(answerPDA);
  }

  async fetchBetting(
    voter: PublicKey,
    marketKey: BN,
    answerKey: BN,
  ): Promise<BettingAccount> {
    const bettingPDA = this.getBettingPDA(voter, marketKey, answerKey);
    return await this.program.account.bettingAccount.fetch(bettingPDA);
  }

  // ============= Owner Instructions =============

  async initialize(
    baseToken: PublicKey,
    owner: PublicKey,
  ): Promise<Transaction> {
    const ownerPubkey = owner;

    return await this.program.methods
      .initialize(baseToken)
      .accountsPartial({
        owner: ownerPubkey,
        configAccount: this.configPDA,
        systemProgram: SystemProgram.programId,
      })
      .transaction();
  }

  async updateOwner(
    newOwner: PublicKey,
    owner: PublicKey,
  ): Promise<Transaction> {
    const ownerPubkey = owner;

    return await this.program.methods
      .updateOwner(newOwner)
      .accountsPartial({
        owner: ownerPubkey,
        configAccount: this.configPDA,
      })
      .transaction();
  }

  async setAccount(
    accountType: AccountType,
    newAccount: PublicKey,
    owner: PublicKey,
  ): Promise<Transaction> {
    const ownerPubkey = owner;

    // Convert to the format expected by the program
    const accountTypeArg = {
      [accountType]: {},
    };

    return await this.program.methods
      .setAccount(accountTypeArg as any, newAccount)
      .accountsPartial({
        owner: ownerPubkey,
        configAccount: this.configPDA,
        systemProgram: SystemProgram.programId,
      })
      .transaction();
  }

  async lockUser(
    userToLock: PublicKey,
    owner: PublicKey,
  ): Promise<Transaction> {
    const ownerPubkey = owner;

    return await this.program.methods
      .lockUser(userToLock)
      .accountsPartial({
        owner: ownerPubkey,
        configAccount: this.configPDA,
        systemProgram: SystemProgram.programId,
      })
      .transaction();
  }

  async unlockUser(
    userToUnlock: PublicKey,
    owner: PublicKey,
  ): Promise<Transaction> {
    const ownerPubkey = owner;

    return await this.program.methods
      .unlockUser(userToUnlock)
      .accountsPartial({
        owner: ownerPubkey,
        configAccount: this.configPDA,
        systemProgram: SystemProgram.programId,
      })
      .transaction();
  }

  // ============= Market Instructions =============

  async publishMarket(
    marketData: MarketData,
    owner: PublicKey,
  ): Promise<Transaction> {
    const marketPDA = this.getMarketPDA(marketData.marketKey);
    const answerPDA = this.getAnswerPDA(marketData.marketKey);

    return await this.program.methods
      .publishMarket(
        marketData.marketKey,
        marketData.creator,
        marketData.title,
        marketData.bettingToken,  // Pass betting token for this market
        marketData.createFee,
        marketData.creatorFeePercentage,
        marketData.serviceFeePercentage,
        marketData.charityFeePercentage,
        marketData.answerKeys,
      )
      .accountsPartial({
        owner,
        configAccount: this.configPDA,
        marketAccount: marketPDA,
        answerAccount: answerPDA,
        systemProgram: SystemProgram.programId,
      })
      .transaction();
  }

  async successMarket(
    marketKey: BN,
    correctAnswerKey: BN,
    owner: PublicKey,
  ): Promise<Transaction> {
    const ownerPubkey = owner;
    const marketPDA = this.getMarketPDA(marketKey);
    const answerPDA = this.getAnswerPDA(marketKey);
    const config = await this.fetchConfig();

    // Get market's betting token instead of global base token
    const market = await this.fetchMarket(marketKey);
    const bettingToken = market.bettingToken;

    const vaultTokenAccount = await this.getVaultTokenAccount(
      marketKey,
      bettingToken,  // Use market's betting token
    );

    const creatorTokenAccount = await getAssociatedTokenAddress(
      bettingToken,  // Use market's betting token
      market.creator,
    );

    const cojamTokenAccount = await getAssociatedTokenAddress(
      bettingToken,  // Use market's betting token
      config.cojamFeeAccount,
    );

    const charityTokenAccount = await getAssociatedTokenAddress(
      bettingToken,  // Use market's betting token
      config.charityFeeAccount,
    );

    const tx = new Transaction();

    // Auto-create fee accounts' ATAs if not exist (important for multi-token support)
    const [creatorInfo, cojamInfo, charityInfo] = await Promise.all([
      this.connection.getAccountInfo(creatorTokenAccount),
      this.connection.getAccountInfo(cojamTokenAccount),
      this.connection.getAccountInfo(charityTokenAccount),
    ]);

    if (!creatorInfo) {
      tx.add(
        createAssociatedTokenAccountInstruction(
          ownerPubkey,
          creatorTokenAccount,
          market.creator,
          bettingToken,
        ),
      );
    }

    if (!cojamInfo) {
      tx.add(
        createAssociatedTokenAccountInstruction(
          ownerPubkey,
          cojamTokenAccount,
          config.cojamFeeAccount,
          bettingToken,
        ),
      );
    }

    if (!charityInfo) {
      tx.add(
        createAssociatedTokenAccountInstruction(
          ownerPubkey,
          charityTokenAccount,
          config.charityFeeAccount,
          bettingToken,
        ),
      );
    }

    // Add success market instruction
    const successIx = await this.program.methods
      .successMarket(correctAnswerKey)
      .accountsPartial({
        owner: ownerPubkey,
        configAccount: this.configPDA,
        marketAccount: marketPDA,  // Moved before betMint (account order matters)
        betMint: bettingToken,  // Use market's betting token
        creatorTokenAccount,
        cojamTokenAccount,
        charityTokenAccount,
        vaultTokenAccount,
        answerAccount: answerPDA,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();

    tx.add(successIx);
    return tx;
  }

  async adjournMarket(marketKey: BN, owner: PublicKey): Promise<Transaction> {
    const ownerPubkey = owner;
    const marketPDA = this.getMarketPDA(marketKey);

    return await this.program.methods
      .adjournMarket()
      .accountsPartial({
        owner: ownerPubkey,
        configAccount: this.configPDA,
        marketAccount: marketPDA,
        systemProgram: SystemProgram.programId,
      })
      .transaction();
  }

  async finishMarket(marketKey: BN, owner: PublicKey): Promise<Transaction> {
    const ownerPubkey = owner;
    const marketPDA = this.getMarketPDA(marketKey);

    return await this.program.methods
      .finishMarket()
      .accountsPartial({
        owner: ownerPubkey,
        configAccount: this.configPDA,
        marketAccount: marketPDA,
        systemProgram: SystemProgram.programId,
      })
      .transaction();
  }

  async retrieveTokens(
    marketKey: BN,
    remainsTokenAccount: PublicKey,
    owner: PublicKey,
  ): Promise<Transaction> {
    const ownerPubkey = owner;
    const marketPDA = this.getMarketPDA(marketKey);

    // Get market's betting token instead of global base token
    const market = await this.fetchMarket(marketKey);
    const bettingToken = market.bettingToken;

    const vaultTokenAccount = await this.getVaultTokenAccount(
      marketKey,
      bettingToken,  // Use market's betting token
    );

    return await this.program.methods
      .retrieveTokens()
      .accountsPartial({
        owner: ownerPubkey,
        configAccount: this.configPDA,
        vaultTokenAccount,
        remainsTokenAccount,
        marketAccount: marketPDA,
        tokenProgram: TOKEN_PROGRAM_ID,
        associateTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .transaction();
  }

  // ============= User Instructions =============

  async bet(
    marketKey: BN,
    answerKey: BN,
    amount: BN,
    voter: PublicKey,
  ): Promise<Transaction> {
    const voterPubkey = voter;
    const marketPDA = this.getMarketPDA(marketKey);
    const answerPDA = this.getAnswerPDA(marketKey);
    const betPDA = this.getBettingPDA(voterPubkey, marketKey, answerKey);

    // Get market's betting token instead of global base token
    const market = await this.fetchMarket(marketKey);
    const bettingToken = market.bettingToken;

    const userTokenAccount = await getAssociatedTokenAddress(
      bettingToken,  // Use market's betting token
      voterPubkey,
    );

    const vaultTokenAccount = await this.getVaultTokenAccount(
      marketKey,
      bettingToken,  // Use market's betting token
    );

    const tx = new Transaction();

    // Auto-create user's ATA if not exists (important for multi-token support)
    const userTokenAccountInfo = await this.connection.getAccountInfo(userTokenAccount);
    if (!userTokenAccountInfo) {
      tx.add(
        createAssociatedTokenAccountInstruction(
          voterPubkey,
          userTokenAccount,
          voterPubkey,
          bettingToken,
        ),
      );
    }

    // Add bet instruction
    const betIx = await this.program.methods
      .bet(answerKey, amount)
      .accountsPartial({
        voter: voterPubkey,
        configAccount: this.configPDA,
        marketAccount: marketPDA,  // Moved before betMint (account order matters)
        betMint: bettingToken,  // Use market's betting token
        userTokenAccount,
        vaultTokenAccount,
        answerAccount: answerPDA,
        betAccount: betPDA,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .instruction();

    tx.add(betIx);
    return tx;
  }

  async receiveToken(
    marketKey: BN,
    answerKey: BN,
    voter: PublicKey,
  ): Promise<Transaction> {
    const voterPubkey = voter;
    const marketPDA = this.getMarketPDA(marketKey);
    const answerPDA = this.getAnswerPDA(marketKey);
    const betPDA = this.getBettingPDA(voterPubkey, marketKey, answerKey);

    // Get market's betting token instead of global base token
    const market = await this.fetchMarket(marketKey);
    const bettingToken = market.bettingToken;

    const userBetTokenAccount = await getAssociatedTokenAddress(
      bettingToken,  // Use market's betting token
      voterPubkey,
    );

    const vaultBetTokenAccount = await this.getVaultTokenAccount(
      marketKey,
      bettingToken,  // Use market's betting token
    );

    const tx = new Transaction();

    // Auto-create user's ATA if not exists (important for multi-token support)
    const userTokenAccountInfo = await this.connection.getAccountInfo(userBetTokenAccount);
    if (!userTokenAccountInfo) {
      tx.add(
        createAssociatedTokenAccountInstruction(
          voterPubkey,
          userBetTokenAccount,
          voterPubkey,
          bettingToken,
        ),
      );
    }

    // Add receive token instruction
    const receiveIx = await this.program.methods
      .receiveToken()
      .accountsPartial({
        voter: voterPubkey,
        configAccount: this.configPDA,
        marketAccount: marketPDA,  // Moved before betMint (account order matters)
        betMint: bettingToken,  // Use market's betting token
        userBetTokenAccount,
        vaultBetTokenAccount,
        betAccount: betPDA,
        answerAccount: answerPDA,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .instruction();

    tx.add(receiveIx);
    return tx;
  }

  // ============= Utility Methods =============

  async getAllMarkets(): Promise<
    Array<{ publicKey: PublicKey; account: MarketAccount }>
  > {
    return await this.program.account.marketAccount.all();
  }

  async getMarketsByCreator(
    creator: PublicKey,
  ): Promise<Array<{ publicKey: PublicKey; account: MarketAccount }>> {
    return await this.program.account.marketAccount.all([
      {
        memcmp: {
          offset: 8 + 1, // After discriminator and bump
          bytes: creator.toBase58(),
        },
      },
    ]);
  }

  async getUserBets(
    voter: PublicKey,
  ): Promise<Array<{ publicKey: PublicKey; account: BettingAccount }>> {
    return await this.program.account.bettingAccount.all([
      {
        memcmp: {
          offset: 8 + 1 + 8 + 8, // discriminator(8) + bump(1) + market_key(8) + answer_key(8) = 25
          bytes: anchor.utils.bytes.bs58.encode(voter.toBuffer()),
        },
      },
    ]);
  }

  async getUserBetInfo(
    voter: PublicKey,
    marketKey: BN,
    answerKey: BN,
  ): Promise<{
      exists: boolean;
      tokens: BN;
      createTime: BN;
      potentialWinnings: BN | null;
    }> {
    try {
      const betting = await this.fetchBetting(voter, marketKey, answerKey);
      const potentialWinnings = await this.calculateWinnings(
        voter,
        marketKey,
        answerKey,
      );

      return {
        exists: betting.exist,
        tokens: betting.tokens,
        createTime: betting.createTime,
        potentialWinnings,
      };
    } catch (error) {
      // Account doesn't exist
      return {
        exists: false,
        tokens: new BN(0),
        createTime: new BN(0),
        potentialWinnings: null,
      };
    }
  }

  async getUserTotalBets(voter: PublicKey): Promise<{
    totalBets: number;
    totalTokensBet: BN;
    markets: Array<{ marketKey: BN; answerKey: BN; tokens: BN }>;
  }> {
    const userBets = await this.getUserBets(voter);
    let totalTokens = new BN(0);
    const markets: Array<{ marketKey: BN; answerKey: BN; tokens: BN }> = [];

    for (const bet of userBets) {
      totalTokens = totalTokens.add(bet.account.tokens);
      markets.push({
        marketKey: bet.account.marketKey,
        answerKey: bet.account.answerKey,
        tokens: bet.account.tokens,
      });
    }

    return {
      totalBets: userBets.length,
      totalTokensBet: totalTokens,
      markets,
    };
  }

  async getMarketBets(
    marketKey: BN,
  ): Promise<Array<{ publicKey: PublicKey; account: BettingAccount }>> {
    const marketKeyBytes = marketKey.toArrayLike(Buffer, 'le', 8);
    return await this.program.account.bettingAccount.all([
      {
        memcmp: {
          offset: 8 + 1, // After discriminator and bump
          bytes: anchor.utils.bytes.bs58.encode(marketKeyBytes),
        },
      },
    ]);
  }

  async calculateWinnings(
    voter: PublicKey,
    marketKey: BN,
    answerKey: BN,
  ): Promise<BN | null> {
    try {
      const market = await this.fetchMarket(marketKey);
      const answer = await this.fetchAnswer(marketKey);
      const betting = await this.fetchBetting(voter, marketKey, answerKey);

      // Check if market is successful and user bet on correct answer
      if (
        !market.status.success
        || market.correctAnswerKey.toNumber() !== answerKey.toNumber()
      ) {
        return new BN(0);
      }

      // Find the correct answer's total tokens
      const correctAnswer = answer.answers.find(
        a => a.answerKey.toNumber() === answerKey.toNumber(),
      );
      if (!correctAnswer) {
        return null;
      }

      // Calculate percentage of reward pool
      const marketRewardBase = market.marketRewardBaseTokens;
      const userBetAmount = betting.tokens;
      const answerTotalTokens = correctAnswer.answerTotalTokens;

      if (answerTotalTokens.isZero()) {
        return new BN(0);
      }

      // Calculate: (userBetAmount * marketRewardBase) / answerTotalTokens
      const winnings = userBetAmount
        .mul(marketRewardBase)
        .div(answerTotalTokens);
      return winnings;
    } catch (error) {
      console.error('Error calculating winnings:', error);
      return null;
    }
  }

  async availableReceiveTokens(
    marketKey: BN,
    bettingKey: PublicKey,
  ): Promise<BN> {
    try {
      // Get betting account from the betting key (PDA)
      const bettingAccount = await this.program.account.bettingAccount.fetch(
        bettingKey,
      );

      // Get market and answer accounts
      const market = await this.fetchMarket(marketKey);
      const answer = await this.fetchAnswer(marketKey);

      const answerKey = bettingAccount.answerKey;
      const bettingTokens = bettingAccount.tokens;

      // Constants from the program
      const MAX_PERCENTAGE_BASIS_POINTS = new BN(10000);

      // Check market status
      if (market.status.success) {
        // Market is successful - calculate winnings for correct answer
        const correctAnswerKey = market.correctAnswerKey;

        if (answerKey.toNumber() !== correctAnswerKey.toNumber()) {
          // User bet on wrong answer - no tokens to receive
          return new BN(0);
        }

        // Find the correct answer's total tokens
        const correctAnswer = answer.answers.find(
          a => a.answerKey.toNumber() === correctAnswerKey.toNumber(),
        );
        if (!correctAnswer || correctAnswer.answerTotalTokens.isZero()) {
          return new BN(0);
        }

        // Calculate percentage and receive tokens
        const marketRewardBaseTokens = market.marketRewardBaseTokens;
        const correctAnswerTotalTokens = correctAnswer.answerTotalTokens;

        // percentage = (marketRewardBaseTokens * MAX_PERCENTAGE_BASIS_POINTS) / correctAnswerTotalTokens
        const percentage = marketRewardBaseTokens
          .mul(MAX_PERCENTAGE_BASIS_POINTS)
          .div(correctAnswerTotalTokens);

        // receive_tokens = (bettingTokens * percentage) / MAX_PERCENTAGE_BASIS_POINTS
        const receiveTokens = bettingTokens
          .mul(percentage)
          .div(MAX_PERCENTAGE_BASIS_POINTS);

        return receiveTokens;
      } else if (market.status.adjourn) {
        // Market is adjourned - everyone gets their bet back (100%)

        // Verify the answer exists
        const answerExists = answer.answers.some(
          a => a.answerKey.toNumber() === answerKey.toNumber(),
        );
        if (!answerExists) {
          return new BN(0);
        }

        // Return full bet amount
        return bettingTokens;
      } else {
        // Market is not in a claimable state (draft, approve, or finished without resolution)
        return new BN(0);
      }
    } catch (error) {
      console.error('Error calculating available receive tokens:', error);
      return new BN(0);
    }
  }

  async availableReceiveTokensByUser(
    voter: PublicKey,
    marketKey: BN,
    answerKey: BN,
  ): Promise<BN> {
    try {
      const bettingPDA = this.getBettingPDA(voter, marketKey, answerKey);
      return await this.availableReceiveTokens(marketKey, bettingPDA);
    } catch (error) {
      console.error(
        'Error calculating available receive tokens for user:',
        error,
      );
      return new BN(0);
    }
  }

  async isUserLocked(user: PublicKey): Promise<boolean> {
    const config = await this.fetchConfig();
    return config.lockedUsers.some(lockedUser => lockedUser.equals(user));
  }

  async getMarketStatus(marketKey: BN): Promise<string> {
    const market = await this.fetchMarket(marketKey);
    return Object.keys(market.status)[0];
  }

  async getMarketInfo(marketKey: BN): Promise<{
    creator: PublicKey;
    title: string;
    bettingToken: PublicKey;  // Token mint for this market
    status: string;
    totalTokens: BN;
    remainTokens: BN;
    rewardBaseTokens: BN;
    correctAnswerKey: BN | null;
    approveTime: BN;
    successTime: BN;
    adjournTime: BN;
  }> {
    const market = await this.fetchMarket(marketKey);
    return {
      creator: market.creator,
      title: market.title,
      bettingToken: market.bettingToken,  // Include betting token
      status: Object.keys(market.status)[0],
      totalTokens: market.marketTotalTokens,
      remainTokens: market.marketRemainTokens,
      rewardBaseTokens: market.marketRewardBaseTokens,
      correctAnswerKey: market.status.success ? market.correctAnswerKey : null,
      approveTime: market.approveTime,
      successTime: market.successTime,
      adjournTime: market.adjournTime,
    };
  }

  async getMarketFee(marketKey: BN): Promise<{
    creatorFee: BN;
    creatorFeePercentage: BN;
    serviceFeePercentage: BN;
    charityFeePercentage: BN;
  }> {
    const market = await this.fetchMarket(marketKey);

    return {
      creatorFee: market.creatorFee,
      creatorFeePercentage: market.creatorFeePercentage,
      serviceFeePercentage: market.serviceFeePercentage,
      charityFeePercentage: market.charityFeePercentage,
    };
  }

  async getMarketFees(marketKey: BN): Promise<{
    creatorFee: BN;
    creatorFeePercentage: BN;
    serviceFeePercentage: BN;
    charityFeePercentage: BN;
    totalFeePercentage: number;
  }> {
    const market = await this.fetchMarket(marketKey);
    const totalFeePercentage
      = (market.creatorFeePercentage.toNumber()
      + market.serviceFeePercentage.toNumber()
      + market.charityFeePercentage.toNumber())
      / 10000; // Convert from basis points to percentage

    return {
      creatorFee: market.creatorFee,
      creatorFeePercentage: market.creatorFeePercentage,
      serviceFeePercentage: market.serviceFeePercentage,
      charityFeePercentage: market.charityFeePercentage,
      totalFeePercentage,
    };
  }

  async getAnswerInfo(
    marketKey: BN,
    answerKey: BN,
  ): Promise<{
    totalTokens: BN;
    percentage: number;
  } | null> {
    const answer = await this.fetchAnswer(marketKey);
    const market = await this.fetchMarket(marketKey);

    const answerData = answer.answers.find(
      a => a.answerKey.toNumber() === answerKey.toNumber(),
    );
    if (!answerData) {
      return null;
    }

    const percentage = market.marketTotalTokens.isZero()
      ? 0
      : (answerData.answerTotalTokens.toNumber()
      / market.marketTotalTokens.toNumber())
      * 100;

    return {
      totalTokens: answerData.answerTotalTokens,
      percentage,
    };
  }

  async getAllAnswersInfo(marketKey: BN): Promise<
    Array<{
      answerKey: BN;
      totalTokens: BN;
      percentage: number;
    }>
  > {
    const answer = await this.fetchAnswer(marketKey);
    const market = await this.fetchMarket(marketKey);

    return answer.answers.map((a) => {
      const percentage = market.marketTotalTokens.isZero()
        ? 0
        : (a.answerTotalTokens.toNumber()
        / market.marketTotalTokens.toNumber())
        * 100;

      return {
        answerKey: a.answerKey,
        totalTokens: a.answerTotalTokens,
        percentage,
      };
    });
  }

  // ============= Transaction Building Methods =============

  async buildBetTransaction(
    marketKey: BN,
    answerKey: BN,
    amount: BN,
    voter: PublicKey,
  ): Promise<Transaction> {
    const voterPubkey = voter;
    const marketPDA = this.getMarketPDA(marketKey);
    const answerPDA = this.getAnswerPDA(marketKey);
    const betPDA = this.getBettingPDA(voterPubkey, marketKey, answerKey);

    // Get market's betting token instead of global base token
    const market = await this.fetchMarket(marketKey);
    const bettingToken = market.bettingToken;

    const userTokenAccount = await getAssociatedTokenAddress(
      bettingToken,  // Use market's betting token
      voterPubkey,
    );

    const vaultTokenAccount = await this.getVaultTokenAccount(
      marketKey,
      bettingToken,  // Use market's betting token
    );

    const tx = new Transaction();

    // Check if user token account exists, if not add creation instruction
    const userTokenAccountInfo
      = await this.program.provider.connection.getAccountInfo(userTokenAccount);
    if (!userTokenAccountInfo) {
      tx.add(
        createAssociatedTokenAccountInstruction(
          voterPubkey,
          userTokenAccount,
          voterPubkey,
          bettingToken,  // Use market's betting token
        ),
      );
    }

    // Add bet instruction
    const betIx = await this.program.methods
      .bet(answerKey, amount)
      .accountsPartial({
        voter: voterPubkey,
        configAccount: this.configPDA,
        marketAccount: marketPDA,  // Moved before betMint (account order matters)
        betMint: bettingToken,  // Use market's betting token
        userTokenAccount,
        vaultTokenAccount,
        answerAccount: answerPDA,
        betAccount: betPDA,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .instruction();

    tx.add(betIx);
    return tx;
  }

  // ============= Event Listeners =============

  addEventListener<T = any>(
    eventName:
      | 'betPlaced'
      | 'marketPublished'
      | 'marketSuccess'
      | 'marketAdjourned'
      | 'tokenReceived',
    callback: (event: T, slot: number, signature: string) => void,
  ): number {
    return this.program.addEventListener(eventName as any, callback);
  }

  removeEventListener(listenerId: number): Promise<void> {
    return this.program.removeEventListener(listenerId);
  }

  // ============= Transaction Execution Helpers =============

  /**
   * Combine multiple transactions into one
   * @param txs Array of transactions to combine
   * @returns Combined transaction
   */
  combineTransactions(txs: Transaction[]): Transaction {
    const combined = new Transaction();
    for (const tx of txs) {
      for (const ix of tx.instructions) {
        combined.add(ix);
      }
    }
    return combined;
  }

  /**
   * Add priority fee to a transaction
   * @param tx The transaction to add priority fee to
   * @param microLamports Priority fee in microLamports per compute unit
   * @param computeUnits Optional compute unit limit (default: 200000)
   * @returns The transaction with priority fee added
   */
  addPriorityFee(
    tx: Transaction,
    microLamports: number,
    computeUnits: number = 200000,
  ): Transaction {
    // Import ComputeBudgetProgram

    // Add compute unit price instruction
    const computePriceIx = ComputeBudgetProgram.setComputeUnitPrice({
      microLamports,
    });

    // Add compute unit limit instruction
    const computeLimitIx = ComputeBudgetProgram.setComputeUnitLimit({
      units: computeUnits,
    });

    // Create new transaction with priority fee instructions at the beginning
    const priorityTx = new Transaction();
    priorityTx.add(computePriceIx);
    priorityTx.add(computeLimitIx);

    // Add original instructions
    for (const ix of tx.instructions) {
      priorityTx.add(ix);
    }

    return priorityTx;
  }
}
