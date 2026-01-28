use anchor_lang::prelude::*;
use anchor_spl::metadata::{
    update_metadata_accounts_v2, UpdateMetadataAccountsV2, Metadata,
};
use crate::states::*;
use crate::errors::GovernanceError;
use crate::constant::GOVERNANCE_CONFIG_SEED;

#[derive(Accounts)]
pub struct UpdateCollection<'info> {
    #[account(
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
        seeds = [b"collection-mint"],
        bump,
        constraint = collection_mint.key() == governance.collection_mint @ GovernanceError::InvalidParameter
    )]
    /// CHECK: Verified in seeds and constraint
    pub collection_mint: AccountInfo<'info>,

    #[account(
        seeds = [b"collection-authority"],
        bump
    )]
    /// CHECK: PDA authority for collection
    pub collection_authority: AccountInfo<'info>,

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

    #[account(mut, constraint = authority.key() == config.authority @ GovernanceError::Unauthorized)]
    pub authority: Signer<'info>,

    pub metadata_program: Program<'info, Metadata>,
}

pub fn update_collection(
    ctx: Context<UpdateCollection>,
    name: String,
    symbol: String,
    uri: String,
) -> Result<()> {
    let governance = &ctx.accounts.governance;

    require!(governance.collection_mint != Pubkey::default(), GovernanceError::CollectionNotCreated);
    require!(name.len() <= 32, GovernanceError::InvalidMetadata);
    require!(symbol.len() <= 10, GovernanceError::InvalidMetadata);
    require!(uri.len() <= 200, GovernanceError::InvalidMetadata);

    let authority_bump = ctx.bumps.collection_authority;
    let authority_seeds = &[b"collection-authority".as_ref(), &[authority_bump]];
    let signer_seeds = &[&authority_seeds[..]];

    update_metadata_accounts_v2(
        CpiContext::new_with_signer(
            ctx.accounts.metadata_program.to_account_info(),
            UpdateMetadataAccountsV2 {
                metadata: ctx.accounts.collection_metadata.to_account_info(),
                update_authority: ctx.accounts.collection_authority.to_account_info(),
            },
            signer_seeds,
        ),
        None,
        Some(mpl_token_metadata::types::DataV2 {
            name,
            symbol,
            uri,
            seller_fee_basis_points: 0,
            creators: None,
            collection: None,
            uses: None,
        }),
        None,
        None, 
    )?;

    Ok(())
}
