use anchor_lang::prelude::*;

pub const MARKET_SEED: &str = "market";

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug, InitSpace)]
pub enum MarketStatus {
    Draft,
    Approve,
    Finished,
    Success,
    Adjourn,
}

#[account]
#[derive(Debug, InitSpace)]
pub struct MarketAccount {
    pub bump: u8,
    pub creator: Pubkey,
    pub market_key: u64,
    pub betting_token: Pubkey,  // Token mint for this market's bets
    #[max_len(MAX_TITLE_LEN)]
    pub title: String,
    pub status: MarketStatus,
    pub creator_fee: u64,
    pub creator_fee_percentage: u64,
    pub service_fee_percentage: u64,
    pub charity_fee_percentage: u64,
    pub approve_time: u64,
    pub finish_time: u64,
    pub adjourn_time: u64,
    pub success_time: u64,
    pub correct_answer_key: u64,
    pub market_total_tokens: u64,
    pub market_remain_tokens: u64,
    pub market_reward_base_tokens: u64,
}

pub const MAX_MARKET_KEY: usize = 100;

pub const MAX_TITLE_LEN: usize = 100;
