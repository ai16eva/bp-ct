use anchor_lang::prelude::*;

#[account]
#[derive(Debug, InitSpace)]
pub struct AnswerVote {
    pub quest_key: u64,
    pub total_voted: u64,
    pub finalized: bool,
    pub winning_answer: u64,
    pub bump: u8,
}

#[account]
#[derive(Debug, InitSpace)]
pub struct AnswerOption {
    pub quest_key: u64,
    pub answer_key: u64,
    pub total_votes: u64,
    pub is_active: bool,
    pub bump: u8,
}

#[account]
#[derive(Debug, InitSpace)]
pub struct AnswerVoterRecord {
    pub quest_key: u64,
    pub voter: Pubkey,
    pub answer_key: u64,
    pub vote_count: u8,
    pub timestamp: i64,
    pub rewarded: bool,
    pub bump: u8,
}
