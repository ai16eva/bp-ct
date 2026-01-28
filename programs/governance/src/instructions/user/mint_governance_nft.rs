use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::{
        create_master_edition_v3, create_metadata_accounts_v3,
        verify_sized_collection_item, VerifySizedCollectionItem,
        CreateMasterEditionV3, CreateMetadataAccountsV3,
        Metadata,
    },
    token::{mint_to, Mint, MintTo, Token, TokenAccount},
};
use crate::states::*;
use crate::errors::GovernanceError;
use crate::constant::GOVERNANCE_CONFIG_SEED;

#[derive(Accounts)]
pub struct MintGovernanceNft<'info> {
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
        constraint = governance.collection_mint != Pubkey::default() @ GovernanceError::CollectionNotCreated
    )]
    pub governance: Account<'info, Governance>,

    #[account(
        init,
        payer = authority,
        mint::decimals = 0,
        mint::authority = nft_authority.key(),
        mint::freeze_authority = nft_authority.key(),
    )]
    pub nft_mint: Account<'info, Mint>,

    #[account(
        seeds = [b"nft-authority"],
        bump
    )]
    /// CHECK: PDA authority for NFT
    pub nft_authority: AccountInfo<'info>,

    #[account(
        init_if_needed,
        payer = authority,
        associated_token::mint = nft_mint,
        associated_token::authority = receiver,
    )]
    pub receiver_nft_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [
            b"metadata",
            metadata_program.key().as_ref(),
            nft_mint.key().as_ref(),
        ],
        seeds::program = metadata_program.key(),
        bump,
    )]
    /// CHECK: Verified by Metaplex
    pub metadata_account: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [
            b"metadata",
            metadata_program.key().as_ref(),
            nft_mint.key().as_ref(),
            b"edition",
        ],
        seeds::program = metadata_program.key(),
        bump,
    )]
    /// CHECK: Verified by Metaplex
    pub master_edition: AccountInfo<'info>,

    /// Collection mint account
    #[account(
        seeds = [b"collection-mint"],
        bump,
        constraint = collection_mint.key() == governance.collection_mint @ GovernanceError::InvalidParameter
    )]
    pub collection_mint: Account<'info, Mint>,

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

    #[account(
        seeds = [b"collection-authority"],
        bump
    )]
    /// CHECK: PDA authority for collection
    pub collection_authority: AccountInfo<'info>,

    #[account(mut, constraint = authority.key() == config.authority @ GovernanceError::Unauthorized)]
    pub authority: Signer<'info>,

    /// CHECK: The user receiving the NFT
    pub receiver: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub metadata_program: Program<'info, Metadata>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn mint_governance_nft(
    ctx: Context<MintGovernanceNft>,
    name: String,
    symbol: String,
    uri: String,
) -> Result<()> {
    let config = &ctx.accounts.config;
    let governance = &mut ctx.accounts.governance;

    require!(!config.paused, GovernanceError::GovernancePaused);

    require!(name.len() <= 32, GovernanceError::InvalidMetadata);
    require!(symbol.len() <= 10, GovernanceError::InvalidMetadata);
    require!(uri.len() <= 200, GovernanceError::InvalidMetadata);

    let current_time = Clock::get()?.unix_timestamp;

    let authority_bump = ctx.bumps.nft_authority;
    let authority_seeds = &[b"nft-authority".as_ref(), &[authority_bump]];
    let signer_seeds = &[&authority_seeds[..]];

    mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.nft_mint.to_account_info(),
                to: ctx.accounts.receiver_nft_account.to_account_info(),
                authority: ctx.accounts.nft_authority.to_account_info(),
            },
            signer_seeds,
        ),
        1,
    )?;

    create_metadata_accounts_v3(
        CpiContext::new_with_signer(
            ctx.accounts.metadata_program.to_account_info(),
            CreateMetadataAccountsV3 {
                metadata: ctx.accounts.metadata_account.to_account_info(),
                mint: ctx.accounts.nft_mint.to_account_info(),
                mint_authority: ctx.accounts.nft_authority.to_account_info(),
                payer: ctx.accounts.authority.to_account_info(),
                update_authority: ctx.accounts.nft_authority.to_account_info(),
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
            collection: Some(mpl_token_metadata::types::Collection {
                verified: false,
                key: ctx.accounts.collection_mint.key(),
            }),
            uses: None,
        },
        true,
        true,
        None,
    )?;

    create_master_edition_v3(
        CpiContext::new_with_signer(
            ctx.accounts.metadata_program.to_account_info(),
            CreateMasterEditionV3 {
                edition: ctx.accounts.master_edition.to_account_info(),
                mint: ctx.accounts.nft_mint.to_account_info(),
                update_authority: ctx.accounts.nft_authority.to_account_info(),
                mint_authority: ctx.accounts.nft_authority.to_account_info(),
                payer: ctx.accounts.authority.to_account_info(),
                metadata: ctx.accounts.metadata_account.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
            signer_seeds,
        ),
        Some(0),
    )?;

    governance.total_nfts_minted += 1;

    // Verify the NFT as part of the collection
    let collection_authority_bump = ctx.bumps.collection_authority;
    let collection_authority_seeds = &[b"collection-authority".as_ref(), &[collection_authority_bump]];
    let collection_signer_seeds = &[&collection_authority_seeds[..]];

    verify_sized_collection_item(
        CpiContext::new_with_signer(
            ctx.accounts.metadata_program.to_account_info(),
            VerifySizedCollectionItem {
                metadata: ctx.accounts.metadata_account.to_account_info(),
                collection_authority: ctx.accounts.collection_authority.to_account_info(),
                payer: ctx.accounts.authority.to_account_info(),
                collection_mint: ctx.accounts.collection_mint.to_account_info(),
                collection_metadata: ctx.accounts.collection_metadata.to_account_info(),
                collection_master_edition: ctx.accounts.collection_master_edition.to_account_info(),
            },
            collection_signer_seeds,
        ),
        None,
    )?;

    emit!(GovernanceNftMinted {
        user: ctx.accounts.receiver.key(),
        mint: ctx.accounts.nft_mint.key(),
        minted_at: current_time as u64,
        nft_number: governance.total_nfts_minted,
    });

    Ok(())
}

#[event]
pub struct GovernanceNftMinted {
    pub user: Pubkey,
    pub mint: Pubkey,
    pub minted_at: u64,
    pub nft_number: u64,
}