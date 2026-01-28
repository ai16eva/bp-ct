use anchor_lang::prelude::*;
use crate::error::ProgramErrorCode;

pub fn calculate_fee(amount: u64, fee_bps: u16) -> Result<u64> {
    let result = (amount as u128)
        .checked_mul(fee_bps as u128)
        .and_then(|val| val.checked_div(10000))
        .ok_or(ProgramErrorCode::Overflow)?;

    Ok(result as u64)
}