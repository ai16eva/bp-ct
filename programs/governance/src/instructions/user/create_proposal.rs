use anchor_lang::prelude::*;
use crate::states::*;
use crate::errors::GovernanceError;
use crate::constant::{ACCOUNT_DISCRIMINATOR, GOVERNANCE_CONFIG_SEED, GOVERNANCE_SEED};

pub const PROPOSAL_SEED: &[u8] = b"proposal";

#[derive(Accounts)]
#[instruction(proposal_key: u64, title: String)]
pub struct CreateProposal<'info> {
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
        init,
        payer = creator,
        space = ACCOUNT_DISCRIMINATOR + Proposal::INIT_SPACE,
        seeds = [PROPOSAL_SEED, proposal_key.to_le_bytes().as_ref()],
        bump
    )]
    pub proposal: Account<'info, Proposal>,

    #[account(mut)]
    pub creator: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

pub fn create_proposal(
    ctx: Context<CreateProposal>,
    proposal_key: u64,
    title: String,
) -> Result<()> {
    let config = &ctx.accounts.config;
    let governance = &mut ctx.accounts.governance;
    let proposal = &mut ctx.accounts.proposal;
    let clock = &ctx.accounts.clock;

    require!(!config.paused, GovernanceError::GovernancePaused);
    require!(title.len() <= 200, GovernanceError::TitleTooLong);
    require!(title.len() > 0, GovernanceError::TitleEmpty);

    let current_time = clock.unix_timestamp;
    let end_time = current_time + (config.duration_hours as i64 * 3600);

    proposal.proposal_key = proposal_key;
    proposal.creator = ctx.accounts.creator.key();
    proposal.title = title;
    proposal.result = ProposalResult::Pending;
    proposal.total_vote = 0;
    proposal.result_vote = 0;
    proposal.end_time = end_time;
    proposal.start_block = clock.slot;
    proposal.bump = ctx.bumps.proposal;

    governance.total_items += 1;
    governance.active_items += 1;

    emit!(ProposalCreated {
        proposal_key,
        title: proposal.title.clone(),
        creator: proposal.creator,
        created_at: current_time,
        end_time,
        start_block: proposal.start_block,
    });

    Ok(())
}

#[event]
pub struct ProposalCreated {
    pub proposal_key: u64,
    pub title: String,
    pub creator: Pubkey,
    pub created_at: i64,
    pub end_time: i64,
    pub start_block: u64,
}