use anchor_lang::prelude::*;

pub mod errors;
pub mod instructions;
pub mod states;
pub mod constant;

use instructions::*;
use states::*;

declare_id!("7TZjVdq7tCURLGSnJfd41K9W9k4jhjsJFQt7qqeBCEhe");

#[program]
pub mod boomplay_governance {
    use super::*;

    // ========================================
    // Admin Instructions
    // ========================================

    pub fn initialize(
        ctx: Context<Initialize>,
        min_total_vote: u64,
        max_total_vote: u64,
        min_required_nft: u8,
        max_votable_nft: u8,
        duration_hours: u64,
        constant_reward_token: u64,
    ) -> Result<()> {
        instructions::initialize::initialize(
            ctx,
            min_total_vote,
            max_total_vote,
            min_required_nft,
            max_votable_nft,
            duration_hours,
            constant_reward_token,
        )
    }

    pub fn create_collection(
        ctx: Context<CreateCollection>,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        instructions::create_collection::create_collection(ctx, name, symbol, uri)
    }

    pub fn update_collection(
        ctx: Context<UpdateCollection>,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        instructions::update_collection::update_collection(ctx, name, symbol, uri)
    }

    pub fn pause(ctx: Context<Pause>, paused: bool) -> Result<()> {
        instructions::pause::pause(ctx, paused)
    }

    pub fn withdraw_tokens(
        ctx: Context<WithdrawTokens>,
        amount: u64,
    ) -> Result<()> {
        instructions::withdraw_tokens::withdraw_tokens(ctx, amount)
    }

    // Configuration Instructions
    pub fn set_total_vote(
        ctx: Context<SetTotalVote>,
        min_or_max: String,
        total_vote: u64,
    ) -> Result<()> {
        instructions::set_total_vote::set_total_vote(ctx, min_or_max, total_vote)
    }

    pub fn set_reward_amount(
        ctx: Context<SetRewardAmount>,
        reward_amount: u64,
    ) -> Result<()> {
        instructions::set_reward_amount::set_reward_amount(ctx, reward_amount)
    }

    pub fn set_quest_duration_hours(
        ctx: Context<SetQuestDurationHours>,
        hours: u64,
    ) -> Result<()> {
        instructions::set_quest_duration::set_quest_duration(ctx, hours)
    }

    pub fn set_max_votes_per_voter(
        ctx: Context<SetMaxVotesPerVoter>,
        max_votes: u8,
    ) -> Result<()> {
        instructions::set_max_votes::set_max_votes(ctx, max_votes)
    }

    pub fn set_minimum_required_nfts(
        ctx: Context<SetMinimumRequiredNfts>,
        new_minimum: u8,
    ) -> Result<()> {
        instructions::set_minimum_nfts::set_minimum_nfts(ctx, new_minimum)
    }

    pub fn update_base_token_mint(
        ctx: Context<UpdateBaseTokenMint>,
    ) -> Result<()> {
        instructions::update_base_token_mint::update_base_token_mint(ctx)
    }

    // Quest Management Instructions
    pub fn set_quest_result(
        ctx: Context<SetQuestResult>,
        quest_key: u64,
    ) -> Result<()> {
        instructions::set_quest_result::set_quest_result(ctx, quest_key)
    }

    pub fn make_quest_result(
        ctx: Context<MakeQuestResult>,
        quest_key: u64,
    ) -> Result<()> {
        instructions::make_quest_result::make_quest_result(ctx, quest_key)
    }

    pub fn cancel_quest(
        ctx: Context<CancelQuest>,
        quest_key: u64,
    ) -> Result<()> {
        instructions::cancel_quest::cancel_quest(ctx, quest_key)
    }

    pub fn set_quest_end_time(
        ctx: Context<SetQuestEndTime>,
        quest_key: u64,
        new_end_time: i64,
    ) -> Result<()> {
        instructions::set_quest_end_time::set_quest_end_time(ctx, quest_key, new_end_time)
    }

    // Decision Management Instructions
    pub fn set_decision_and_execute_answer(
        ctx: Context<SetDecisionAndExecuteAnswer>,
        quest_key: u64,
        answer_keys: Vec<u64>,
    ) -> Result<()> {
        instructions::set_decision_answer::set_decision_answer(ctx, quest_key, answer_keys)
    }

