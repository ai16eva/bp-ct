use anchor_lang::prelude::*;
use crate::states::*;
use crate::errors::GovernanceError;
use crate::constant::{GOVERNANCE_CONFIG_SEED, GOVERNANCE_ITEM_SEED, ANSWER_VOTE_SEED};

#[derive(Accounts)]
#[instruction(quest_key: u64)]
pub struct CancelAnswer<'info> {
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
        mut,
        seeds = [ANSWER_VOTE_SEED, quest_key.to_le_bytes().as_ref()],
        bump = answer_vote.bump
    )]
    pub answer_vote: Account<'info, AnswerVote>,
}

pub fn cancel_answer(
    ctx: Context<CancelAnswer>,
    _quest_key: u64,
    reason: String
) -> Result<()> {
    let answer_vote = &mut ctx.accounts.answer_vote;

    // Verify answer voting is not already finalized
    require!(
        !answer_vote.finalized,
        GovernanceError::AnswerVoteFinalized
    );

    // Mark as finalized with no winner (0 means cancelled)
    answer_vote.finalized = true;
    answer_vote.winning_answer = 0;

    // Log the cancellation reason
    msg!("Answer voting cancelled. Reason: {}", reason);

    Ok(())
}