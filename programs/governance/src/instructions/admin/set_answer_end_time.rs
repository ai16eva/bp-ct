use anchor_lang::prelude::*;
use crate::states::*;
use crate::errors::GovernanceError;
use crate::constant::{GOVERNANCE_CONFIG_SEED, GOVERNANCE_ITEM_SEED, ANSWER_VOTE_SEED};

#[derive(Accounts)]
#[instruction(quest_key: u64)]
pub struct SetAnswerEndTime<'info> {
    #[account(
        seeds = [GOVERNANCE_CONFIG_SEED],
        bump = config.bump,
        constraint = config.authority == authority.key() @ GovernanceError::Unauthorized
    )]
    pub config: Account<'info, GovernanceConfig>,

    #[account(
        mut,
        seeds = [GOVERNANCE_ITEM_SEED, quest_key.to_le_bytes().as_ref()],
        bump = governance_item.bump,
    )]
    pub governance_item: Account<'info, GovernanceItem>,

    #[account(
        seeds = [ANSWER_VOTE_SEED, quest_key.to_le_bytes().as_ref()],
        bump = answer_vote.bump,
        constraint = !answer_vote.finalized @ GovernanceError::AlreadyFinalized
    )]
    pub answer_vote: Account<'info, AnswerVote>,

    pub authority: Signer<'info>,

    pub clock: Sysvar<'info, Clock>,
}

pub fn set_answer_end_time(ctx: Context<SetAnswerEndTime>, quest_key: u64, new_end_time: i64) -> Result<()> {
    let governance_item = &mut ctx.accounts.governance_item;
    let clock = &ctx.accounts.clock;

    // Validate answer phase has started
    require!(
        governance_item.answer_start_time > 0,
        GovernanceError::InvalidPhase
    );

    // Validate new end time is in the future
    require!(
        new_end_time > clock.unix_timestamp,
        GovernanceError::InvalidParameter
    );

    // Validate new end time is after start time
    require!(
        new_end_time > governance_item.answer_start_time,
        GovernanceError::InvalidParameter
    );

    let old_end_time = governance_item.answer_end_time;
    governance_item.answer_end_time = new_end_time;

    emit!(AnswerEndTimeUpdated {
        quest_key,
        old_end_time,
        new_end_time,
        updated_by: ctx.accounts.authority.key(),
    });

    msg!(
        "Answer {} end time updated from {} to {}",
        quest_key,
        old_end_time,
        new_end_time
    );

    Ok(())
}

#[event]
pub struct AnswerEndTimeUpdated {
    pub quest_key: u64,
    pub old_end_time: i64,
    pub new_end_time: i64,
    pub updated_by: Pubkey,
}
