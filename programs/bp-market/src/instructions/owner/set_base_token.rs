use std::ops::DerefMut;

use anchor_lang::prelude::*;

use crate::{
    error::ProgramErrorCode,
    states::{ConfigAccount, CONFIG_SEED},
};

#[derive(Accounts)]
pub struct SetBaseToken<'info> {
    #[account(
        mut,
        constraint = (owner.key() == config_account.owner) @ ProgramErrorCode::Unauthorized
    )]
    pub owner: Signer<'info>,
    #[account(
        mut,
        seeds = [CONFIG_SEED.as_bytes()],
        bump = config_account.bump,
    )]
    pub config_account: Account<'info, ConfigAccount>,
    pub system_program: Program<'info, System>,
}

#[event]
pub struct BaseTokenUpdated {
    pub old_token: Pubkey,
    pub new_token: Pubkey,
    pub updated_by: Pubkey,
    pub timestamp: i64,
}

pub fn set_base_token(ctx: Context<SetBaseToken>, new_base_token: Pubkey) -> Result<()> {
    let config_account = ctx.accounts.config_account.deref_mut();
    let old_token = config_account.base_token;

    config_account.base_token = new_base_token;

    let clock = Clock::get()?;

    emit!(BaseTokenUpdated {
        old_token,
        new_token: new_base_token,
        updated_by: ctx.accounts.owner.key(),
        timestamp: clock.unix_timestamp,
    });

    Ok(())
}
