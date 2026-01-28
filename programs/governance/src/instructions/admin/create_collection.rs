use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::{
        create_master_edition_v3, create_metadata_accounts_v3,
        CreateMasterEditionV3, CreateMetadataAccountsV3,
        Metadata,
    },
    token::{mint_to, Mint, MintTo, Token, TokenAccount},
};
use crate::states::*;
use crate::errors::GovernanceError;
use crate::constant::GOVERNANCE_CONFIG_SEED;

#[derive(Accounts)]
pub struct CreateCollection<'info> {
    #[account(
        mut,
        seeds = [GOVERNANCE_CONFIG_SEED],
        bump = config.bump
    )]
    pub config: Account<'info, GovernanceConfig>,

    #[account(
        mut,
        seeds = [b"governance"],
        bump = governance.bump
    )]
    pub governance: Account<'info, Governance>,

    #[account(
        init,
        payer = authority,
        mint::decimals = 0,
        mint::authority = collection_authority.key(),
        mint::freeze_authority = collection_authority.key(),
        seeds = [b"collection-mint"],
        bump
    )]
    pub collection_mint: Account<'info, Mint>,

    #[account(
        seeds = [b"collection-authority"],
        bump
    )]
    /// CHECK: PDA authority for collection
    pub collection_authority: AccountInfo<'info>,

    #[account(
        init_if_needed,
        payer = authority,
        associated_token::mint = collection_mint,
        associated_token::authority = collection_authority,
    )]
    pub collection_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [
            b"metadata",
            metadata_program.key().as_ref(),
            collection_mint.key().as_ref(),
        ],
        seeds::program = metadata_program.key(),
        bump,
    )]
    /// CHECK: Verified by Metaplex
    pub collection_metadata: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [
            b"metadata",
            metadata_program.key().as_ref(),
            collection_mint.key().as_ref(),
            b"edition",
        ],
        seeds::program = metadata_program.key(),
        bump,
    )]
    /// CHECK: Verified by Metaplex
    pub collection_master_edition: AccountInfo<'info>,

    #[account(mut, constraint = authority.key() == config.authority @ GovernanceError::Unauthorized)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub metadata_program: Program<'info, Metadata>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn create_collection(
    ctx: Context<CreateCollection>,
    name: String,
    symbol: String,
    uri: String,
) -> Result<()> {
    let governance = &mut ctx.accounts.governance;

    require!(governance.collection_mint == Pubkey::default(), GovernanceError::CollectionAlreadyExists);
    require!(name.len() <= 32, GovernanceError::InvalidMetadata);
    require!(symbol.len() <= 10, GovernanceError::InvalidMetadata);
    require!(uri.len() <= 200, GovernanceError::InvalidMetadata);

    let authority_bump = ctx.bumps.collection_authority;
    let authority_seeds = &[b"collection-authority".as_ref(), &[authority_bump]];
    let signer_seeds = &[&authority_seeds[..]];

    // Mint one token to the collection account
    mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.collection_mint.to_account_info(),
                to: ctx.accounts.collection_token_account.to_account_info(),
                authority: ctx.accounts.collection_authority.to_account_info(),
            },
            signer_seeds,
        ),
        1,
    )?;

    // Create metadata for the collection
    create_metadata_accounts_v3(
        CpiContext::new_with_signer(
            ctx.accounts.metadata_program.to_account_info(),
            CreateMetadataAccountsV3 {
                metadata: ctx.accounts.collection_metadata.to_account_info(),
                mint: ctx.accounts.collection_mint.to_account_info(),
                mint_authority: ctx.accounts.collection_authority.to_account_info(),
                payer: ctx.accounts.authority.to_account_info(),
                update_authority: ctx.accounts.collection_authority.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
            signer_seeds,
        ),
        mpl_token_metadata::types::DataV2 {
            name,
            symbol,
            uri,
            seller_fee_basis_points: 0,
            creators: None,
            collection: None,
            uses: None,
        },
        true, // is_mutable
        true, // update_authority_is_signer
        Some(mpl_token_metadata::types::CollectionDetails::V1 { size: 0 }), // Collection details
    )?;

    // Create master edition (for collection)
    create_master_edition_v3(
        CpiContext::new_with_signer(
            ctx.accounts.metadata_program.to_account_info(),
            CreateMasterEditionV3 {
                edition: ctx.accounts.collection_master_edition.to_account_info(),
                mint: ctx.accounts.collection_mint.to_account_info(),
                update_authority: ctx.accounts.collection_authority.to_account_info(),
                mint_authority: ctx.accounts.collection_authority.to_account_info(),
                payer: ctx.accounts.authority.to_account_info(),
                metadata: ctx.accounts.collection_metadata.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
            signer_seeds,
        ),
        Some(0), // max_supply = 0 for collection
    )?;

    // Store collection mint in governance
    governance.collection_mint = ctx.accounts.collection_mint.key();
    governance.collection_created_at = Clock::get()?.unix_timestamp;

    emit!(CollectionCreated {
        collection_mint: ctx.accounts.collection_mint.key(),
        authority: ctx.accounts.authority.key(),
        created_at: governance.collection_created_at as u64,
    });

    Ok(())
}

#[event]
pub struct CollectionCreated {
    pub collection_mint: Pubkey,
    pub authority: Pubkey,
    pub created_at: u64,
}