    pub fn make_decision_and_execute_answer(
        ctx: Context<MakeDecisionAndExecuteAnswer>,
        quest_key: u64,
        answer_keys: Vec<u64>,
    ) -> Result<()> {
        instructions::make_decision_answer::make_decision_answer(ctx, quest_key, answer_keys)
    }

    pub fn cancel_decision(
        ctx: Context<CancelDecision>,
        quest_key: u64,
    ) -> Result<()> {
        instructions::cancel_decision::cancel_decision(ctx, quest_key)
    }

    pub fn set_decision_end_time(
        ctx: Context<SetDecisionEndTime>,
        quest_key: u64,
        new_end_time: i64,
    ) -> Result<()> {
        instructions::set_decision_end_time::set_decision_end_time(ctx, quest_key, new_end_time)
    }

    // Answer Management Instructions
    pub fn set_answer(
        ctx: Context<SetAnswer>,
        quest_key: u64,
        answer_keys: Vec<u64>,
    ) -> Result<()> {
        instructions::set_answer::set_answer(ctx, quest_key, answer_keys)
    }

    pub fn cancel_answer(
        ctx: Context<CancelAnswer>,
        quest_key: u64,
        reason: String,
    ) -> Result<()> {
        instructions::cancel_answer::cancel_answer(ctx, quest_key, reason)
    }

    pub fn set_answer_end_time(
        ctx: Context<SetAnswerEndTime>,
        quest_key: u64,
        new_end_time: i64,
    ) -> Result<()> {
        instructions::set_answer_end_time::set_answer_end_time(ctx, quest_key, new_end_time)
    }

    pub fn finalize_answer(
        ctx: Context<FinalizeAnswer>,
        quest_key: u64,
    ) -> Result<()> {
        instructions::finalize_answer::finalize_answer(ctx, quest_key)
    }

    // Reward Distribution Instructions
    pub fn distribute_dao_reward(
        ctx: Context<DistributeReward>,
        quest_key: u64,
    ) -> Result<()> {
        instructions::distribute_reward::distribute_reward(ctx, quest_key)
    }

    // Proposal Management Instructions
    pub fn set_proposal_result(
        ctx: Context<SetProposalResult>,
        proposal_key: u64,
        result: ProposalResult,
        result_vote: u16,
    ) -> Result<()> {
        instructions::set_proposal_result::set_proposal_result(ctx, proposal_key, result, result_vote)
    }

    // ========================================
    // User Instructions
    // ========================================

    pub fn mint_governance_nft(
        ctx: Context<MintGovernanceNft>,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        instructions::mint_governance_nft::mint_governance_nft(ctx, name, symbol, uri)
    }

    pub fn create_governance_item(
        ctx: Context<CreateGovernanceItem>,
        quest_key: u64,
        question: String,
    ) -> Result<()> {
        instructions::create_governance::create_governance(ctx, quest_key, question)
    }

    pub fn create_proposal(
        ctx: Context<CreateProposal>,
        proposal_key: u64,
        title: String,
    ) -> Result<()> {
        instructions::create_proposal::create_proposal(ctx, proposal_key, title)
    }

    pub fn vote_quest(
        ctx: Context<VoteQuest>,
        quest_key: u64,
        vote_choice: QuestVoteChoice,
    ) -> Result<()> {
        instructions::vote_quest::vote_quest(ctx, quest_key, vote_choice)
    }

    pub fn start_decision(
        ctx: Context<StartDecision>,
        quest_key: u64,
    ) -> Result<()> {
        instructions::start_decision::start_decision(ctx, quest_key)
    }

    pub fn vote_decision(
        ctx: Context<VoteDecision>,
        quest_key: u64,
        vote_choice: DecisionVoteChoice,
    ) -> Result<()> {
        instructions::vote_decision::vote_decision(ctx, quest_key, vote_choice)
    }

    pub fn vote_answer(
        ctx: Context<VoteAnswer>,
        quest_key: u64,
        answer_key: u64,
    ) -> Result<()> {
        instructions::vote_answer::vote_answer(ctx, quest_key, answer_key)
    }

    pub fn update_voter_checkpoint(
        ctx: Context<UpdateVoterCheckpoint>,
    ) -> Result<()> {
        instructions::update_voter_checkpoint::update_voter_checkpoint(ctx)
    }
}