use anchor_lang::prelude::*;
use crate::states::*;
use crate::errors::GovernanceError;
use crate::constant::{GOVERNANCE_CONFIG_SEED, GOVERNANCE_ITEM_SEED, QUEST_VOTE_SEED};

#[derive(Accounts)]
#[instruction(quest_key: u64)]
pub struct CancelQuest<'info> {
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
}

pub fn cancel_quest(ctx: Context<CancelQuest>, quest_key: u64) -> Result<()> {
    let governance_item = &mut ctx.accounts.governance_item;
    let quest_vote = &mut ctx.accounts.quest_vote;
    let governance = &mut ctx.accounts.governance;
    
    require!(
        governance_item.quest_result == QuestResult::Pending,
        GovernanceError::QuestAlreadyFinalized
    );
    
    governance_item.quest_result = QuestResult::Rejected;
    quest_vote.finalized = true;
    
    governance.active_items -= 1;
    governance.completed_items += 1;
    
    emit!(QuestCancelled {
        quest_key,
        total_voted: quest_vote.total_voted,
    });
    
    Ok(())
}

#[event]
pub struct QuestCancelled {
    pub quest_key: u64,
    pub total_voted: u64,
}