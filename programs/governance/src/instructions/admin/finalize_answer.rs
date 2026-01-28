use anchor_lang::prelude::*;
use crate::states::*;
use crate::errors::GovernanceError;
use crate::constant::{GOVERNANCE_CONFIG_SEED, GOVERNANCE_ITEM_SEED, ANSWER_VOTE_SEED};

#[derive(Accounts)]
#[instruction(quest_key: u64)]
pub struct FinalizeAnswer<'info> {
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

    pub clock: Sysvar<'info, Clock>,
}

pub fn finalize_answer(
    ctx: Context<FinalizeAnswer>,
    quest_key: u64,
) -> Result<()> {
    let governance_item = &ctx.accounts.governance_item;
    let answer_vote = &mut ctx.accounts.answer_vote;
    let clock = &ctx.accounts.clock;

    msg!(
        "[ONCHAIN] [finalize_answer] Finalizing quest {}",
        quest_key
    );

    require!(
        !answer_vote.finalized,
        GovernanceError::AnswerVoteFinalized
    );

    require!(
        governance_item.answer_result != 0,
        GovernanceError::AnswerResultEmpty
    );

    answer_vote.winning_answer = governance_item.answer_result;
    answer_vote.finalized = true;

    emit!(AnswerFinalized {
        quest_key,
        winning_answer: answer_vote.winning_answer,
        finalized_at: clock.unix_timestamp as u64,
    });

    Ok(())
}

#[event]
pub struct AnswerFinalized {
    pub quest_key: u64,
    pub winning_answer: u64,
    pub finalized_at: u64,
}

