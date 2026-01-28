use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq, Eq, InitSpace)]
pub enum ProposalResult {
    Pending,
    Yes,
    No,
}

impl Default for ProposalResult {
    fn default() -> Self {
        ProposalResult::Pending
    }
}

#[account]
#[derive(Debug, InitSpace)]
pub struct Proposal {
    pub proposal_key: u64,
    pub creator: Pubkey,
    #[max_len(200)]
    pub title: String,
    pub result: ProposalResult,
    pub total_vote: u16,
    pub result_vote: u16,
    pub end_time: i64,
    pub start_block: u64,
    pub bump: u8,
}