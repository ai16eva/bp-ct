use anchor_lang::prelude::*;
use crate::states::*;
use crate::errors::GovernanceError;
use crate::constant::{GOVERNANCE_CONFIG_SEED, GOVERNANCE_ITEM_SEED};

#[derive(Accounts)]
#[instruction(quest_key: u64)]
pub struct SetDecisionEndTime<'info> {
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

    pub authority: Signer<'info>,

    pub clock: Sysvar<'info, Clock>,
}

pub fn set_decision_end_time(ctx: Context<SetDecisionEndTime>, quest_key: u64, new_end_time: i64) -> Result<()> {
    let governance_item = &mut ctx.accounts.governance_item;

    // Validate the quest is in decision phase
    require!(
        governance_item.decision_result == DecisionResult::Pending,
        GovernanceError::InvalidPhase
    );

    // Validate decision phase has started
    require!(
        governance_item.decision_start_time > 0,
        GovernanceError::InvalidPhase
    );

    // Validate new end time is after start time
    require!(
        new_end_time > governance_item.decision_start_time,
        GovernanceError::InvalidParameter
    );

    let old_end_time = governance_item.decision_end_time;
    governance_item.decision_end_time = new_end_time;

    emit!(DecisionEndTimeUpdated {
        quest_key,
        old_end_time,
        new_end_time,
        updated_by: ctx.accounts.authority.key(),
    });

    msg!(
        "Decision {} end time updated from {} to {}",
        quest_key,
        old_end_time,
        new_end_time
    );

    Ok(())
}

#[event]
pub struct DecisionEndTimeUpdated {
    pub quest_key: u64,
    pub old_end_time: i64,
    pub new_end_time: i64,
    pub updated_by: Pubkey,
}
