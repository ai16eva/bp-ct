use anchor_lang::prelude::*;
use anchor_spl::token::Token;
use anchor_spl::token_interface::{Mint, TokenAccount};

use crate::states::{ANSWER_SEED, CONFIG_SEED, AnswerAccount, ConfigAccount, MarketAccount, MarketStatus, MARKET_SEED};
use crate::{
    constant::BASIS_POINTS, error::ProgramErrorCode, helper::transfer_token_from_pool_to_user,
};

#[derive(Accounts)]
pub struct SuccessMarket<'info> {
    #[account(
        mut,
        constraint = (owner.key() == config_account.owner) @ ProgramErrorCode::Unauthorized
    )]
    pub owner: Signer<'info>,
    #[account(
        mut,
        seeds = [&CONFIG_SEED.as_bytes()],
        bump = config_account.bump,
    )]
    pub config_account: Account<'info, ConfigAccount>,
    /// Market account - moved before bet_mint so we can reference betting_token in constraint
    #[account(
      mut,
      constraint = market_account.status == MarketStatus::Finished @ ProgramErrorCode::MarketNotFinished,
    )]
    pub market_account: Account<'info, MarketAccount>,
    /// Token mint - now validates against market's betting_token instead of global base_token
    #[account(
        mut,
        constraint = market_account.betting_token == bet_mint.key() @ ProgramErrorCode::InvalidBetMint
    )]
    pub bet_mint: Box<InterfaceAccount<'info, Mint>>,
    #[account(
        mut,
        token::mint = bet_mint,
        token::authority = market_account.creator
    )]
    pub creator_token_account: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(
        mut,
        token::mint = bet_mint,
        token::authority = config_account.cojam_fee_account
    )]
    pub cojam_token_account: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(
        mut,
        token::mint = bet_mint,
        token::authority = config_account.charity_fee_account
    )]
    pub charity_token_account: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(mut)]
    pub vault_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        seeds = [ANSWER_SEED.as_bytes(), &market_account.market_key.to_le_bytes()],
        bump = answer_account.bump
    )]
    pub answer_account: Account<'info, AnswerAccount>,

    pub token_program: Program<'info, Token>,
}

#[event]
pub struct MarketSuccess {
    pub market_key: u64,
    pub answer_key: u64,
    pub creator_fee: u64,
    pub service_fee: u64,
    pub market_remain_tokens: u64,
}
struct MarketFees {
    creator_fee: u64,
    service_fee: u64,
    charity_fee: u64,
}

fn calculate_market_fees(market_account: &mut MarketAccount) -> Result<MarketFees> {
    let remain_tokens = market_account.market_remain_tokens as u128;

    let creator_fee_percentage = market_account.creator_fee_percentage as u128;
    let service_fee_percentage = market_account.service_fee_percentage as u128;
    let charity_fee_percentage = market_account.charity_fee_percentage as u128;

    let old_creator_fee = market_account.creator_fee as u128;

    let additional_creator_fee = remain_tokens
        .checked_mul(creator_fee_percentage)
        .and_then(|result| result.checked_div(BASIS_POINTS as u128))
        .ok_or(ProgramErrorCode::Overflow)?;

    let total_creator_fee = old_creator_fee
        .checked_add(additional_creator_fee)
        .ok_or(ProgramErrorCode::Overflow)?;

    let service_fee = remain_tokens
        .checked_mul(service_fee_percentage)
        .and_then(|result| result.checked_div(BASIS_POINTS as u128))
        .ok_or(ProgramErrorCode::Overflow)?;

    let charity_fee = remain_tokens
        .checked_mul(charity_fee_percentage)
        .and_then(|result| result.checked_div(BASIS_POINTS as u128))
        .ok_or(ProgramErrorCode::Overflow)?;

    let remaining_tokens = remain_tokens
        .checked_sub(additional_creator_fee)
        .and_then(|result| result.checked_sub(service_fee))
        .and_then(|result| result.checked_sub(charity_fee))
        .ok_or(ProgramErrorCode::Overflow)?;

    // Update market_reward_base_tokens
    market_account.market_reward_base_tokens = remaining_tokens as u64;
    
    // Update creator_fee to include the additional fee
    market_account.creator_fee = total_creator_fee as u64;

    // Update market_remain_tokens (subtract the fees that were taken out)
    market_account.market_remain_tokens = remaining_tokens as u64;

    Ok(MarketFees {
        creator_fee: total_creator_fee as u64,
        service_fee: service_fee as u64,
        charity_fee: charity_fee as u64,
    })
}

pub fn success_market(ctx: Context<SuccessMarket>, correct_answer_key: u64) -> Result<()> {
    let fees: MarketFees = {
        let market_account = &mut ctx.accounts.market_account;
        let answer_account = &ctx.accounts.answer_account;

        if !answer_account
            .answers
            .iter()
            .any(|answer| answer.answer_key == correct_answer_key)
        {
            return Err(ProgramErrorCode::MarketDoesNotContainAnswerKey.into());
        }

        let clock = Clock::get()?;

        market_account.status = MarketStatus::Success;
        market_account.correct_answer_key = correct_answer_key;
        market_account.success_time = clock.unix_timestamp as u64;

        calculate_market_fees(market_account)?
    };

    let seeds: &[&[u8]] = &[
        MARKET_SEED.as_bytes(),
        &ctx.accounts.market_account.market_key.to_le_bytes(),
        &[ctx.accounts.market_account.bump],
    ];

    transfer_token_from_pool_to_user(
        ctx.accounts.vault_token_account.to_account_info(),
        ctx.accounts.creator_token_account.to_account_info(),
        ctx.accounts.market_account.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        &[&seeds],
        fees.creator_fee,
    )?;

    transfer_token_from_pool_to_user(
        ctx.accounts.vault_token_account.to_account_info(),
        ctx.accounts.cojam_token_account.to_account_info(),
        ctx.accounts.market_account.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        &[&seeds],
        fees.service_fee,
    )?;

    transfer_token_from_pool_to_user(
        ctx.accounts.vault_token_account.to_account_info(),
        ctx.accounts.charity_token_account.to_account_info(),
        ctx.accounts.market_account.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        &[&seeds],
        fees.charity_fee,
    )?;

    emit!(MarketSuccess {
        market_key: ctx.accounts.market_account.market_key,
        answer_key: correct_answer_key,
        creator_fee: fees.creator_fee,
        service_fee: fees.service_fee,
        market_remain_tokens: ctx.accounts.market_account.market_remain_tokens,
    });

    Ok(())
}
