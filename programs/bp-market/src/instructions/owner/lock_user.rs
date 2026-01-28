use anchor_lang::prelude::*;

use crate::{
    error::ProgramErrorCode, 
    states::{ConfigAccount, CONFIG_SEED, MAX_LOCKED_USERS}
};

#[derive(Accounts)]
pub struct LockUser<'info> {
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

pub fn lock_user(ctx: Context<LockUser>, user_to_lock: Pubkey) -> Result<()> {
    let config_account = &mut ctx.accounts.config_account;
    
    require!(
        !config_account.locked_users.contains(&user_to_lock),
        ProgramErrorCode::UserAlreadyLocked
    );
    
    require!(
        config_account.locked_users.len() < MAX_LOCKED_USERS,
        ProgramErrorCode::MaxLockedUsersReached
    );
    
    config_account.locked_users.push(user_to_lock);
    
    msg!("User locked: {:?}", user_to_lock);
    
    Ok(())
}