use std::ops::DerefMut;

use anchor_lang::prelude::*;

use crate::{
    states::{ConfigAccount, CONFIG_SEED},
};

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(
        init,
        payer = owner,
        space = ConfigAccount::INIT_SPACE,
        seeds = [&CONFIG_SEED.as_bytes()],
        bump
    )]
    pub config_account: Account<'info, ConfigAccount>,

    pub system_program: Program<'info, System>,
}

pub fn initialize(
    ctx: Context<Initialize>, 
    base_token: Pubkey,
    cojam_fee_account: Pubkey,
    charity_fee_account: Pubkey,
    remain_account: Pubkey,
) -> Result<()> {
    let config_account = ctx.accounts.config_account.deref_mut();

    config_account.bump = ctx.bumps.config_account;
    config_account.owner = ctx.accounts.owner.key();
    config_account.base_token = base_token;
    config_account.cojam_fee_account = cojam_fee_account;
    config_account.charity_fee_account = charity_fee_account;
    config_account.remain_account = remain_account;
    config_account.locked_users = Vec::new();

    Ok(())
}
