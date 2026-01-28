use anchor_lang::prelude::*;
use crate::states::*;
use crate::errors::GovernanceError;
use crate::constant::{GOVERNANCE_CONFIG_SEED, GOVERNANCE_ITEM_SEED, DECISION_VOTE_SEED};

#[derive(Accounts)]
#[instruction(quest_key: u64)]
pub struct CancelDecision<'info> {
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
        seeds = [DECISION_VOTE_SEED, quest_key.to_le_bytes().as_ref()],
        bump = decision_vote.bump
    )]
    pub decision_vote: Account<'info, DecisionVote>,

    pub authority: Signer<'info>,
}

pub fn cancel_decision(ctx: Context<CancelDecision>, quest_key: u64) -> Result<()> {
    let governance_item = &mut ctx.accounts.governance_item;
    let decision_vote = &mut ctx.accounts.decision_vote;

    // Validate that quest key matches
    require!(
        governance_item.quest_key == quest_key,
        GovernanceError::InvalidParameter
    );

    // Check that the quest was approved before decision phase could start
    require!(
        governance_item.quest_result == QuestResult::Approved,
        GovernanceError::QuestNotApproved
    );

    // Check that decision phase is active (started but not finalized)
    require!(
        governance_item.decision_start_time > 0,
        GovernanceError::InvalidParameter
    );

    require!(
        !decision_vote.finalized,
        GovernanceError::DecisionAlreadyFinalized
    );

    // Cancel the decision phase
    governance_item.decision_result = DecisionResult::Adjourn; // Mark as adjourned when cancelled
    governance_item.decision_end_time = Clock::get()?.unix_timestamp;

    // Mark decision vote as finalized
    decision_vote.finalized = true;

    emit!(DecisionCancelled {
        quest_key,
        cancelled_by: ctx.accounts.authority.key(),
        total_votes_at_cancellation: decision_vote.total_voted,
        timestamp: Clock::get()?.unix_timestamp,
    });

    msg!(
        "Decision phase cancelled for quest {} by {}",
        quest_key,
        ctx.accounts.authority.key()
    );

    Ok(())
}

#[event]
pub struct DecisionCancelled {
    pub quest_key: u64,
    pub cancelled_by: Pubkey,
    pub total_votes_at_cancellation: u64,
    pub timestamp: i64,
}