use std::ops::DerefMut;

use anchor_lang::prelude::*;
use anchor_spl::{associated_token::AssociatedToken, token::Token};

use anchor_spl::token_interface::{Mint, TokenAccount};

use crate::states::{ANSWER_SEED, CONFIG_SEED, AnswerAccount, BettingAccount, ConfigAccount, MarketAccount, MarketStatus, BETTING_SEED};
use crate::{
    error::ProgramErrorCode, helper::transfer_token_or_point_to_pool,
};

#[derive(Accounts)]
#[instruction(answer_key: u64)]
pub struct Bet<'info> {
    #[account(mut)]
    pub voter: Signer<'info>,
    #[account(
        mut,
        seeds = [&CONFIG_SEED.as_bytes()],
        bump = config_account.bump
    )]
    pub config_account: Account<'info, ConfigAccount>,
    /// Market account - moved before bet_mint so we can reference betting_token in constraint
    #[account(
      mut,
      constraint = market_account.status == MarketStatus::Approve @ ProgramErrorCode::MarketNotApproved
    )]
    pub market_account: Box<Account<'info, MarketAccount>>,
    /// Token mint - now validates against market's betting_token instead of global base_token
    #[account(
        mut,
        constraint = market_account.betting_token == bet_mint.key() @ ProgramErrorCode::InvalidBetMint
    )]
    pub bet_mint: Box<InterfaceAccount<'info, Mint>>,
    #[account(mut)]
    pub user_token_account: InterfaceAccount<'info, TokenAccount>,
    #[account(
        init_if_needed,
        payer = voter,
        associated_token::mint = bet_mint,
        associated_token::authority = market_account
    )]
    pub vault_token_account: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(
        mut,
        seeds = [ANSWER_SEED.as_bytes(), &market_account.market_key.to_le_bytes()],
        bump = answer_account.bump
    )]
    pub answer_account: Box<Account<'info, AnswerAccount>>,
    #[account(
      init_if_needed,
      payer = voter,
      space = MarketAccount::INIT_SPACE,
      seeds = [BETTING_SEED.as_bytes(), voter.key().as_ref(), &market_account.market_key.to_le_bytes(), &answer_key.to_le_bytes()],
      bump,
    )]
    pub bet_account: Box<Account<'info, BettingAccount>>,

    pub token_program: Program<'info, Token>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    pub system_program: Program<'info, System>,
}

#[event]
pub struct BetPlaced {
    pub voter: Pubkey,
    pub market_key: Pubkey,
    pub answer_key: u64,
}

pub fn bet(ctx: Context<Bet>, answer_key: u64, amount: u64) -> Result<()> {
    let market_key = ctx.accounts.market_account.market_key.clone();
    let betting_account = ctx.accounts.bet_account.deref_mut();
    let market_account = ctx.accounts.market_account.deref_mut();
    let answer_account = ctx.accounts.answer_account.deref_mut();
    let config_account = &ctx.accounts.config_account;

    // Validate bet amount is greater than zero
    require!(amount > 0, ProgramErrorCode::InvalidBetAmount);

    // Check if user is locked
    require!(
        !config_account.locked_users.contains(&ctx.accounts.voter.key()),
        ProgramErrorCode::UserAlreadyLocked
    );

    //send token to the pool
    transfer_token_or_point_to_pool(
        ctx.accounts.user_token_account.to_account_info(),
        ctx.accounts.vault_token_account.to_account_info(),
        ctx.accounts.voter.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        amount,
    )?;

    if !answer_account
        .answers
        .iter()
        .any(|answer| answer.answer_key == answer_key)
    {
        return Err(ProgramErrorCode::AnswerNotExists.into());
    }

    // Update the specific answer's total tokens
    for answer in answer_account.answers.iter_mut() {
        if answer.answer_key == answer_key {
            answer.answer_total_tokens += amount;
            break;
        }
    }

    let clock = Clock::get()?;

    betting_account.bump = ctx.bumps.bet_account;
    betting_account.market_key = market_key;
    betting_account.answer_key = answer_key;
    betting_account.voter = ctx.accounts.voter.key();
    betting_account.tokens += amount;
    betting_account.create_time = clock.unix_timestamp as u64;
    betting_account.exist = true;

    market_account.market_total_tokens += amount;
    market_account.market_remain_tokens += amount;

    emit!(BetPlaced {
        voter: ctx.accounts.voter.key(),
        market_key: ctx.accounts.market_account.key(),
        answer_key,
    });

    Ok(())
}
