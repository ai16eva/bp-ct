use anchor_lang::prelude::*;

#[account]
#[derive(Debug, InitSpace)]
pub struct VoterNftRecord {
    pub voter: Pubkey,
    pub nft_mint: Pubkey,
    pub collection: Pubkey,
    pub verified: bool,
    pub bump: u8,
}