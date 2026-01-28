use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq, InitSpace)]
pub enum DecisionVoteChoice {
    Success,
    Adjourn,
}

#[account]
#[derive(Debug, InitSpace)]
pub struct DecisionVote {
    pub quest_key: u64,
    pub count_success: u64,
    pub count_adjourn: u64,
    pub total_voted: u64,
    pub finalized: bool,
    pub bump: u8,
}

#[account]
#[derive(Debug, InitSpace)]
pub struct DecisionVoterRecord {
    pub quest_key: u64,
    pub voter: Pubkey,
    pub vote_choice: DecisionVoteChoice,
    pub votes: u64,
    pub timestamp: i64,
    pub bump: u8,
}
