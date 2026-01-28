use anchor_lang::prelude::*;

#[event]
pub struct ExchangePaused {
    pub paused_by: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct ExchangeUnpaused {
    pub unpaused_by: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct TokenPaused {
    pub paused_by: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct TokenUnpaused {
    pub unpaused_by: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct OwnershipTransferred {
    pub previous_owner: Pubkey,
    pub new_owner: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct FeeUpdated {
    pub old_fee_bps: u16,
    pub new_fee_bps: u16,
    pub updated_by: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct FeesWithdrawn {
    pub recipient: Pubkey,
    pub usdt_amount: u64,
    pub usdp_amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct UsdpBought {
    pub buyer: Pubkey,
    pub usdt_amount: u64,
    pub usdp_amount: u64,
    pub fee_amount: u64,
    pub timestamp: i64,
}

#[event]
pub struct UsdpSold {
    pub seller: Pubkey,
    pub usdp_amount: u64,
    pub usdt_amount: u64,
    pub fee_amount: u64,
    pub timestamp: i64,
}