use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq, InitSpace)]
pub enum QuestVoteChoice {
    Approve,
    Reject,
}

#[account]
#[derive(Debug, InitSpace)]
pub struct QuestVote {
    pub quest_key: u64,
    pub count_approver: u64,
    pub count_rejector: u64,
    pub total_voted: u64,
    pub finalized: bool,
    pub bump: u8,
}

#[account]
#[derive(Debug, InitSpace)]
pub struct QuestVoterRecord {
    pub quest_key: u64,
    pub voter: Pubkey,
    pub vote_count: u8,
    pub vote_choice: QuestVoteChoice,
    pub timestamp: i64,
    pub bump: u8,
}

