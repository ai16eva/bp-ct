use anchor_lang::prelude::*;
use crate::states::*;
use crate::errors::GovernanceError;
use crate::constant::{GOVERNANCE_CONFIG_SEED, GOVERNANCE_SEED};
use crate::instructions::user::create_proposal::PROPOSAL_SEED;

#[derive(Accounts)]
#[instruction(proposal_key: u64)]
pub struct SetProposalResult<'info> {
    #[account(
        seeds = [GOVERNANCE_CONFIG_SEED],
        bump = config.bump,
        constraint = config.authority == authority.key() @ GovernanceError::Unauthorized
    )]
    pub config: Account<'info, GovernanceConfig>,

    #[account(
        mut,
        seeds = [GOVERNANCE_SEED],
        bump = governance.bump
    )]
    pub governance: Account<'info, Governance>,

    #[account(
        mut,
        seeds = [PROPOSAL_SEED, proposal_key.to_le_bytes().as_ref()],
        bump = proposal.bump
    )]
    pub proposal: Account<'info, Proposal>,

    pub authority: Signer<'info>,
    pub clock: Sysvar<'info, Clock>,
}

pub fn set_proposal_result(
    ctx: Context<SetProposalResult>,
    proposal_key: u64,
    result: ProposalResult,
    result_vote: u16,
) -> Result<()> {
    let proposal = &mut ctx.accounts.proposal;
    let governance = &mut ctx.accounts.governance;
    let clock = &ctx.accounts.clock;

    require!(
        proposal.result == ProposalResult::Pending,
        GovernanceError::AlreadyFinalized
    );

    require!(
        clock.unix_timestamp > proposal.end_time,
        GovernanceError::VotingPeriodNotEnded
    );

    require!(
        result != ProposalResult::Pending,
        GovernanceError::InvalidParameter
    );

    require!(
        result_vote <= proposal.total_vote,
        GovernanceError::InvalidParameter
    );

    proposal.result = result;
    proposal.result_vote = result_vote;

    governance.active_items = governance.active_items.saturating_sub(1);
    governance.completed_items += 1;

    emit!(ProposalResultSet {
        proposal_key,
        result,
        result_vote,
        total_vote: proposal.total_vote,
        finalized_at: clock.unix_timestamp,
    });

    Ok(())
}

#[event]
pub struct ProposalResultSet {
    pub proposal_key: u64,
    pub result: ProposalResult,
    pub result_vote: u16,
    pub total_vote: u16,
    pub finalized_at: i64,
}