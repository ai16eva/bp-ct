use anchor_lang::prelude::*;
use anchor_spl::token::TokenAccount;
use mpl_token_metadata::accounts::Metadata as MetaplexMetadata;
use crate::states::*;
use crate::constant::ACCOUNT_DISCRIMINATOR;

#[derive(Accounts)]
pub struct UpdateVoterCheckpoint<'info> {
    #[account(
        seeds = [b"governance_config"],
        bump = config.bump
    )]
    pub config: Account<'info, GovernanceConfig>,

    #[account(
        seeds = [b"governance"],
        bump = governance.bump,
    )]
    pub governance: Account<'info, Governance>,

    #[account(mut)]
    pub voter: Signer<'info>,

    /// Voter's checkpoint history
    /// Stores historical voting power at different slots
    #[account(
        init_if_needed,
        payer = voter,
        space = ACCOUNT_DISCRIMINATOR + VoterCheckpoints::INIT_SPACE,
        seeds = [b"voter_checkpoints", voter.key().as_ref()],
        bump
    )]
    pub voter_checkpoints: Account<'info, VoterCheckpoints>,

    /// Remaining accounts should be pairs of [NFT token account, NFT metadata account] from the governance collection
    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

/// Updates a voter's checkpoint with their current NFT count
/// This should be called whenever a voter's NFT balance changes (mint, transfer, burn)
/// Similar to OpenZeppelin's _writeCheckpoint function
pub fn update_voter_checkpoint(ctx: Context<UpdateVoterCheckpoint>) -> Result<()> {
    let config = &ctx.accounts.config;
    let governance = &ctx.accounts.governance;
    let voter_checkpoints = &mut ctx.accounts.voter_checkpoints;
    let clock = &ctx.accounts.clock;

    // Initialize if needed
    if voter_checkpoints.voter == Pubkey::default() {
        voter_checkpoints.voter = ctx.accounts.voter.key();
        voter_checkpoints.bump = ctx.bumps.voter_checkpoints;
    }

    // Count NFTs from remaining accounts
    let remaining_accounts = &ctx.remaining_accounts;
    let mut valid_nft_count = 0u8;
    let max_votable_nft = config.max_votable_nft;

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

        // Verify ownership - NFTs must belong to the voter
        if nft_token_account.owner != ctx.accounts.voter.key() {
            continue; // Skip NFTs not owned by voter
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

        // Try to find and verify the metadata account in remaining_accounts
        if let Some(metadata_account) = remaining_accounts.iter().find(|acc| acc.key() == metadata_pubkey) {
            // Metadata account provided - perform full verification
            let metadata_data = match metadata_account.try_borrow_data() {
                Ok(data) => data,
                Err(_) => continue, // Skip if can't read metadata
            };

            let metadata = match MetaplexMetadata::safe_deserialize(&metadata_data) {
                Ok(meta) => meta,
                Err(_) => continue, // Skip if can't deserialize metadata
            };

            // Verify the NFT belongs to the governance collection
            let collection_verified = metadata.collection
                .as_ref()
                .map(|c| c.verified && c.key == governance.collection_mint)
                .unwrap_or(false);

            if !collection_verified {
                continue; // Skip NFTs not from the verified collection
            }
        } else {
            // Metadata account is required for verification
            continue;
        }

        valid_nft_count += 1;
    }

    // Update the checkpoint with current slot and NFT count
    voter_checkpoints.update_checkpoint(clock.slot, valid_nft_count)?;

    emit!(CheckpointUpdated {
        voter: ctx.accounts.voter.key(),
        slot: clock.slot,
        nft_count: valid_nft_count,
    });

    Ok(())
}

#[event]
pub struct CheckpointUpdated {
    pub voter: Pubkey,
    pub slot: u64,
    pub nft_count: u8,
}
