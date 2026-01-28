use anchor_lang::prelude::*;
use anchor_spl::token;

use crate::{
    constant::{
        ADJOURN_MARKET_VALIDITY_DATE, SUCCESS_MARKET_VALIDITY_DATE,
    },
    error::ProgramErrorCode,
    states::{MarketAccount, MarketStatus},
};

pub fn transfer_token_or_point_to_pool<'info>(
    from_pool: AccountInfo<'info>,
    to: AccountInfo<'info>,
    authority: AccountInfo<'info>,
    token_program: AccountInfo<'info>,
    amount: u64,
) -> Result<()> {
    let token_program_info = token_program.to_account_info();
    let from_pool_info: AccountInfo = from_pool.to_account_info();

    token::transfer(
        CpiContext::new(
            token_program_info,
            token::Transfer {
                from: from_pool_info,
                to: to.to_account_info(),
                authority: authority.to_account_info(),
            },
        ),
        amount,
    )
}

pub fn transfer_token_from_pool_to_user<'info>(
    from_pool: AccountInfo<'info>,
    to: AccountInfo<'info>,
    authority: AccountInfo<'info>,
    token_program: AccountInfo<'info>,
    signer_seeds: &[&[&[u8]]],
    amount: u64,
) -> Result<()> {
    let token_program_info = token_program.to_account_info();
    let from_pool_info: AccountInfo = from_pool.to_account_info();

    token::transfer(
        CpiContext::new_with_signer(
            token_program_info,
            token::Transfer {
                from: from_pool_info,
                to: to.to_account_info(),
                authority: authority.to_account_info(),
            },
            signer_seeds,
        ),
        amount,
    )
}

pub fn is_retrieve_available(market_account: &MarketAccount, clock: &Clock) -> Result<bool> {
    require!(
        market_account.status == MarketStatus::Success
            || market_account.status == MarketStatus::Adjourn,
        ProgramErrorCode::CannotRetrieveToken
    );

    let diff = if market_account.status == MarketStatus::Success {
        clock.unix_timestamp as u64 - market_account.success_time
    } else {
        clock.unix_timestamp as u64 - market_account.adjourn_time
    };

    let is_available = if market_account.status == MarketStatus::Success {
        diff > SUCCESS_MARKET_VALIDITY_DATE
    } else {
        diff > ADJOURN_MARKET_VALIDITY_DATE
    };

    Ok(is_available)
}
