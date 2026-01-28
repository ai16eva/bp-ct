use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq, InitSpace)]
pub enum QuestResult {
    Pending,
    Approved,
    Rejected,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq, InitSpace)]
pub enum DecisionResult {
    Pending,
    Success,
    Adjourn,
}

#[account]
#[derive(Debug, InitSpace)]
pub struct GovernanceItem {
    pub quest_key: u64,
    #[max_len(280)]
    pub question: String,
    pub creator: Pubkey,
    pub quest_result: QuestResult,
    pub decision_result: DecisionResult,
    pub answer_result: u64, // Winning answer key
    pub start_slot: u64,
    pub quest_start_time: i64,
    pub quest_end_time: i64,
    pub decision_start_time: i64,
    pub decision_end_time: i64,
    pub answer_start_time: i64,
    pub answer_end_time: i64,
    #[max_len(10)]
    pub answer_keys: Vec<u64>, // Dynamic array of answer options
    pub bump: u8,
}