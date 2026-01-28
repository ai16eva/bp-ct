use crate::constant::{GOVERNANCE_CONFIG_SEED, TREASURY_SEED};
use crate::errors::GovernanceError;
use crate::states::*;
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

#[derive(Accounts)]
pub struct UpdateBaseTokenMint<'info> {
    #[account(
        mut,
        seeds = [GOVERNANCE_CONFIG_SEED],
        bump = config.bump,
        has_one = authority @ GovernanceError::Unauthorized
    )]
    pub config: Account<'info, GovernanceConfig>,

    #[account(mut)]
    pub authority: Signer<'info>,

    /// New base token mint
    pub new_base_token_mint: Account<'info, Mint>,

    /// CHECK: PDA derived from TREASURY_SEED
    #[account(
        seeds = [TREASURY_SEED],
        bump = config.treasury_bump
    )]
    pub treasury_pda: AccountInfo<'info>,

    /// New treasury token account for the new mint
    /// This creates a separate token account for each token mint
    #[account(
        init,
        payer = authority,
        token::mint = new_base_token_mint,
        token::authority = treasury_pda,
        seeds = [TREASURY_SEED, b"token_account", new_base_token_mint.key().as_ref()],
        bump
    )]
    pub new_treasury_token_account: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn update_base_token_mint(ctx: Context<UpdateBaseTokenMint>) -> Result<()> {
    let config = &mut ctx.accounts.config;
    
    msg!(
        "Updating base_token_mint from {} to {}", 
        config.base_token_mint, 
        ctx.accounts.new_base_token_mint.key()
    );
    
    // Update the base token mint
    config.base_token_mint = ctx.accounts.new_base_token_mint.key();
    
    msg!("Base token mint updated successfully");
    msg!("New treasury token account: {}", ctx.accounts.new_treasury_token_account.key());
    
    Ok(())
}
