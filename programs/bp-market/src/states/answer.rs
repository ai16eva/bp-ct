use anchor_lang::prelude::*;

pub const MAX_ANWSER: usize = 10;

pub const ANSWER_SEED: &str = "answer";

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, InitSpace)]
pub struct Answer {
    pub answer_key: u64,
    pub answer_total_tokens: u64,
}

#[account]
#[derive(Debug, InitSpace)]
pub struct AnswerAccount {
    pub bump: u8,
    #[max_len(MAX_ANWSER)]
    pub answers: Vec<Answer>,
    pub exist: bool,
}
