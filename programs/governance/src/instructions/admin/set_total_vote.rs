use anchor_lang::prelude::*;
use crate::states::*;
use crate::errors::GovernanceError;
use crate::constant::GOVERNANCE_CONFIG_SEED;

#[derive(Accounts)]
pub struct SetTotalVote<'info> {
    #[account(
        mut,
        seeds = [GOVERNANCE_CONFIG_SEED],
        bump = config.bump,
        constraint = config.authority == authority.key() @ GovernanceError::Unauthorized
    )]
    pub config: Account<'info, GovernanceConfig>,

    pub authority: Signer<'info>,
}

pub fn set_total_vote(ctx: Context<SetTotalVote>, min_or_max: String, total_vote: u64) -> Result<()> {
    let config = &mut ctx.accounts.config;

    // Validate the parameter
    require!(
        min_or_max == "min" || min_or_max == "max",
        GovernanceError::InvalidParameter
    );

    if min_or_max == "min" {
        // Validate minimum is reasonable
        require!(
            total_vote > 0,
            GovernanceError::InvalidParameter
        );

        // Ensure min is not greater than max
        require!(
            total_vote <= config.max_total_vote,
            GovernanceError::InvalidParameter
        );

        let old_min = config.min_total_vote;
        config.min_total_vote = total_vote;

        emit!(MinTotalVoteUpdated {
            old_min,
            new_min: total_vote,
            updated_by: ctx.accounts.authority.key(),
        });

        msg!(
            "Minimum total vote updated from {} to {}",
            old_min,
            total_vote
        );
    } else {
        // Validate maximum is reasonable
        require!(
            total_vote >= config.min_total_vote,
            GovernanceError::InvalidParameter
        );

        let old_max = config.max_total_vote;
        config.max_total_vote = total_vote;

        emit!(MaxTotalVoteUpdated {
            old_max,
            new_max: total_vote,
            updated_by: ctx.accounts.authority.key(),
        });

        msg!(
            "Maximum total vote updated from {} to {}",
            old_max,
            total_vote
        );
    }

    Ok(())
}

#[event]
pub struct MinTotalVoteUpdated {
    pub old_min: u64,
    pub new_min: u64,
    pub updated_by: Pubkey,
}

#[event]
pub struct MaxTotalVoteUpdated {
    pub old_max: u64,
    pub new_max: u64,
    pub updated_by: Pubkey,
}