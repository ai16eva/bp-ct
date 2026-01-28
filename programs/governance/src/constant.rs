pub const ACCOUNT_DISCRIMINATOR: usize = 8;

// Governance constants
pub const MIN_TOTAL_VOTE: u64 = 10;
pub const MAX_TOTAL_VOTE: u64 = 300;
pub const CONSTANT_REWARD_TOKEN: u64 = 5;
pub const DURATION_HOURS: u64 = 24;
pub const MAX_VOTABLE_NFT: u8 = 5;
pub const MIN_REQUIRED_NFT: u8 = 3;

// PDA seed constants
pub const GOVERNANCE_SEED: &[u8] = b"governance";
pub const GOVERNANCE_CONFIG_SEED: &[u8] = b"governance_config";
pub const TREASURY_SEED: &[u8] = b"treasury";
pub const GOVERNANCE_ITEM_SEED: &[u8] = b"governance_item";
pub const QUEST_VOTE_SEED: &[u8] = b"quest_vote";
pub const QUEST_VOTER_SEED: &[u8] = b"quest_voter";
pub const DECISION_VOTE_SEED: &[u8] = b"decision_vote";
pub const ANSWER_VOTE_SEED: &[u8] = b"answer_vote";
pub const VOTER_RECORD_SEED: &[u8] = b"voter_record";
pub const DECISION_VOTER_SEED: &[u8] = b"decision_voter";
pub const TREASURY_TOKEN_ACCOUNT_SEED: &[u8] = b"token_account";