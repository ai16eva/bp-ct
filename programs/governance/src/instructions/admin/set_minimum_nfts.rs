use anchor_lang::prelude::*;
use crate::states::*;
use crate::errors::GovernanceError;
use crate::constant::GOVERNANCE_CONFIG_SEED;

#[derive(Accounts)]
pub struct SetMinimumRequiredNfts<'info> {
    #[account(
        mut,
        seeds = [GOVERNANCE_CONFIG_SEED],
        bump = config.bump,
        constraint = config.authority == authority.key() @ GovernanceError::Unauthorized
    )]
    pub config: Account<'info, GovernanceConfig>,

    pub authority: Signer<'info>,
}

pub fn set_minimum_nfts(ctx: Context<SetMinimumRequiredNfts>, new_minimum: u8) -> Result<()> {
    let config = &mut ctx.accounts.config;

    // Validate the new minimum is reasonable
    require!(
        new_minimum > 0,
        GovernanceError::InvalidParameter
    );

    // Ensure new minimum is not greater than max votable
    require!(
        new_minimum <= config.max_votable_nft,
        GovernanceError::InvalidParameter
    );

    // Update the minimum required NFTs
    let old_minimum = config.min_required_nft;
    config.min_required_nft = new_minimum;

    emit!(MinimumNftsUpdated {
        old_minimum,
        new_minimum,
        updated_by: ctx.accounts.authority.key(),
    });

    msg!(
        "Minimum required NFTs updated from {} to {}",
        old_minimum,
        new_minimum
    );

    Ok(())
}

#[event]
pub struct MinimumNftsUpdated {
    pub old_minimum: u8,
    pub new_minimum: u8,
    pub updated_by: Pubkey,
}