use anchor_lang::prelude::*;

use crate::{
    error::ProgramErrorCode, 
    states::{ConfigAccount, CONFIG_SEED}
};

#[derive(Accounts)]
pub struct UnlockUser<'info> {
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

pub fn unlock_user(ctx: Context<UnlockUser>, user_to_unlock: Pubkey) -> Result<()> {
    let config_account = &mut ctx.accounts.config_account;
    
    let user_index = config_account.locked_users
        .iter()
        .position(|&user| user == user_to_unlock)
        .ok_or(ProgramErrorCode::UserNotLocked)?;
    
    config_account.locked_users.remove(user_index);
    
    msg!("User unlocked: {:?}", user_to_unlock);
    
    Ok(())
}