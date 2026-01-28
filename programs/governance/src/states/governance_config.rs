use anchor_lang::prelude::*;

#[account]
#[derive(Debug, InitSpace)]
pub struct GovernanceConfig {
    pub authority: Pubkey,
    pub base_token_mint: Pubkey,
    pub base_nft_collection: Pubkey,
    pub treasury_bump: u8,
    pub paused: bool,
    pub min_total_vote: u64,
    pub max_total_vote: u64,
    pub min_required_nft: u8,
    pub max_votable_nft: u8,
    pub duration_hours: u64,
    pub constant_reward_token: u64,
    pub total_governance: u64,
    pub bump: u8,
}
