use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::states::*;
use crate::errors::GovernanceError;
use crate::constant::{GOVERNANCE_CONFIG_SEED, TREASURY_SEED};

#[derive(Accounts)]
pub struct WithdrawTokens<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        seeds = [GOVERNANCE_CONFIG_SEED],
        bump = config.bump,
        constraint = config.authority == authority.key() @ GovernanceError::Unauthorized
    )]
    pub config: Account<'info, GovernanceConfig>,

    /// CHECK: PDA derived from TREASURY_SEED
    #[account(
        seeds = [TREASURY_SEED],
        bump = config.treasury_bump
    )]
    pub treasury_pda: AccountInfo<'info>,

    /// Treasury token account holding the tokens
    #[account(
        mut,
        constraint = treasury_token_account.owner == treasury_pda.key() @ GovernanceError::InvalidParameter,
        constraint = treasury_token_account.mint == config.base_token_mint @ GovernanceError::InvalidParameter
    )]
    pub treasury_token_account: Account<'info, TokenAccount>,

    /// Destination token account to receive withdrawn tokens
    #[account(
        mut,
        constraint = destination_token_account.mint == config.base_token_mint @ GovernanceError::InvalidParameter
    )]
    pub destination_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn withdraw_tokens(ctx: Context<WithdrawTokens>, amount: u64) -> Result<()> {
    // Validate amount
    require!(
        amount > 0,
        GovernanceError::InvalidWithdrawAmount
    );

    // Verify treasury has sufficient balance
    require!(
        ctx.accounts.treasury_token_account.amount >= amount,
        GovernanceError::InsufficientTreasuryBalance
    );

    let treasury_seeds = &[
        TREASURY_SEED,
        &[ctx.accounts.config.treasury_bump]
    ];
    let signer_seeds = &[&treasury_seeds[..]];

    // Transfer tokens from treasury to destination
    let cpi_accounts = Transfer {
        from: ctx.accounts.treasury_token_account.to_account_info(),
        to: ctx.accounts.destination_token_account.to_account_info(),
        authority: ctx.accounts.treasury_pda.to_account_info(),
    };

    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);

    token::transfer(cpi_ctx, amount)?;

    msg!(
        "Withdrawn {} tokens from treasury to {}",
        amount,
        ctx.accounts.destination_token_account.key()
    );

    Ok(())
}