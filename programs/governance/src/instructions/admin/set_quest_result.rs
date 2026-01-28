use anchor_lang::prelude::*;
use crate::states::*;
use crate::errors::GovernanceError;
use crate::constant::{GOVERNANCE_CONFIG_SEED, GOVERNANCE_ITEM_SEED, QUEST_VOTE_SEED};

#[derive(Accounts)]
#[instruction(quest_key: u64)]
pub struct SetQuestResult<'info> {
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
        seeds = [QUEST_VOTE_SEED, quest_key.to_le_bytes().as_ref()],
        bump = quest_vote.bump
    )]
    pub quest_vote: Account<'info, QuestVote>,
    
    #[account(
        mut,
        seeds = [b"governance"],
        bump
    )]
    pub governance: Account<'info, Governance>,
    
    pub authority: Signer<'info>,
    pub clock: Sysvar<'info, Clock>,
}

pub fn set_quest_result(ctx: Context<SetQuestResult>, quest_key: u64) -> Result<()> {
    let config = &ctx.accounts.config;
    let governance_item = &mut ctx.accounts.governance_item;
    let quest_vote = &mut ctx.accounts.quest_vote;
    let governance = &mut ctx.accounts.governance;
    let clock = &ctx.accounts.clock;
    
    require!(
        governance_item.quest_result == QuestResult::Pending,
        GovernanceError::QuestAlreadyFinalized
    );
    
    require!(
        clock.unix_timestamp > governance_item.quest_end_time,
        GovernanceError::VotingPeriodNotEnded
    );
    
    require!(
        quest_vote.total_voted >= config.min_total_vote,
        GovernanceError::InsufficientVotes
    );
    
    require!(!quest_vote.finalized, GovernanceError::AlreadyFinalized);
    
    let result = if quest_vote.count_approver > quest_vote.count_rejector {
        QuestResult::Approved
    } else {
        QuestResult::Rejected
    };
    
    governance_item.quest_result = result.clone();
    quest_vote.finalized = true;
    quest_vote.total_voted = quest_vote.count_approver + quest_vote.count_rejector;
    
    if result == QuestResult::Rejected {
        governance.active_items -= 1;
        governance.completed_items += 1;
    }
    
    emit!(QuestResultSet {
        quest_key,
        result: if result == QuestResult::Approved { "approve".to_string() } else { "reject".to_string() },
    });
    
    Ok(())
}

#[event]
pub struct QuestResultSet {
    pub quest_key: u64,
    pub result: String,
}