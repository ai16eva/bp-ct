use crate::constant::{ACCOUNT_DISCRIMINATOR, GOVERNANCE_CONFIG_SEED, GOVERNANCE_SEED, TREASURY_SEED};
use crate::states::*;
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = ACCOUNT_DISCRIMINATOR +  GovernanceConfig::INIT_SPACE,
        seeds = [GOVERNANCE_CONFIG_SEED],
        bump
    )]
    pub config: Account<'info, GovernanceConfig>,

    #[account(
        init,
        payer = authority,
        space = ACCOUNT_DISCRIMINATOR + Governance::INIT_SPACE,
        seeds = [GOVERNANCE_SEED],
        bump
    )]
    pub governance: Account<'info, Governance>,

    #[account(mut)]
    pub authority: Signer<'info>,


    /// CHECK: NFT collection
    pub base_nft_collection: AccountInfo<'info>,

    /// CHECK: PDA derived from TREASURY_SEED
    #[account(
        seeds = [TREASURY_SEED],
        bump
    )]
    pub treasury_pda: AccountInfo<'info>,

    /// Treasury token account - holds reward tokens
    #[account(
        init,
        payer = authority,
        token::mint = base_token_mint,
        token::authority = treasury_pda,
        seeds = [TREASURY_SEED, b"token_account"],
        bump
    )]
    pub treasury_token_account: Account<'info, TokenAccount>,

    pub base_token_mint: Account<'info, Mint>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn initialize(
    ctx: Context<Initialize>,
    min_total_vote: u64,
    max_total_vote: u64,
    min_required_nft: u8,
    max_votable_nft: u8,
    duration_hours: u64,
    constant_reward_token: u64,
) -> Result<()> {
    let config = &mut ctx.accounts.config;
    let governance = &mut ctx.accounts.governance;

    config.authority = ctx.accounts.authority.key();
    config.base_token_mint = ctx.accounts.base_token_mint.key();
    config.base_nft_collection = ctx.accounts.base_nft_collection.key();
    config.treasury_bump = ctx.bumps.treasury_pda;
    config.paused = false;
    config.min_total_vote = min_total_vote;
    config.max_total_vote = max_total_vote;
    config.min_required_nft = min_required_nft;
    config.max_votable_nft = max_votable_nft;
    config.duration_hours = duration_hours;
    config.constant_reward_token = constant_reward_token;
    config.total_governance = 0;
    config.bump = ctx.bumps.config;

    governance.config = config.key();
    governance.total_items = 0;
    governance.active_items = 0;
    governance.completed_items = 0;
    governance.total_rewards_distributed = 0;
    governance.bump = ctx.bumps.governance;

    Ok(())
}
