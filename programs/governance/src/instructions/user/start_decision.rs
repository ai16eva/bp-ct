use anchor_lang::prelude::*;
use crate::states::*;
use crate::errors::GovernanceError;
use crate::constant::{ACCOUNT_DISCRIMINATOR, GOVERNANCE_CONFIG_SEED, GOVERNANCE_ITEM_SEED, DECISION_VOTE_SEED};

#[derive(Accounts)]
#[instruction(quest_key: u64)]
pub struct StartDecision<'info> {
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
        init,
        payer = authority,
        space = ACCOUNT_DISCRIMINATOR + DecisionVote::INIT_SPACE,
        seeds = [DECISION_VOTE_SEED, quest_key.to_le_bytes().as_ref()],
        bump
    )]
    pub decision_vote: Account<'info, DecisionVote>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

pub fn start_decision(ctx: Context<StartDecision>, quest_key: u64) -> Result<()> {
    let config = &ctx.accounts.config;
    let governance_item = &mut ctx.accounts.governance_item;
    let decision_vote = &mut ctx.accounts.decision_vote;
    let clock = &ctx.accounts.clock;

    // Check that the voting period has ended
    require!(
        clock.unix_timestamp > governance_item.quest_end_time,
        GovernanceError::VotingPeriodNotEnded
    );

    require!(
        governance_item.quest_result == QuestResult::Approved,
        GovernanceError::QuestNotApproved
    );

    require!(
        governance_item.decision_result == DecisionResult::Pending,
        GovernanceError::DecisionAlreadyStarted
    );

    let current_time = clock.unix_timestamp;
    let end_time = current_time + (config.duration_hours as i64 * 3600);
    
    governance_item.decision_start_time = current_time;
    governance_item.decision_end_time = end_time;
    
    decision_vote.quest_key = quest_key;
    decision_vote.count_success = 0;
    decision_vote.count_adjourn = 0;
    decision_vote.total_voted = 0;
    decision_vote.finalized = false;
    decision_vote.bump = ctx.bumps.decision_vote;
    
    emit!(DecisionStarted {
        quest_key,
        created_at: current_time as u64,
        end_at: end_time as u64,
    });
    
    Ok(())
}

#[event]
pub struct DecisionStarted {
    pub quest_key: u64,
    pub created_at: u64,
    pub end_at: u64,
}