use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::states::*;
use crate::errors::GovernanceError;
use crate::constant::{
    ANSWER_VOTE_SEED,
    GOVERNANCE_CONFIG_SEED,
    GOVERNANCE_ITEM_SEED,
    GOVERNANCE_SEED,
    TREASURY_SEED,
    TREASURY_TOKEN_ACCOUNT_SEED,
};

#[derive(Accounts)]
#[instruction(quest_key: u64)]
pub struct DistributeReward<'info> {
    #[account(
        seeds = [GOVERNANCE_CONFIG_SEED],
        bump = config.bump
    )]
    pub config: Account<'info, GovernanceConfig>,

    #[account(
        mut,
        seeds = [GOVERNANCE_SEED],
        bump = governance.bump
    )]
    pub governance: Account<'info, Governance>,

    #[account(
        seeds = [GOVERNANCE_ITEM_SEED, quest_key.to_le_bytes().as_ref()],
        bump = governance_item.bump
    )]
    pub governance_item: Account<'info, GovernanceItem>,

    #[account(
        seeds = [ANSWER_VOTE_SEED, quest_key.to_le_bytes().as_ref()],
        bump = answer_vote.bump
    )]
    pub answer_vote: Account<'info, AnswerVote>,

    #[account(
        mut,
        seeds = [
            b"answer_voter",
            quest_key.to_le_bytes().as_ref(),
            voter.key().as_ref()
        ],
        bump = voter_record.bump,
        constraint = voter_record.quest_key == quest_key @ GovernanceError::InvalidParameter,
        constraint = voter_record.voter == voter.key() @ GovernanceError::Unauthorized
    )]
    pub voter_record: Account<'info, AnswerVoterRecord>,

    /// The voter receiving the reward
    pub voter: Signer<'info>,

    /// Voter's token account to receive rewards
    #[account(
        mut,
        constraint = voter_token_account.owner == voter.key() @ GovernanceError::Unauthorized,
        constraint = voter_token_account.mint == config.base_token_mint @ GovernanceError::InvalidParameter
    )]
    pub voter_token_account: Account<'info, TokenAccount>,

    /// Treasury PDA - signer authority for reward distribution
    #[account(
        seeds = [TREASURY_SEED],
        bump = config.treasury_bump
    )]
    /// CHECK: PDA signer derived from program seeds
    pub treasury_pda: AccountInfo<'info>,

    /// Treasury token account holding the reward tokens
    #[account(
        mut,
        seeds = [TREASURY_SEED, TREASURY_TOKEN_ACCOUNT_SEED],
        bump,
        constraint = treasury_token_account.owner == treasury_pda.key() @ GovernanceError::InvalidParameter,
        constraint = treasury_token_account.mint == config.base_token_mint @ GovernanceError::InvalidParameter
    )]
    pub treasury_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn distribute_reward(ctx: Context<DistributeReward>, quest_key: u64) -> Result<()> {
    let config = &ctx.accounts.config;
    let governance = &mut ctx.accounts.governance;
    let governance_item = &ctx.accounts.governance_item;
    let answer_vote = &ctx.accounts.answer_vote;
    let voter_record = &mut ctx.accounts.voter_record;

    require!(
        governance_item.answer_result != 0,
        GovernanceError::AnswerResultEmpty
    );

    require!(
        answer_vote.finalized,
        GovernanceError::AnswerVoteNotFinalized
    );

    require!(
        voter_record.answer_key == governance_item.answer_result,
        GovernanceError::VoterDidNotVoteForWinningAnswer
    );

    let voter_votes = voter_record.vote_count as u64;
    require!(
        voter_votes > 0,
        GovernanceError::VoterHasNoVotes
    );

    require!(
        !voter_record.rewarded,
        GovernanceError::VoterAlreadyRewarded
    );

    let total_reward = voter_votes
        .checked_mul(config.constant_reward_token)
        .ok_or(GovernanceError::MathOverflow)?;

    require!(
        ctx.accounts.treasury_token_account.amount >= total_reward,
        GovernanceError::InsufficientTreasuryBalance
    );

    let cpi_accounts = Transfer {
        from: ctx.accounts.treasury_token_account.to_account_info(),
        to: ctx.accounts.voter_token_account.to_account_info(),
        authority: ctx.accounts.treasury_pda.to_account_info(),
    };

    let cpi_program = ctx.accounts.token_program.to_account_info();
    let treasury_bump = config.treasury_bump;
    let signer_seeds: [&[u8]; 2] = [TREASURY_SEED, &[treasury_bump]];
    let signer_seeds_refs: [&[&[u8]]; 1] = [&signer_seeds];
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, &signer_seeds_refs);

    token::transfer(cpi_ctx, total_reward)?;

    voter_record.rewarded = true;

    governance.total_rewards_distributed = governance
        .total_rewards_distributed
        .checked_add(total_reward)
        .ok_or(GovernanceError::MathOverflow)?;

    emit!(RewardDistributed {
        quest_key,
        voter: ctx.accounts.voter.key(),
        answer_key: voter_record.answer_key,
        vote_count: voter_votes,
        reward_amount: total_reward,
    });

    Ok(())
}

#[event]
pub struct RewardDistributed {
    pub quest_key: u64,
    pub voter: Pubkey,
    pub answer_key: u64,
    pub vote_count: u64,
    pub reward_amount: u64,
}
