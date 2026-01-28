use anchor_lang::prelude::*;
use crate::errors::GovernanceError;
use crate::states::*;
use crate::constant::{ACCOUNT_DISCRIMINATOR, GOVERNANCE_SEED, GOVERNANCE_CONFIG_SEED, GOVERNANCE_ITEM_SEED, ANSWER_VOTE_SEED};

#[derive(Accounts)]
#[instruction(quest_key: u64, answer_key: u64)]
pub struct VoteAnswer<'info> {
    #[account(
        seeds = [GOVERNANCE_SEED],
        bump = governance.bump
    )]
    pub governance: Account<'info, Governance>,

    #[account(
        seeds = [GOVERNANCE_CONFIG_SEED],
        bump = config.bump
    )]
    pub config: Account<'info, GovernanceConfig>,

    #[account(mut)]
    pub voter: Signer<'info>,

    #[account(
        mut,
        seeds = [GOVERNANCE_ITEM_SEED, quest_key.to_le_bytes().as_ref()],
        bump = governance_item.bump
    )]
    pub governance_item: Account<'info, GovernanceItem>,

    #[account(
        init_if_needed,
        payer = voter,
        space = ACCOUNT_DISCRIMINATOR + AnswerVote::INIT_SPACE,
        seeds = [ANSWER_VOTE_SEED, quest_key.to_le_bytes().as_ref()],
        bump
    )]
    pub answer_vote: Account<'info, AnswerVote>,

    #[account(
        init_if_needed,
        payer = voter,
        space = ACCOUNT_DISCRIMINATOR + AnswerOption::INIT_SPACE,
        seeds = [b"answer_option", quest_key.to_le_bytes().as_ref(), answer_key.to_le_bytes().as_ref()],
        bump
    )]
    pub answer_option: Account<'info, AnswerOption>,

    #[account(
        init_if_needed,
        payer = voter,
        space = ACCOUNT_DISCRIMINATOR + AnswerVoterRecord::INIT_SPACE,
        seeds = [b"answer_voter", quest_key.to_le_bytes().as_ref(), voter.key().as_ref()],
        bump
    )]
    pub answer_voter_record: Account<'info, AnswerVoterRecord>,

    /// Voter's checkpoint history - stores voting power at different slots
    /// Similar to OpenZeppelin's Votes.sol checkpoint system
    #[account(
        seeds = [b"voter_checkpoints", voter.key().as_ref()],
        bump = voter_checkpoints.bump
    )]
    pub voter_checkpoints: Account<'info, VoterCheckpoints>,

    pub system_program: Program<'info, System>,
}

pub fn vote_answer(ctx: Context<VoteAnswer>, quest_key: u64, answer_key: u64) -> Result<()> {
    let governance_item = &ctx.accounts.governance_item;
    let answer_vote = &mut ctx.accounts.answer_vote;
    let answer_option = &mut ctx.accounts.answer_option;
    let answer_voter_record = &mut ctx.accounts.answer_voter_record;
    let clock = Clock::get()?;

    require!(
        governance_item.answer_keys.len() > 0,
        GovernanceError::AnswerVotingNotStarted
    );
    
    require!(
        governance_item.answer_keys.iter().any(|&key| key == answer_key),
        GovernanceError::InvalidAnswerKey
    );

    if answer_vote.quest_key != 0 {
        require!(!answer_vote.finalized, GovernanceError::AnswerVoteFinalized);
    }

    if answer_vote.quest_key == 0 {
        answer_vote.quest_key = quest_key;
        answer_vote.total_voted = 0;
        answer_vote.finalized = false;
        answer_vote.winning_answer = 0;
        answer_vote.bump = ctx.bumps.answer_vote;
    }

    if answer_option.quest_key == 0 {
        answer_option.quest_key = quest_key;
        answer_option.answer_key = answer_key;
        answer_option.total_votes = 0;
        answer_option.is_active = true;
        answer_option.bump = ctx.bumps.answer_option;
    }

    require!(
        answer_voter_record.quest_key == 0,
        GovernanceError::AlreadyVoted
    );

    let voter_checkpoints = &ctx.accounts.voter_checkpoints;
    let config = &ctx.accounts.config;

    let vote_weight_u8 = voter_checkpoints.get_past_votes(governance_item.start_slot);

    require!(
        vote_weight_u8 >= config.min_required_nft,
        GovernanceError::InsufficientNfts
    );

    // Record the vote
    answer_voter_record.quest_key = quest_key;
    answer_voter_record.voter = ctx.accounts.voter.key();
    answer_voter_record.answer_key = answer_key;
    answer_voter_record.vote_count = vote_weight_u8;
    answer_voter_record.timestamp = clock.unix_timestamp;
    answer_voter_record.rewarded = false;
    answer_voter_record.bump = ctx.bumps.answer_voter_record;

    // Update answer option votes
    answer_option.total_votes = answer_option
        .total_votes
        .checked_add(vote_weight_u8 as u64)
        .ok_or(GovernanceError::MathOverflow)?;

    // Update total votes
    answer_vote.total_voted = answer_vote
        .total_voted
        .checked_add(vote_weight_u8 as u64)
        .ok_or(GovernanceError::MathOverflow)?;

    Ok(())
}
