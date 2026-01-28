use anchor_lang::prelude::*;
use crate::states::*;
use crate::errors::GovernanceError;
use crate::constant::GOVERNANCE_CONFIG_SEED;

#[derive(Accounts)]
pub struct SetRewardAmount<'info> {
    #[account(
        mut,
        seeds = [GOVERNANCE_CONFIG_SEED],
        bump = config.bump,
        constraint = config.authority == authority.key() @ GovernanceError::Unauthorized
    )]
    pub config: Account<'info, GovernanceConfig>,

    pub authority: Signer<'info>,
}

pub fn set_reward_amount(ctx: Context<SetRewardAmount>, reward_amount: u64) -> Result<()> {
    let config = &mut ctx.accounts.config;

    // Validate the reward amount is reasonable
    require!(
        reward_amount > 0,
        GovernanceError::InvalidParameter
    );

    // Update the reward amount
    let old_reward = config.constant_reward_token;
    config.constant_reward_token = reward_amount;

    emit!(RewardAmountUpdated {
        old_amount: old_reward,
        new_amount: reward_amount,
        updated_by: ctx.accounts.authority.key(),
    });

    msg!(
        "Reward amount updated from {} to {}",
        old_reward,
        reward_amount
    );

    Ok(())
}

#[event]
pub struct RewardAmountUpdated {
    pub old_amount: u64,
    pub new_amount: u64,
    pub updated_by: Pubkey,
}