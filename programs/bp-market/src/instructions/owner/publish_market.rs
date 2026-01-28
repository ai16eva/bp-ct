use std::ops::DerefMut;

use anchor_lang::prelude::*;

use crate::{
    error::ProgramErrorCode, states::{CONFIG_SEED, Answer, AnswerAccount, ConfigAccount, MarketAccount, MarketStatus, ANSWER_SEED, MARKET_SEED, MAX_ANWSER}
};

#[derive(Accounts)]
#[instruction(market_key: u64)]
pub struct PublishMarket<'info> {
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
    #[account(
        init,
        payer = owner,
        space = MarketAccount::INIT_SPACE,
        seeds = [MARKET_SEED.as_bytes(), &market_key.to_le_bytes()],
        bump,
    )]
    pub market_account: Account<'info, MarketAccount>,
    #[account(        
      init,
      payer = owner,
      space = MarketAccount::INIT_SPACE,
      seeds = [ANSWER_SEED.as_bytes(), &market_key.to_le_bytes()],
      bump
    )
    ]
    pub answer_account: Account<'info, AnswerAccount>,
    pub system_program: Program<'info, System>,
}

#[event]
pub struct MarketPublished {
    pub creator: Pubkey,
    pub market_key: u64,
    pub betting_token: Pubkey,  // Token mint for this market
    pub title: String,
    pub create_fee: u64,
    pub creator_fee_percentage: u64,
    pub service_fee_percentage: u64,
    pub charity_fee_percentage: u64,
    pub answer_keys: Vec<u64>,
}

pub fn publish_market(
    ctx: Context<PublishMarket>,
    market_key: u64,
    creator: Pubkey,
    title: String,
    betting_token: Pubkey,  // Token mint for this market's bets
    create_fee: u64,
    creator_fee_percentage: u64,
    service_fee_percentage: u64,
    charity_fee_percentage: u64,
    answer_keys: Vec<u64>,
) -> Result<()> {
    // Validate answer keys
    if answer_keys.is_empty() {
        return Err(ProgramErrorCode::NoAnswersProvided.into());
    }
    
    if answer_keys.len() > MAX_ANWSER {
        return Err(ProgramErrorCode::MaxAnswersReached.into());
    }
    
    // Check for duplicate answer keys
    let mut unique_keys = answer_keys.clone();
    unique_keys.sort();
    unique_keys.dedup();
    if unique_keys.len() != answer_keys.len() {
        return Err(ProgramErrorCode::AnswerAlreadyExists.into());
    }

    let market_account = ctx.accounts.market_account.deref_mut();
    let answer_account = ctx.accounts.answer_account.deref_mut();
    
    // Draft market
    market_account.bump = ctx.bumps.market_account;
    market_account.creator = creator;
    market_account.market_key = market_key;
    market_account.betting_token = betting_token;  // Save betting token for this market
    market_account.title = title.clone();
    market_account.creator_fee = create_fee;
    market_account.creator_fee_percentage = creator_fee_percentage;
    market_account.service_fee_percentage = service_fee_percentage;
    market_account.charity_fee_percentage = charity_fee_percentage;

    //approve market
    let clock = Clock::get()?;

    market_account.status = MarketStatus::Approve;
    market_account.approve_time = clock.unix_timestamp as u64;

    // Add answer keys
    answer_account.bump = ctx.bumps.answer_account;
    answer_account.answers = Vec::with_capacity(MAX_ANWSER);
    answer_account.exist = true;
    
    for answer_key in &answer_keys {
        answer_account.answers.push(Answer {
            answer_key: *answer_key,
            answer_total_tokens: 0,
        });
    }

    emit!(MarketPublished {
        creator,
        market_key,
        betting_token,
        title,
        create_fee,
        creator_fee_percentage,
        service_fee_percentage,
        charity_fee_percentage,
        answer_keys,
    });

    Ok(())
}