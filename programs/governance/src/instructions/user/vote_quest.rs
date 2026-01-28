use anchor_lang::prelude::*;
use crate::states::*;
use crate::errors::GovernanceError;
use crate::constant::{ACCOUNT_DISCRIMINATOR, GOVERNANCE_CONFIG_SEED, GOVERNANCE_ITEM_SEED, QUEST_VOTE_SEED, QUEST_VOTER_SEED};

#[derive(Accounts)]
#[instruction(quest_key: u64)]
pub struct VoteQuest<'info> {
    #[account(
        seeds = [GOVERNANCE_CONFIG_SEED],
        bump = config.bump
    )]
    pub config: Account<'info, GovernanceConfig>,
    
    #[account(
        mut,
        seeds = [GOVERNANCE_ITEM_SEED, quest_key.to_le_bytes().as_ref()],
        bump = governance_item.bump
    )]
    pub governance_item: Account<'info, GovernanceItem>,
    
    #[account(
        mut,
        seeds = [QUEST_VOTE_SEED, quest_key.to_le_bytes().as_ref()],
        bump = quest_vote.bump
    )]
    pub quest_vote: Account<'info, QuestVote>,
    
    #[account(
        init_if_needed,
        payer = voter,
        space = ACCOUNT_DISCRIMINATOR + QuestVoterRecord::INIT_SPACE,
        seeds = [QUEST_VOTER_SEED, quest_key.to_le_bytes().as_ref(), voter.key().as_ref()],
        bump
    )]
    pub voter_record: Account<'info, QuestVoterRecord>,
    
    #[account(mut)]
    pub voter: Signer<'info>,

    /// Voter's checkpoint history - stores voting power at different slots
    /// If not initialized, voter will have 0 voting power
    #[account(
        init_if_needed,
        payer = voter,
        space = ACCOUNT_DISCRIMINATOR + VoterCheckpoints::INIT_SPACE,
        seeds = [b"voter_checkpoints", voter.key().as_ref()],
        bump
    )]
    pub voter_checkpoints: Account<'info, VoterCheckpoints>,

    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

pub fn vote_quest(
    ctx: Context<VoteQuest>,
    quest_key: u64,
    vote_choice: QuestVoteChoice,
) -> Result<()> {
    let config = &ctx.accounts.config;
    let governance_item = &ctx.accounts.governance_item;
    let quest_vote = &mut ctx.accounts.quest_vote;
    let voter_record = &mut ctx.accounts.voter_record;
    let voter_checkpoints = &mut ctx.accounts.voter_checkpoints;
    let clock = &ctx.accounts.clock;

    // Initialize voter_checkpoints if needed
    if voter_checkpoints.voter == Pubkey::default() {
        voter_checkpoints.voter = ctx.accounts.voter.key();
        voter_checkpoints.checkpoints = Vec::new();
        voter_checkpoints.bump = ctx.bumps.voter_checkpoints;
    }

    require!(!config.paused, GovernanceError::GovernancePaused);
    
    require!(
        governance_item.quest_result == QuestResult::Pending,
        GovernanceError::QuestAlreadyFinalized
    );
    
    require!(
        clock.unix_timestamp <= governance_item.quest_end_time,
        GovernanceError::VotingPeriodEnded
    );
    
    require!(
        voter_record.vote_count == 0,
        GovernanceError::AlreadyVoted
    );
    
    // CHECK: Max total votes not exceeded
    let total_current_votes = quest_vote.count_approver + quest_vote.count_rejector;
    require!(
        total_current_votes < config.max_total_vote,
        GovernanceError::MaxTotalVoteReached
    );
    
    // GET VOTING POWER FROM SNAPSHOT (start_slot)
    let voting_power = voter_checkpoints.get_past_votes(governance_item.start_slot);
    
    // VERIFY MINIMUM THRESHOLD
    require!(
        voting_power >= 1,
        GovernanceError::InsufficientVotingPower
    );
    
    // CAP AT MAX_VOTABLE_NFT
    let mut capped_voting_power = voting_power.min(config.max_votable_nft);
    
    // ADJUST IF WOULD EXCEED MAX_TOTAL_VOTE
    let remaining_votes = config.max_total_vote.saturating_sub(total_current_votes);
    capped_voting_power = capped_voting_power.min(remaining_votes as u8);
    
    match vote_choice {
        QuestVoteChoice::Approve => {
            quest_vote.count_approver += capped_voting_power as u64;
        }
        QuestVoteChoice::Reject => {
            quest_vote.count_rejector += capped_voting_power as u64;
        }
    }
    
    quest_vote.total_voted += 1;
    
    voter_record.quest_key = quest_key;
    voter_record.voter = ctx.accounts.voter.key();
    voter_record.vote_count = capped_voting_power;
    voter_record.vote_choice = vote_choice.clone();
    voter_record.timestamp = clock.unix_timestamp;
    voter_record.bump = ctx.bumps.voter_record;
    
    emit!(VoteQuestCast {
        quest_key,
        vote_choice: vote_choice.clone(),
        voter: ctx.accounts.voter.key(),
        votes: capped_voting_power as u64,
    });
    
    Ok(())
}

#[event]
pub struct VoteQuestCast {
    pub quest_key: u64,
    pub vote_choice: QuestVoteChoice,
    pub voter: Pubkey,
    pub votes: u64,
}