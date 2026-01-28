use anchor_lang::prelude::*;

#[error_code]
pub enum GovernanceError {
    #[msg("Governance is paused")]
    GovernancePaused,
    
    #[msg("Question is too long (max 280 characters)")]
    QuestionTooLong,
    
    #[msg("Quest already finalized")]
    QuestAlreadyFinalized,
    
    #[msg("Voting period has ended")]
    VotingPeriodEnded,
    
    #[msg("Voting period has not ended yet")]
    VotingPeriodNotEnded,
    
    #[msg("Invalid vote choice")]
    InvalidVoteChoice,
    
    #[msg("Already voted")]
    AlreadyVoted,
    
    #[msg("Insufficient votes to proceed")]
    InsufficientVotes,
    
    #[msg("Already finalized")]
    AlreadyFinalized,
    
    #[msg("Unauthorized")]
    Unauthorized,
    
    #[msg("Quest not approved")]
    QuestNotApproved,
    
    #[msg("Decision already started")]
    DecisionAlreadyStarted,
    
    #[msg("Decision already finalized")]
    DecisionAlreadyFinalized,
    
    #[msg("Answer already finalized")]
    AnswerAlreadyFinalized,
    
    #[msg("Invalid answer key")]
    InvalidAnswerKey,
    
    #[msg("Not eligible for reward")]
    NotEligibleForReward,
    
    #[msg("Reward already claimed")]
    RewardAlreadyClaimed,
    
    #[msg("Insufficient NFTs")]
    InsufficientNfts,
    
    #[msg("Invalid parameter")]
    InvalidParameter,
    
    #[msg("Duration must be greater than 0")]
    InvalidDuration,
    
    #[msg("Max votes must be greater than 0")]
    InvalidMaxVotes,
    
    #[msg("Cannot withdraw to zero address")]
    InvalidWithdrawAddress,
    
    #[msg("Withdraw amount must be greater than 0")]
    InvalidWithdrawAmount,
    
    #[msg("Insufficient balance")]
    InsufficientBalance,
    
    #[msg("Transfer failed")]
    TransferFailed,

    #[msg("Title is too long (max 200 characters)")]
    TitleTooLong,

    #[msg("Title cannot be empty")]
    TitleEmpty,

    #[msg("Result is too long (max 500 characters)")]
    ResultTooLong,

    #[msg("Invalid metadata provided")]
    InvalidMetadata,

    #[msg("Collection already exists")]
    CollectionAlreadyExists,

    #[msg("Collection not created yet")]
    CollectionNotCreated,

    #[msg("Answer result is empty")]
    AnswerResultEmpty,

    #[msg("Answer vote is not finalized")]
    AnswerVoteNotFinalized,

    #[msg("Voter did not vote for the winning answer")]
    VoterDidNotVoteForWinningAnswer,

    #[msg("Voter has no votes")]
    VoterHasNoVotes,

    #[msg("Voter has already been rewarded")]
    VoterAlreadyRewarded,

    #[msg("Math overflow occurred")]
    MathOverflow,

    #[msg("Insufficient treasury balance")]
    InsufficientTreasuryBalance,

    #[msg("Answer voting has not started")]
    AnswerVotingNotStarted,

    #[msg("Answer vote has already been finalized")]
    AnswerVoteFinalized,

    #[msg("Invalid answer keys provided")]
    InvalidAnswerKeys,

    #[msg("Vote counts are not equal")]
    VoteCountNotEqual,

    #[msg("Invalid phase for this operation")]
    InvalidPhase,

    #[msg("Invalid NFT owner")]
    InvalidNftOwner,

    #[msg("Invalid NFT amount")]
    InvalidNftAmount,

    #[msg("Maximum total vote limit reached")]
    MaxTotalVoteReached,

    #[msg("Insufficient voting power")]
    InsufficientVotingPower,

    #[msg("Must participate in quest voting to vote on decision")]
    NoQuestParticipation,
}