use anchor_lang::prelude::*;
use crate::states::*;
use crate::errors::GovernanceError;
use crate::constant::{ACCOUNT_DISCRIMINATOR, GOVERNANCE_CONFIG_SEED, GOVERNANCE_ITEM_SEED, DECISION_VOTE_SEED, DECISION_VOTER_SEED, QUEST_VOTER_SEED};

#[derive(Accounts)]
#[instruction(quest_key: u64)]
pub struct VoteDecision<'info> {
    #[account(
        seeds = [GOVERNANCE_CONFIG_SEED],
        bump = config.bump
    )]
    pub config: Account<'info, GovernanceConfig>,

    #[account(
        seeds = [GOVERNANCE_ITEM_SEED, quest_key.to_le_bytes().as_ref()],
        bump = governance_item.bump
    )]
    pub governance_item: Account<'info, GovernanceItem>,

    #[account(
        mut,
        seeds = [DECISION_VOTE_SEED, quest_key.to_le_bytes().as_ref()],
        bump = decision_vote.bump
    )]
    pub decision_vote: Account<'info, DecisionVote>,

    #[account(
        init_if_needed,
        payer = voter,
        space = ACCOUNT_DISCRIMINATOR + DecisionVoterRecord::INIT_SPACE,
        seeds = [DECISION_VOTER_SEED, quest_key.to_le_bytes().as_ref(), voter.key().as_ref()],
        bump
    )]
    pub voter_record: Account<'info, DecisionVoterRecord>,

    #[account(
        seeds = [QUEST_VOTER_SEED, quest_key.to_le_bytes().as_ref(), voter.key().as_ref()],
        bump = quest_voter_record.bump
    )]
    pub quest_voter_record: Account<'info, QuestVoterRecord>,

    #[account(mut)]
    pub voter: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

pub fn vote_decision(
    ctx: Context<VoteDecision>,
    quest_key: u64,
    vote_choice: DecisionVoteChoice,
) -> Result<()> {
    let config = &ctx.accounts.config;
    let governance_item = &ctx.accounts.governance_item;
    let decision_vote = &mut ctx.accounts.decision_vote;
    let voter_record = &mut ctx.accounts.voter_record;
    let quest_voter_record = &ctx.accounts.quest_voter_record;
    let clock = &ctx.accounts.clock;

    require!(!config.paused, GovernanceError::GovernancePaused);

    require!(
        governance_item.quest_result == QuestResult::Approved,
        GovernanceError::QuestNotApproved
    );

    require!(
        governance_item.decision_result == DecisionResult::Pending,
        GovernanceError::DecisionAlreadyFinalized
    );

    require!(
        clock.unix_timestamp <= governance_item.decision_end_time,
        GovernanceError::VotingPeriodEnded
    );

    require!(
        voter_record.quest_key == 0,
        GovernanceError::AlreadyVoted
    );

    // Voting power = number of votes cast in quest phase
    require!(
        quest_voter_record.vote_count > 0,
        GovernanceError::NoQuestParticipation
    );

    let voting_power = quest_voter_record.vote_count as u64;

    match vote_choice {
        DecisionVoteChoice::Success => {
            decision_vote.count_success += voting_power;
        }
        DecisionVoteChoice::Adjourn => {
            decision_vote.count_adjourn += voting_power;
        }
    }

    decision_vote.total_voted += 1;

    voter_record.quest_key = quest_key;
    voter_record.voter = ctx.accounts.voter.key();
    voter_record.vote_choice = vote_choice.clone();
    voter_record.votes = voting_power;
    voter_record.timestamp = clock.unix_timestamp;
    voter_record.bump = ctx.bumps.voter_record;

    emit!(VoteDecisionCast {
        quest_key,
        vote_choice: vote_choice.clone(),
        voter: ctx.accounts.voter.key(),
        votes: voting_power,
    });

    Ok(())
}

#[event]
pub struct VoteDecisionCast {
    pub quest_key: u64,
    pub vote_choice: DecisionVoteChoice,
    pub voter: Pubkey,
    pub votes: u64,
}