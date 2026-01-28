use anchor_lang::prelude::*;
pub const BETTING_SEED: &str = "betting";

#[account]
#[derive(Debug, InitSpace)]
pub struct BettingAccount {
    pub bump: u8, //bump for identify
    pub market_key: u64,
    pub answer_key: u64,
    pub voter: Pubkey,
    pub tokens: u64,
    pub create_time: u64,
    pub exist: bool,
}
