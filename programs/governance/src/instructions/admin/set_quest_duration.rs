use anchor_lang::prelude::*;
use crate::states::*;
use crate::errors::GovernanceError;
use crate::constant::GOVERNANCE_CONFIG_SEED;

#[derive(Accounts)]
pub struct SetQuestDurationHours<'info> {
    #[account(
        mut,
        seeds = [GOVERNANCE_CONFIG_SEED],
        bump = config.bump,
        constraint = config.authority == authority.key() @ GovernanceError::Unauthorized
    )]
    pub config: Account<'info, GovernanceConfig>,

    pub authority: Signer<'info>,
}

pub fn set_quest_duration(ctx: Context<SetQuestDurationHours>, hours: u64) -> Result<()> {
    let config = &mut ctx.accounts.config;

    // Validate the duration is reasonable (at least 1 hour, max 30 days)
    require!(
        hours > 0,
        GovernanceError::InvalidDuration
    );

    require!(
        hours <= 720, // 30 days maximum
        GovernanceError::InvalidParameter
    );

    // Update the quest duration
    let old_duration = config.duration_hours;
    config.duration_hours = hours;

    emit!(QuestDurationUpdated {
        old_duration,
        new_duration: hours,
        updated_by: ctx.accounts.authority.key(),
    });

    msg!(
        "Quest duration updated from {} hours to {} hours",
        old_duration,
        hours
    );

    Ok(())
}

#[event]
pub struct QuestDurationUpdated {
    pub old_duration: u64,
    pub new_duration: u64,
    pub updated_by: Pubkey,
}