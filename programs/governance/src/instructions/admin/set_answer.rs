use anchor_lang::prelude::*;
use crate::states::*;
use crate::errors::GovernanceError;
use crate::constant::{GOVERNANCE_CONFIG_SEED, GOVERNANCE_ITEM_SEED, ANSWER_VOTE_SEED};

#[derive(Accounts)]
#[instruction(quest_key: u64)]
pub struct SetAnswer<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        seeds = [GOVERNANCE_CONFIG_SEED],
        bump = config.bump,
        constraint = config.authority == authority.key() @ GovernanceError::Unauthorized
    )]
    pub config: Account<'info, GovernanceConfig>,

    #[account(
        mut,
        seeds = [GOVERNANCE_ITEM_SEED, quest_key.to_le_bytes().as_ref()],
        bump = governance_item.bump
    )]
    pub governance_item: Account<'info, GovernanceItem>,

    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + AnswerVote::INIT_SPACE,
        seeds = [ANSWER_VOTE_SEED, quest_key.to_le_bytes().as_ref()],
        bump
    )]
    pub answer_vote: Account<'info, AnswerVote>,

    pub system_program: Program<'info, System>,
}

pub fn set_answer(
    ctx: Context<SetAnswer>,
    quest_key: u64,
    answer_keys: Vec<u64>
) -> Result<()> {
    let governance_item = &mut ctx.accounts.governance_item;
    let answer_vote = &mut ctx.accounts.answer_vote;

    // Initialize answer_vote if first time
    if answer_vote.quest_key == 0 {
        answer_vote.quest_key = quest_key;
        answer_vote.total_voted = 0;
        answer_vote.finalized = false;
        answer_vote.winning_answer = 0;
        answer_vote.bump = ctx.bumps.answer_vote;
    }

    // Verify quest is not already finalized
    require!(
        !answer_vote.finalized,
        GovernanceError::AnswerVoteFinalized
    );

    require!(!answer_keys.is_empty(), GovernanceError::InvalidAnswerKeys);

    let winning_answer = answer_keys[0];

    // Update governance item - set to non-zero to enable voting
    // Use the first answer key as the initial value
    governance_item.answer_result = winning_answer;

    // Reset voting state - finalized will be set after answer phase completes
    answer_vote.winning_answer = 0;
    answer_vote.finalized = false;

    Ok(())
}