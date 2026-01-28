use std::ops::DerefMut;

use anchor_lang::prelude::*;

use crate::{
    error::ProgramErrorCode, 
    states::{ConfigAccount, CONFIG_SEED}
};

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum AccountType {
    CojamFee,
    CharityFee,
    Remain,
}

#[derive(Accounts)]
pub struct SetAccount<'info> {
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
pub struct AccountUpdated {
    pub account_type: AccountType,
    pub old_account: Pubkey,
    pub new_account: Pubkey,
}

pub fn set_account(
    ctx: Context<SetAccount>, 
    account_type: AccountType,
    new_account: Pubkey
) -> Result<()> {
    let config_account = ctx.accounts.config_account.deref_mut();
    
    let old_account = match account_type {
        AccountType::CojamFee => {
            let old = config_account.cojam_fee_account;
            config_account.cojam_fee_account = new_account;
            old
        },
        AccountType::CharityFee => {
            let old = config_account.charity_fee_account;
            config_account.charity_fee_account = new_account;
            old
        },
        AccountType::Remain => {
            let old = config_account.remain_account;
            config_account.remain_account = new_account;
            old
        },
    };
    
    emit!(AccountUpdated {
        account_type,
        old_account,
        new_account,
    });
        
    Ok(())
}