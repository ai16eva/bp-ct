use anchor_lang::prelude::*;

#[account]
#[derive(Debug, InitSpace)]
pub struct Governance {
    pub config: Pubkey,
    pub total_items: u64,
    pub active_items: u64,
    pub completed_items: u64,
    pub total_rewards_distributed: u64,
    pub total_nfts_minted: u64,
    pub collection_mint: Pubkey,
    pub collection_created_at: i64,
    pub bump: u8,
}