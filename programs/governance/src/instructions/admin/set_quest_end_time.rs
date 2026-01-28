use anchor_lang::prelude::*;
use crate::states::*;
use crate::errors::GovernanceError;
use crate::constant::{GOVERNANCE_CONFIG_SEED, GOVERNANCE_ITEM_SEED};

#[derive(Accounts)]
#[instruction(quest_key: u64)]
pub struct SetQuestEndTime<'info> {
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

pub fn set_quest_end_time(ctx: Context<SetQuestEndTime>, quest_key: u64, new_end_time: i64) -> Result<()> {
    let governance_item = &mut ctx.accounts.governance_item;

    // Validate the quest is in quest phase
    require!(
        governance_item.quest_result == QuestResult::Pending,
        GovernanceError::InvalidPhase
    );

    // Validate new end time is after start time
    require!(
        new_end_time > governance_item.quest_start_time,
        GovernanceError::InvalidParameter
    );

    let old_end_time = governance_item.quest_end_time;
    governance_item.quest_end_time = new_end_time;

    emit!(QuestEndTimeUpdated {
        quest_key,
        old_end_time,
        new_end_time,
        updated_by: ctx.accounts.authority.key(),
    });

    msg!(
        "Quest {} end time updated from {} to {}",
        quest_key,
        old_end_time,
        new_end_time
    );

    Ok(())
}

#[event]
pub struct QuestEndTimeUpdated {
    pub quest_key: u64,
    pub old_end_time: i64,
    pub new_end_time: i64,
    pub updated_by: Pubkey,
}
