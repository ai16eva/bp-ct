use anchor_lang::prelude::*;
use crate::states::*;
use crate::errors::GovernanceError;
use crate::constant::GOVERNANCE_CONFIG_SEED;

#[derive(Accounts)]
pub struct SetMaxVotesPerVoter<'info> {
    #[account(
        mut,
        seeds = [GOVERNANCE_CONFIG_SEED],
        bump = config.bump,
        constraint = config.authority == authority.key() @ GovernanceError::Unauthorized
    )]
    pub config: Account<'info, GovernanceConfig>,

    pub authority: Signer<'info>,
}

pub fn set_max_votes(ctx: Context<SetMaxVotesPerVoter>, max_votes: u8) -> Result<()> {
    let config = &mut ctx.accounts.config;

    // Validate the new maximum is reasonable
    require!(
        max_votes > 0,
        GovernanceError::InvalidMaxVotes
    );

    // Ensure max is not less than minimum required
    require!(
        max_votes >= config.min_required_nft,
        GovernanceError::InvalidParameter
    );

    // Update the maximum votable NFTs
    let old_max = config.max_votable_nft;
    config.max_votable_nft = max_votes;

    emit!(MaxVotesUpdated {
        old_max,
        new_max: max_votes,
        updated_by: ctx.accounts.authority.key(),
    });

    msg!(
        "Maximum votes per voter updated from {} to {}",
        old_max,
        max_votes
    );

    Ok(())
}

#[event]
pub struct MaxVotesUpdated {
    pub old_max: u8,
    pub new_max: u8,
    pub updated_by: Pubkey,
}