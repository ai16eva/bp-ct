use anchor_lang::prelude::*;

/// Individual checkpoint recording voting power at a specific slot
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq, InitSpace)]
pub struct Checkpoint {
    pub slot: u64,      // Slot number when checkpoint was created
    pub nft_count: u8,  // Number of NFTs owned at that slot
}

/// Stores historical checkpoints for a voter
/// Similar to OpenZeppelin's Votes.sol checkpoint system
#[account]
#[derive(Debug, InitSpace)]
pub struct VoterCheckpoints {
    pub voter: Pubkey,
    #[max_len(50)]  // Store up to 50 historical checkpoints
    pub checkpoints: Vec<Checkpoint>,
    pub bump: u8,
}

impl VoterCheckpoints {
    /// Binary search to find voting power at a specific slot
    /// Returns the number of NFTs the voter owned at or before the target slot
    ///
    /// This implements the same algorithm as OpenZeppelin's _checkpointsLookup
    /// Time complexity: O(log n)
    pub fn get_past_votes(&self, target_slot: u64) -> u8 {
        let checkpoints = &self.checkpoints;

        // If no checkpoints or target is before first checkpoint, return 0
        if checkpoints.is_empty() || checkpoints[0].slot > target_slot {
            return 0;
        }

        // Binary search for the checkpoint at or before target_slot
        let mut low = 0usize;
        let mut high = checkpoints.len();

        while low < high {
            let mid = (low + high) / 2;
            if checkpoints[mid].slot > target_slot {
                high = mid;
            } else {
                low = mid + 1;
            }
        }

        // Return the voting power from the checkpoint just before 'high'
        checkpoints[high - 1].nft_count
    }

    /// Add a new checkpoint or update the most recent one
    /// This is called whenever a voter's NFT balance changes
    pub fn update_checkpoint(&mut self, current_slot: u64, new_nft_count: u8) -> Result<()> {
        // If this is for the same slot as the last checkpoint, update it
        if let Some(last) = self.checkpoints.last_mut() {
            if last.slot == current_slot {
                last.nft_count = new_nft_count;
                return Ok(());
            }
        }

        // Otherwise, add a new checkpoint
        self.checkpoints.push(Checkpoint {
            slot: current_slot,
            nft_count: new_nft_count,
        });

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_binary_search_empty() {
        let checkpoints = VoterCheckpoints {
            voter: Pubkey::default(),
            checkpoints: vec![],
            bump: 0,
        };

        assert_eq!(checkpoints.get_past_votes(100), 0);
    }

    #[test]
    fn test_binary_search_before_first() {
        let checkpoints = VoterCheckpoints {
            voter: Pubkey::default(),
            checkpoints: vec![
                Checkpoint { slot: 100, nft_count: 5 },
            ],
            bump: 0,
        };

        assert_eq!(checkpoints.get_past_votes(50), 0);
    }

    #[test]
    fn test_binary_search_exact_match() {
        let checkpoints = VoterCheckpoints {
            voter: Pubkey::default(),
            checkpoints: vec![
                Checkpoint { slot: 100, nft_count: 3 },
                Checkpoint { slot: 200, nft_count: 5 },
                Checkpoint { slot: 300, nft_count: 7 },
            ],
            bump: 0,
        };

        assert_eq!(checkpoints.get_past_votes(100), 3);
        assert_eq!(checkpoints.get_past_votes(200), 5);
        assert_eq!(checkpoints.get_past_votes(300), 7);
    }

    #[test]
    fn test_binary_search_between_checkpoints() {
        let checkpoints = VoterCheckpoints {
            voter: Pubkey::default(),
            checkpoints: vec![
                Checkpoint { slot: 100, nft_count: 3 },
                Checkpoint { slot: 200, nft_count: 5 },
                Checkpoint { slot: 300, nft_count: 7 },
            ],
            bump: 0,
        };

        // Between 100 and 200, should return 3
        assert_eq!(checkpoints.get_past_votes(150), 3);
        // Between 200 and 300, should return 5
        assert_eq!(checkpoints.get_past_votes(250), 5);
        // After 300, should return 7
        assert_eq!(checkpoints.get_past_votes(400), 7);
    }

    #[test]
    fn test_binary_search_many_checkpoints() {
        let mut checkpoints_vec = vec![];
        for i in 0..50 {
            checkpoints_vec.push(Checkpoint {
                slot: (i + 1) * 100,
                nft_count: i as u8,
            });
        }

        let checkpoints = VoterCheckpoints {
            voter: Pubkey::default(),
            checkpoints: checkpoints_vec,
            bump: 0,
        };

        // Test various points
        assert_eq!(checkpoints.get_past_votes(150), 1);
        assert_eq!(checkpoints.get_past_votes(2550), 25);
        assert_eq!(checkpoints.get_past_votes(5000), 49);
    }
}
