use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Unauthorized access")]
    UnauthorizedAccess,
    #[msg("Program is paused")]
    ProgramPaused,
    #[msg("Invalid fee")]
    InvalidFee,
    #[msg("Fee too high")]
    FeeToHigh,
    #[msg("Insufficient reserve")]
    InsufficientReserve,
    #[msg("Account is frozen")]
    AccountFrozen,
    #[msg("Transfer not allowed")]
    TransferNotAllowed,
    #[msg("Overflow error")]
    Overflow,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Exchange is paused")]
    ExchangePaused,
    #[msg("Too many admins")]
    TooManyAdmins,
    #[msg("Cannot remove owner")]
    CannotRemoveOwner,
    #[msg("Insufficient balance")]
    InsufficientBalance,
}