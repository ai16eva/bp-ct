use anchor_lang::prelude::*;
use crate::states::*;
use crate::errors::GovernanceError;
use crate::constant::GOVERNANCE_CONFIG_SEED;

#[derive(Accounts)]
pub struct Pause<'info> {
    #[account(
        mut,
        seeds = [GOVERNANCE_CONFIG_SEED],
        bump = config.bump,
        constraint = config.authority == authority.key() @ GovernanceError::Unauthorized
    )]
    pub config: Account<'info, GovernanceConfig>,

    pub authority: Signer<'info>,
}

pub fn pause(ctx: Context<Pause>, paused: bool) -> Result<()> {
    let config = &mut ctx.accounts.config;

    // Update pause state
    let was_paused = config.paused;
    config.paused = paused;

    if paused {
        emit!(GovernancePaused {
            paused_by: ctx.accounts.authority.key(),
        });
        msg!("Governance system paused");
    } else {
        emit!(GovernanceUnpaused {
            unpaused_by: ctx.accounts.authority.key(),
        });
        msg!("Governance system unpaused");
    }

    msg!(
        "Governance pause state changed from {} to {}",
        was_paused,
        paused
    );

    Ok(())
}

#[event]
pub struct GovernancePaused {
    pub paused_by: Pubkey,
}

#[event]
pub struct GovernanceUnpaused {
    pub unpaused_by: Pubkey,
}