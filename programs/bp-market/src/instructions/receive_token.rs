use std::ops::DerefMut;

use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount};
use anchor_spl::{associated_token::AssociatedToken, token::Token};

use crate::states::BETTING_SEED;
use crate::{
    constant::MAX_PERCENTAGE_BASIS_POINTS,
    error::ProgramErrorCode,
    helper::transfer_token_from_pool_to_user,
    states::{
        AnswerAccount, BettingAccount, ConfigAccount, MarketAccount, MarketStatus, CONFIG_SEED,
        MARKET_SEED,
    },
};

#[derive(Accounts)]
pub struct ReceiveToken<'info> {
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
      constraint = market_account.status == MarketStatus::Success || market_account.status == MarketStatus::Adjourn @ ProgramErrorCode::CannotClaimToken,
    )]
    pub market_account: Box<Account<'info, MarketAccount>>,
    /// Token mint - now validates against market's betting_token instead of global base_token
    #[account(
        mut,
        constraint = market_account.betting_token == bet_mint.key() @ ProgramErrorCode::InvalidBetMint
    )]
    pub bet_mint: Box<InterfaceAccount<'info, Mint>>,
    #[account(mut)]
    pub user_bet_token_account: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(
        mut,
        token::mint = bet_mint,
        token::authority = market_account
    )]
    pub vault_bet_token_account: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(
        mut,
        seeds = [BETTING_SEED.as_bytes(), voter.key().as_ref(), &market_account.market_key.to_le_bytes(), &bet_account.answer_key.to_le_bytes()],
        bump,
        close = voter
    )]
    pub bet_account: Box<Account<'info, BettingAccount>>,
    #[account(mut)]
    pub answer_account: Box<Account<'info, AnswerAccount>>,

    pub token_program: Program<'info, Token>,

    pub associated_token_program: Program<'info, AssociatedToken>,

    pub system_program: Program<'info, System>,
}

#[event]
pub struct TokenReceived {
    pub receiver: Pubkey,
    pub market_key: u64,
    pub betting_key: u64,
    pub received_tokens: u64,
}

pub fn receive_token(ctx: Context<ReceiveToken>) -> Result<()> {
    let market_account = ctx.accounts.market_account.deref_mut();
    let betting_account = &mut ctx.accounts.bet_account;
    let answer_account = &ctx.accounts.answer_account;

    let correct_answer_key = market_account.correct_answer_key;
    let betting_tokens = betting_account.tokens as u128;
    let answer_key = betting_account.answer_key;

    let mut percentage = 0;

    if market_account.status == MarketStatus::Success
        && betting_account.answer_key == correct_answer_key
    {
        let mut correct_answer_total_tokens: u128 = 0;
        for answer in &answer_account.answers {
            if answer.answer_key == correct_answer_key {
                correct_answer_total_tokens = answer.answer_total_tokens as u128;
                break;
            }
        }

        let market_reward_base_tokens = market_account.market_reward_base_tokens as u128;
        percentage = market_reward_base_tokens
            .checked_mul(MAX_PERCENTAGE_BASIS_POINTS)
            .and_then(|result| result.checked_div(correct_answer_total_tokens))
            .ok_or(ProgramErrorCode::MathOperationError)?;
    } else if market_account.status == MarketStatus::Adjourn {
        percentage = MAX_PERCENTAGE_BASIS_POINTS;
        let answer_exists = answer_account
            .answers
            .iter()
            .any(|answer| answer.answer_key == answer_key);

        if !answer_exists {
            return Err(ProgramErrorCode::InvalidAnswerKey.into());
        }
    }

    let receive_tokens = betting_tokens
        .checked_mul(percentage)
        .and_then(|result| result.checked_div(MAX_PERCENTAGE_BASIS_POINTS))
        .ok_or(ProgramErrorCode::MathOperationError)?;

    //dividend token to user
    market_account.market_remain_tokens =
        market_account.market_remain_tokens - receive_tokens as u64;

    if receive_tokens > 0 {
        let bet_seeds: &[&[u8]] = &[
            MARKET_SEED.as_bytes(),
            &ctx.accounts.market_account.market_key.to_le_bytes(),
            &[ctx.accounts.market_account.bump],
        ];
        transfer_token_from_pool_to_user(
            ctx.accounts.vault_bet_token_account.to_account_info(),
            ctx.accounts.user_bet_token_account.to_account_info(),
            ctx.accounts.market_account.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
            &[&bet_seeds],
            receive_tokens as u64,
        )?;
        

        emit!(TokenReceived {
            receiver: ctx.accounts.voter.key(),
            market_key: ctx.accounts.market_account.market_key,
            betting_key: betting_account.answer_key,
            received_tokens: receive_tokens as u64,
        });
    }

    Ok(())
}
