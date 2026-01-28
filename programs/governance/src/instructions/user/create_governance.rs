use anchor_lang::prelude::*;
use anchor_spl::token::TokenAccount;
use mpl_token_metadata::accounts::Metadata as MetaplexMetadata;
use crate::states::*;
use crate::errors::GovernanceError;
use crate::constant::{ACCOUNT_DISCRIMINATOR, GOVERNANCE_CONFIG_SEED, GOVERNANCE_ITEM_SEED, QUEST_VOTE_SEED};

#[derive(Accounts)]
#[instruction(quest_key: u64)]
pub struct CreateGovernanceItem<'info> {
    #[account(
        mut,
        seeds = [GOVERNANCE_CONFIG_SEED],
        bump = config.bump
    )]
    pub config: Account<'info, GovernanceConfig>,
    
    #[account(
        mut,
        seeds = [b"governance"],
        bump = governance.bump,
    )]
    pub governance: Account<'info, Governance>,
    
    #[account(
        init,
        payer = creator,
        space = ACCOUNT_DISCRIMINATOR + GovernanceItem::INIT_SPACE,
        seeds = [GOVERNANCE_ITEM_SEED, quest_key.to_le_bytes().as_ref()],
        bump
    )]
    pub governance_item: Account<'info, GovernanceItem>,
    
    #[account(
        init,
        payer = creator,
        space = ACCOUNT_DISCRIMINATOR + QuestVote::INIT_SPACE,
        seeds = [QUEST_VOTE_SEED, quest_key.to_le_bytes().as_ref()],
        bump
    )]
    pub quest_vote: Account<'info, QuestVote>,
    
    #[account(mut)]
    pub creator: Signer<'info>,

    /// Remaining accounts should be pairs of [NFT token account, NFT metadata account] from the governance collection
    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

pub fn create_governance(
    ctx: Context<CreateGovernanceItem>,
    quest_key: u64,
    question: String,
) -> Result<()> {
    let config = &ctx.accounts.config;
    let governance = &mut ctx.accounts.governance;
    let governance_item = &mut ctx.accounts.governance_item;
    let quest_vote = &mut ctx.accounts.quest_vote;
    let clock = &ctx.accounts.clock;

    require!(!config.paused, GovernanceError::GovernancePaused);
    require!(question.len() <= 280, GovernanceError::QuestionTooLong);

    // Validate creator has minimum required NFTs
    let remaining_accounts = &ctx.remaining_accounts;
    let mut valid_nft_count = 0u8;
    let max_votable_nft = config.max_votable_nft;
    let min_required_nft = config.min_required_nft;

    let accounts_to_check = remaining_accounts.len().min(max_votable_nft as usize);

    for i in 0..accounts_to_check {
        let nft_account_info = &remaining_accounts[i];

        // Try to deserialize as token account
        let token_account_data = match nft_account_info.try_borrow_data() {
            Ok(data) => data,
            Err(_) => continue,
        };

        if token_account_data.len() < TokenAccount::LEN {
            continue;
        }

        let nft_token_account = match TokenAccount::try_deserialize(&mut &token_account_data[..]) {
            Ok(account) => account,
            Err(_) => continue,
        };

        // Verify ownership - NFTs must belong to the creator
        if nft_token_account.owner != ctx.accounts.creator.key() {
            continue; // Skip NFTs not owned by creator
        }

        // Verify it's an NFT (amount = 1)
        if nft_token_account.amount != 1 {
            continue; // Skip non-NFT tokens
        }

        // Verify NFT is from governance collection by checking metadata
        let nft_mint = nft_token_account.mint;

        // Derive the metadata account address
        let metadata_seeds = &[
            b"metadata",
            mpl_token_metadata::ID.as_ref(),
            nft_mint.as_ref(),
        ];
        let (metadata_pubkey, _) = Pubkey::find_program_address(
            metadata_seeds,
            &mpl_token_metadata::ID,
        );

        if let Some(metadata_account) = remaining_accounts.iter().find(|acc| acc.key() == metadata_pubkey) {
            let metadata_data = match metadata_account.try_borrow_data() {
                Ok(data) => data,
                Err(_) => continue,
            };

            let metadata = match MetaplexMetadata::safe_deserialize(&metadata_data) {
                Ok(meta) => meta,
                Err(_) => continue, 
            };

            let collection_verified = metadata.collection
                .as_ref()
                .map(|c| c.verified && c.key == governance.collection_mint)
                .unwrap_or(false);

            if !collection_verified {
                continue; 
            }
        } else {
            continue;
        }

        valid_nft_count += 1;
    }

    require!(
        valid_nft_count >= min_required_nft,
        GovernanceError::InsufficientNfts
    );
    
    let current_time = clock.unix_timestamp;
    let end_time = current_time + (config.duration_hours as i64 * 3600);
    
    governance_item.quest_key = quest_key;
    governance_item.question = question;
    governance_item.creator = ctx.accounts.creator.key();
    governance_item.quest_result = QuestResult::Pending;
    governance_item.decision_result = DecisionResult::Pending;
    governance_item.answer_result = 0;
    governance_item.start_slot = clock.slot;
    governance_item.quest_start_time = current_time;
    governance_item.quest_end_time = end_time;
    governance_item.decision_start_time = 0;
    governance_item.decision_end_time = 0;
    governance_item.answer_start_time = 0;
    governance_item.answer_end_time = 0;
    governance_item.answer_keys = Vec::new();
    governance_item.bump = ctx.bumps.governance_item;
    
    quest_vote.quest_key = quest_key;
    quest_vote.count_approver = 0;
    quest_vote.count_rejector = 0;
    quest_vote.total_voted = 0;
    quest_vote.finalized = false;
    quest_vote.bump = ctx.bumps.quest_vote;
    
    governance.total_items += 1;
    governance.active_items += 1;
    
    emit!(GovernanceItemCreated {
        quest_key,
        question: governance_item.question.clone(),
        creator: governance_item.creator,
        created_at: current_time as u64,
        end_at: end_time as u64,
        start_slot: governance_item.start_slot,
    });
    
    Ok(())
}

#[event]
pub struct GovernanceItemCreated {
    pub quest_key: u64,
    pub question: String,
    pub creator: Pubkey,
    pub created_at: u64,
    pub end_at: u64,
    pub start_slot: u64,
}