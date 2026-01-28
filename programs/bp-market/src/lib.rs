use anchor_lang::prelude::*;

declare_id!("754huLjoBYmYqozy5hVd7hrxCvZAQByatXi6qLWEUVUS");

pub mod constant;
pub mod error;
pub mod errors;
pub mod events;
pub mod helper;
pub mod instructions;
pub mod states;
pub mod utils;

use instructions::*;

#[program]
pub mod bp_market {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>, 
        base_token: Pubkey,
        cojam_fee_account: Pubkey,
        charity_fee_account: Pubkey,
        remain_account: Pubkey,
    ) -> Result<()> {
        instructions::initialize(ctx, base_token, cojam_fee_account, charity_fee_account, remain_account)
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
        instructions::publish_market(
            ctx,
            market_key,
            creator,
            title,
            betting_token,
            create_fee,
            creator_fee_percentage,
            service_fee_percentage,
            charity_fee_percentage,
            answer_keys,
        )
    }

    pub fn update_owner(ctx: Context<UpdateOwner>, new_owner: Pubkey) -> Result<()> {
        instructions::update_owner(ctx, new_owner)
    }

    pub fn success_market(ctx: Context<SuccessMarket>, correct_answer_key: u64) -> Result<()> {
        instructions::success_market(ctx, correct_answer_key)
    }

    pub fn adjourn_market(ctx: Context<AdjournMarket>) -> Result<()> {
        instructions::adjourn_market(ctx)
    }

    pub fn finish_market(ctx: Context<FinishMarket>) -> Result<()> {
        instructions::finish_market(ctx)
    }

    pub fn bet(ctx: Context<Bet>, answer_key: u64, amount: u64) -> Result<()> {
        instructions::bet(ctx, answer_key, amount)
    }

    pub fn lock_user(ctx: Context<LockUser>, user_to_lock: Pubkey) -> Result<()> {
        instructions::lock_user(ctx, user_to_lock)
    }

    pub fn unlock_user(ctx: Context<UnlockUser>, user_to_unlock: Pubkey) -> Result<()> {
        instructions::unlock_user(ctx, user_to_unlock)
    }

    pub fn set_account(
        ctx: Context<SetAccount>,
        account_type: AccountType,
        new_account: Pubkey,
    ) -> Result<()> {
        instructions::set_account(ctx, account_type, new_account)
    }

    pub fn set_base_token(ctx: Context<SetBaseToken>, new_base_token: Pubkey) -> Result<()> {
        instructions::set_base_token(ctx, new_base_token)
    }

    pub fn receive_token(ctx: Context<ReceiveToken>) -> Result<()> {
        instructions::receive_token(ctx)
    }

    pub fn retrieve_tokens(ctx: Context<RetrieveTokens>) -> Result<()> {
        instructions::retrieve_tokens(ctx)
    }
}
