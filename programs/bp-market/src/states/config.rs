use anchor_lang::prelude::*;

pub const CONFIG_SEED: &str = "config";
pub const MAX_LOCKED_USERS: usize = 100;

#[account]
#[derive(Debug, InitSpace)]
pub struct ConfigAccount {
    pub bump: u8,
    pub owner: Pubkey,
    pub base_token: Pubkey,
    pub cojam_fee_account: Pubkey,
    pub charity_fee_account: Pubkey,
    pub remain_account: Pubkey,
    #[max_len(MAX_LOCKED_USERS)]
    pub locked_users: Vec<Pubkey>,
}