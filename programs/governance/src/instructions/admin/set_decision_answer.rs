use anchor_lang::prelude::*;
use crate::states::*;
use crate::errors::GovernanceError;
use crate::constant::{ACCOUNT_DISCRIMINATOR, GOVERNANCE_CONFIG_SEED, GOVERNANCE_ITEM_SEED, DECISION_VOTE_SEED, ANSWER_VOTE_SEED};

#[derive(Accounts)]
#[instruction(quest_key: u64)]
pub struct SetDecisionAndExecuteAnswer<'info> {
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
    
    #[account(
        init,
        payer = authority,
        space = ACCOUNT_DISCRIMINATOR + AnswerVote::INIT_SPACE,
        seeds = [ANSWER_VOTE_SEED, quest_key.to_le_bytes().as_ref()],
        bump
    )]
    pub answer_vote: Account<'info, AnswerVote>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

pub fn set_decision_answer(
    ctx: Context<SetDecisionAndExecuteAnswer>,
    quest_key: u64,
    answer_keys: Vec<u64>,
) -> Result<()> {
    let config = &ctx.accounts.config;
    let governance_item = &mut ctx.accounts.governance_item;
    let decision_vote = &mut ctx.accounts.decision_vote;
    let answer_vote = &mut ctx.accounts.answer_vote;
    let clock = &ctx.accounts.clock;
    
    require!(
        governance_item.decision_result == DecisionResult::Pending,
        GovernanceError::DecisionAlreadyFinalized
    );
    
    require!(
        clock.unix_timestamp > governance_item.decision_end_time,
        GovernanceError::VotingPeriodNotEnded
    );
    
    require!(
        decision_vote.total_voted >= config.min_total_vote,
        GovernanceError::InsufficientVotes
    );
    
    let result = if decision_vote.count_success > decision_vote.count_adjourn {
        DecisionResult::Success
    } else {
        DecisionResult::Adjourn
    };
    
    governance_item.decision_result = result.clone();
    decision_vote.finalized = true;
    
    if result == DecisionResult::Success {
        let current_time = clock.unix_timestamp;
        let end_time = current_time + (config.duration_hours as i64 * 3600);
        
        governance_item.answer_start_time = current_time;
        governance_item.answer_end_time = end_time;
        governance_item.answer_keys = answer_keys;
        
        answer_vote.quest_key = quest_key;
        answer_vote.total_voted = 0;
        answer_vote.finalized = false;
        answer_vote.winning_answer = 0;
        answer_vote.bump = ctx.bumps.answer_vote;
        
        emit!(AnswerStarted {
            quest_key,
            created_at: current_time as u64,
            end_at: end_time as u64,
        });
    }
    
    emit!(DecisionResultSet {
        quest_key,
        result: if result == DecisionResult::Success { "success".to_string() } else { "adjourn".to_string() },
    });
    
    Ok(())
}

#[event]
pub struct DecisionResultSet {
    pub quest_key: u64,
    pub result: String,
}

#[event]
pub struct AnswerStarted {
    pub quest_key: u64,
    pub created_at: u64,
    pub end_at: u64,
}