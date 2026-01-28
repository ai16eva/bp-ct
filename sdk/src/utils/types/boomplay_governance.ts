/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/boomplay_governance.json`.
 */
export type BoomplayGovernance = {
  "address": "7TZjVdq7tCURLGSnJfd41K9W9k4jhjsJFQt7qqeBCEhe",
  "metadata": {
    "name": "boomplayGovernance",
    "version": "0.1.0",
    "spec": "0.1.0"
  },
  "instructions": [
    {
      "name": "cancelAnswer",
      "discriminator": [
        229,
        166,
        156,
        99,
        10,
        48,
        130,
        19
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "governanceItem",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  105,
                  116,
                  101,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "questKey"
              }
            ]
          }
        },
        {
          "name": "answerVote",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  110,
                  115,
                  119,
                  101,
                  114,
                  95,
                  118,
                  111,
                  116,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "questKey"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "questKey",
          "type": "u64"
        },
        {
          "name": "reason",
          "type": "string"
        }
      ]
    },
    {
      "name": "cancelDecision",
      "discriminator": [
        243,
        100,
        254,
        253,
        209,
        98,
        214,
        102
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "governanceItem",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  105,
                  116,
                  101,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "questKey"
              }
            ]
          }
        },
        {
          "name": "decisionVote",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  99,
                  105,
                  115,
                  105,
                  111,
                  110,
                  95,
                  118,
                  111,
                  116,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "questKey"
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "questKey",
          "type": "u64"
        }
      ]
    },
    {
      "name": "cancelQuest",
      "discriminator": [
        204,
        232,
        50,
        68,
        92,
        169,
        110,
        198
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "governanceItem",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  105,
                  116,
                  101,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "questKey"
              }
            ]
          }
        },
        {
          "name": "questVote",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  113,
                  117,
                  101,
                  115,
                  116,
                  95,
                  118,
                  111,
                  116,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "questKey"
              }
            ]
          }
        },
        {
          "name": "governance",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "questKey",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createCollection",
      "discriminator": [
        156,
        251,
        92,
        54,
        233,
        2,
        16,
        82
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "governance",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "collectionMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  108,
                  108,
                  101,
                  99,
                  116,
                  105,
                  111,
                  110,
                  45,
                  109,
                  105,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "collectionAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  108,
                  108,
                  101,
                  99,
                  116,
                  105,
                  111,
                  110,
                  45,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "collectionTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "collectionAuthority"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "collectionMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "collectionMetadata",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  116,
                  97,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "metadataProgram"
              },
              {
                "kind": "account",
                "path": "collectionMint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "metadataProgram"
            }
          }
        },
        {
          "name": "collectionMasterEdition",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  116,
                  97,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "metadataProgram"
              },
              {
                "kind": "account",
                "path": "collectionMint"
              },
              {
                "kind": "const",
                "value": [
                  101,
                  100,
                  105,
                  116,
                  105,
                  111,
                  110
                ]
              }
            ],
            "program": {
              "kind": "account",
              "path": "metadataProgram"
            }
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "metadataProgram",
          "address": "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "symbol",
          "type": "string"
        },
        {
          "name": "uri",
          "type": "string"
        }
      ]
    },
    {
      "name": "createGovernanceItem",
      "discriminator": [
        37,
        225,
        184,
        135,
        232,
        248,
        56,
        77
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "governance",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "governanceItem",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  105,
                  116,
                  101,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "questKey"
              }
            ]
          }
        },
        {
          "name": "questVote",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  113,
                  117,
                  101,
                  115,
                  116,
                  95,
                  118,
                  111,
                  116,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "questKey"
              }
            ]
          }
        },
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "docs": [
            "Remaining accounts should be pairs of [NFT token account, NFT metadata account] from the governance collection"
          ],
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "clock",
          "address": "SysvarC1ock11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "questKey",
          "type": "u64"
        },
        {
          "name": "question",
          "type": "string"
        }
      ]
    },
    {
      "name": "createProposal",
      "discriminator": [
        132,
        116,
        68,
        174,
        216,
        160,
        198,
        22
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "governance",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "proposal",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  112,
                  111,
                  115,
                  97,
                  108
                ]
              },
              {
                "kind": "arg",
                "path": "proposalKey"
              }
            ]
          }
        },
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "clock",
          "address": "SysvarC1ock11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "proposalKey",
          "type": "u64"
        },
        {
          "name": "title",
          "type": "string"
        }
      ]
    },
    {
      "name": "distributeDaoReward",
      "discriminator": [
        189,
        115,
        16,
        167,
        98,
        186,
        160,
        116
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "governance",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "governanceItem",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  105,
                  116,
                  101,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "questKey"
              }
            ]
          }
        },
        {
          "name": "answerVote",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  110,
                  115,
                  119,
                  101,
                  114,
                  95,
                  118,
                  111,
                  116,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "questKey"
              }
            ]
          }
        },
        {
          "name": "voterRecord",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  110,
                  115,
                  119,
                  101,
                  114,
                  95,
                  118,
                  111,
                  116,
                  101,
                  114
                ]
              },
              {
                "kind": "arg",
                "path": "questKey"
              },
              {
                "kind": "account",
                "path": "voter"
              }
            ]
          }
        },
        {
          "name": "voter",
          "docs": [
            "The voter receiving the reward"
          ],
          "signer": true
        },
        {
          "name": "voterTokenAccount",
          "docs": [
            "Voter's token account to receive rewards"
          ],
          "writable": true
        },
        {
          "name": "treasuryPda",
          "docs": [
            "Treasury PDA - signer authority for reward distribution"
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "treasuryTokenAccount",
          "docs": [
            "Treasury token account holding the reward tokens"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121
                ]
              },
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "questKey",
          "type": "u64"
        }
      ]
    },
    {
      "name": "finalizeAnswer",
      "discriminator": [
        240,
        227,
        67,
        178,
        248,
        3,
        172,
        45
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "governanceItem",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  105,
                  116,
                  101,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "questKey"
              }
            ]
          }
        },
        {
          "name": "answerVote",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  110,
                  115,
                  119,
                  101,
                  114,
                  95,
                  118,
                  111,
                  116,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "questKey"
              }
            ]
          }
        },
        {
          "name": "clock",
          "address": "SysvarC1ock11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "questKey",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "governance",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "baseNftCollection"
        },
        {
          "name": "treasuryPda",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "treasuryTokenAccount",
          "docs": [
            "Treasury token account - holds reward tokens"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121
                ]
              },
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "baseTokenMint"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "minTotalVote",
          "type": "u64"
        },
        {
          "name": "maxTotalVote",
          "type": "u64"
        },
        {
          "name": "minRequiredNft",
          "type": "u8"
        },
        {
          "name": "maxVotableNft",
          "type": "u8"
        },
        {
          "name": "durationHours",
          "type": "u64"
        },
        {
          "name": "constantRewardToken",
          "type": "u64"
        }
      ]
    },
    {
      "name": "makeDecisionAndExecuteAnswer",
      "discriminator": [
        71,
        166,
        60,
        109,
        237,
        79,
        199,
        110
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "governanceItem",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  105,
                  116,
                  101,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "questKey"
              }
            ]
          }
        },
        {
          "name": "decisionVote",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  99,
                  105,
                  115,
                  105,
                  111,
                  110,
                  95,
                  118,
                  111,
                  116,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "questKey"
              }
            ]
          }
        },
        {
          "name": "answerVote",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  110,
                  115,
                  119,
                  101,
                  114,
                  95,
                  118,
                  111,
                  116,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "questKey"
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "clock",
          "address": "SysvarC1ock11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "questKey",
          "type": "u64"
        },
        {
          "name": "answerKeys",
          "type": {
            "vec": "u64"
          }
        }
      ]
    },
    {
      "name": "makeQuestResult",
      "discriminator": [
        95,
        98,
        201,
        45,
        227,
        156,
        244,
        137
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "governanceItem",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  105,
                  116,
                  101,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "questKey"
              }
            ]
          }
        },
        {
          "name": "questVote",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  113,
                  117,
                  101,
                  115,
                  116,
                  95,
                  118,
                  111,
                  116,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "questKey"
              }
            ]
          }
        },
        {
          "name": "governance",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "clock",
          "address": "SysvarC1ock11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "questKey",
          "type": "u64"
        }
      ]
    },
    {
      "name": "mintGovernanceNft",
      "discriminator": [
        254,
        169,
        110,
        51,
        79,
        126,
        4,
        54
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "governance",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "nftMint",
          "writable": true,
          "signer": true
        },
        {
          "name": "nftAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  102,
                  116,
                  45,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "userNftAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "nftMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "metadataAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  116,
                  97,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "metadataProgram"
              },
              {
                "kind": "account",
                "path": "nftMint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "metadataProgram"
            }
          }
        },
        {
          "name": "masterEdition",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  116,
                  97,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "metadataProgram"
              },
              {
                "kind": "account",
                "path": "nftMint"
              },
              {
                "kind": "const",
                "value": [
                  101,
                  100,
                  105,
                  116,
                  105,
                  111,
                  110
                ]
              }
            ],
            "program": {
              "kind": "account",
              "path": "metadataProgram"
            }
          }
        },
        {
          "name": "collectionMint",
          "docs": [
            "Collection mint account"
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  108,
                  108,
                  101,
                  99,
                  116,
                  105,
                  111,
                  110,
                  45,
                  109,
                  105,
                  110,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "collectionMetadata",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  116,
                  97,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "metadataProgram"
              },
              {
                "kind": "account",
                "path": "collectionMint"
              }
            ],
            "program": {
              "kind": "account",
              "path": "metadataProgram"
            }
          }
        },
        {
          "name": "collectionMasterEdition",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  116,
                  97,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "metadataProgram"
              },
              {
                "kind": "account",
                "path": "collectionMint"
              },
              {
                "kind": "const",
                "value": [
                  101,
                  100,
                  105,
                  116,
                  105,
                  111,
                  110
                ]
              }
            ],
            "program": {
              "kind": "account",
              "path": "metadataProgram"
            }
          }
        },
        {
          "name": "collectionAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  108,
                  108,
                  101,
                  99,
                  116,
                  105,
                  111,
                  110,
                  45,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "metadataProgram",
          "address": "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "symbol",
          "type": "string"
        },
        {
          "name": "uri",
          "type": "string"
        }
      ]
    },
    {
      "name": "pause",
      "discriminator": [
        211,
        22,
        221,
        251,
        74,
        121,
        193,
        47
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "paused",
          "type": "bool"
        }
      ]
    },
    {
      "name": "setAnswer",
      "discriminator": [
        230,
        3,
        167,
        199,
        128,
        42,
        235,
        97
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "governanceItem",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  105,
                  116,
                  101,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "questKey"
              }
            ]
          }
        },
        {
          "name": "answerVote",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  110,
                  115,
                  119,
                  101,
                  114,
                  95,
                  118,
                  111,
                  116,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "questKey"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "questKey",
          "type": "u64"
        },
        {
          "name": "answerKeys",
          "type": {
            "vec": "u64"
          }
        }
      ]
    },
    {
      "name": "setAnswerEndTime",
      "discriminator": [
        26,
        5,
        178,
        28,
        44,
        244,
        160,
        5
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "governanceItem",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  105,
                  116,
                  101,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "questKey"
              }
            ]
          }
        },
        {
          "name": "answerVote",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  110,
                  115,
                  119,
                  101,
                  114,
                  95,
                  118,
                  111,
                  116,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "questKey"
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "clock",
          "address": "SysvarC1ock11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "questKey",
          "type": "u64"
        },
        {
          "name": "newEndTime",
          "type": "i64"
        }
      ]
    },
    {
      "name": "setDecisionAndExecuteAnswer",
      "discriminator": [
        10,
        154,
        188,
        51,
        58,
        219,
        240,
        165
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "governanceItem",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  105,
                  116,
                  101,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "questKey"
              }
            ]
          }
        },
        {
          "name": "decisionVote",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  99,
                  105,
                  115,
                  105,
                  111,
                  110,
                  95,
                  118,
                  111,
                  116,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "questKey"
              }
            ]
          }
        },
        {
          "name": "answerVote",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  110,
                  115,
                  119,
                  101,
                  114,
                  95,
                  118,
                  111,
                  116,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "questKey"
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "clock",
          "address": "SysvarC1ock11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "questKey",
          "type": "u64"
        },
        {
          "name": "answerKeys",
          "type": {
            "vec": "u64"
          }
        }
      ]
    },
    {
      "name": "setDecisionEndTime",
      "discriminator": [
        62,
        93,
        74,
        75,
        191,
        60,
        231,
        143
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "governanceItem",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  105,
                  116,
                  101,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "questKey"
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "clock",
          "address": "SysvarC1ock11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "questKey",
          "type": "u64"
        },
        {
          "name": "newEndTime",
          "type": "i64"
        }
      ]
    },
    {
      "name": "setMaxVotesPerVoter",
      "discriminator": [
        74,
        134,
        132,
        165,
        223,
        28,
        191,
        188
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "maxVotes",
          "type": "u8"
        }
      ]
    },
    {
      "name": "setMinimumRequiredNfts",
      "discriminator": [
        236,
        213,
        139,
        244,
        237,
        187,
        237,
        118
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "newMinimum",
          "type": "u8"
        }
      ]
    },
    {
      "name": "setProposalResult",
      "discriminator": [
        244,
        140,
        205,
        100,
        218,
        122,
        170,
        101
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "governance",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "proposal",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  112,
                  111,
                  115,
                  97,
                  108
                ]
              },
              {
                "kind": "arg",
                "path": "proposalKey"
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "clock",
          "address": "SysvarC1ock11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "proposalKey",
          "type": "u64"
        },
        {
          "name": "result",
          "type": {
            "defined": {
              "name": "proposalResult"
            }
          }
        },
        {
          "name": "resultVote",
          "type": "u16"
        }
      ]
    },
    {
      "name": "setQuestDurationHours",
      "discriminator": [
        114,
        98,
        183,
        87,
        147,
        43,
        6,
        6
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "hours",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setQuestEndTime",
      "discriminator": [
        59,
        111,
        136,
        85,
        66,
        188,
        91,
        85
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "governanceItem",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  105,
                  116,
                  101,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "questKey"
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "clock",
          "address": "SysvarC1ock11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "questKey",
          "type": "u64"
        },
        {
          "name": "newEndTime",
          "type": "i64"
        }
      ]
    },
    {
      "name": "setQuestResult",
      "discriminator": [
        65,
        247,
        77,
        188,
        157,
        240,
        72,
        151
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "governanceItem",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  105,
                  116,
                  101,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "questKey"
              }
            ]
          }
        },
        {
          "name": "questVote",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  113,
                  117,
                  101,
                  115,
                  116,
                  95,
                  118,
                  111,
                  116,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "questKey"
              }
            ]
          }
        },
        {
          "name": "governance",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "clock",
          "address": "SysvarC1ock11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "questKey",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setRewardAmount",
      "discriminator": [
        163,
        135,
        106,
        255,
        240,
        184,
        184,
        92
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "rewardAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setTotalVote",
      "discriminator": [
        134,
        18,
        127,
        69,
        22,
        132,
        70,
        112
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "minOrMax",
          "type": "string"
        },
        {
          "name": "totalVote",
          "type": "u64"
        }
      ]
    },
    {
      "name": "startDecision",
      "discriminator": [
        58,
        116,
        43,
        132,
        225,
        124,
        30,
        9
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "governanceItem",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  105,
                  116,
                  101,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "questKey"
              }
            ]
          }
        },
        {
          "name": "decisionVote",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  99,
                  105,
                  115,
                  105,
                  111,
                  110,
                  95,
                  118,
                  111,
                  116,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "questKey"
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "clock",
          "address": "SysvarC1ock11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "questKey",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateBaseTokenMint",
      "discriminator": [
        76,
        225,
        16,
        129,
        124,
        154,
        75,
        117
      ],
      "accounts": [
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "config"
          ]
        },
        {
          "name": "newBaseTokenMint",
          "docs": [
            "New base token mint"
          ]
        },
        {
          "name": "treasuryPda",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "newTreasuryTokenAccount",
          "docs": [
            "New treasury token account for the new mint",
            "This creates a separate token account for each token mint"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121
                ]
              },
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "newBaseTokenMint"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "updateVoterCheckpoint",
      "discriminator": [
        254,
        228,
        69,
        157,
        5,
        59,
        50,
        27
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "governance",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "voter",
          "writable": true,
          "signer": true
        },
        {
          "name": "voterCheckpoints",
          "docs": [
            "Voter's checkpoint history",
            "Stores historical voting power at different slots"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  111,
                  116,
                  101,
                  114,
                  95,
                  99,
                  104,
                  101,
                  99,
                  107,
                  112,
                  111,
                  105,
                  110,
                  116,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "voter"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "docs": [
            "Remaining accounts should be pairs of [NFT token account, NFT metadata account] from the governance collection"
          ],
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "clock",
          "address": "SysvarC1ock11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "voteAnswer",
      "discriminator": [
        222,
        220,
        255,
        139,
        204,
        94,
        144,
        28
      ],
      "accounts": [
        {
          "name": "governance",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101
                ]
              }
            ]
          }
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "voter",
          "writable": true,
          "signer": true
        },
        {
          "name": "governanceItem",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  105,
                  116,
                  101,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "questKey"
              }
            ]
          }
        },
        {
          "name": "answerVote",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  110,
                  115,
                  119,
                  101,
                  114,
                  95,
                  118,
                  111,
                  116,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "questKey"
              }
            ]
          }
        },
        {
          "name": "answerOption",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  110,
                  115,
                  119,
                  101,
                  114,
                  95,
                  111,
                  112,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "arg",
                "path": "questKey"
              },
              {
                "kind": "arg",
                "path": "answerKey"
              }
            ]
          }
        },
        {
          "name": "answerVoterRecord",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  110,
                  115,
                  119,
                  101,
                  114,
                  95,
                  118,
                  111,
                  116,
                  101,
                  114
                ]
              },
              {
                "kind": "arg",
                "path": "questKey"
              },
              {
                "kind": "account",
                "path": "voter"
              }
            ]
          }
        },
        {
          "name": "voterCheckpoints",
          "docs": [
            "Voter's checkpoint history - stores voting power at different slots",
            "Similar to OpenZeppelin's Votes.sol checkpoint system"
          ],
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  111,
                  116,
                  101,
                  114,
                  95,
                  99,
                  104,
                  101,
                  99,
                  107,
                  112,
                  111,
                  105,
                  110,
                  116,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "voter"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "questKey",
          "type": "u64"
        },
        {
          "name": "answerKey",
          "type": "u64"
        }
      ]
    },
    {
      "name": "voteDecision",
      "discriminator": [
        141,
        81,
        199,
        176,
        1,
        217,
        197,
        36
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "governanceItem",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  105,
                  116,
                  101,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "questKey"
              }
            ]
          }
        },
        {
          "name": "decisionVote",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  99,
                  105,
                  115,
                  105,
                  111,
                  110,
                  95,
                  118,
                  111,
                  116,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "questKey"
              }
            ]
          }
        },
        {
          "name": "voterRecord",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  99,
                  105,
                  115,
                  105,
                  111,
                  110,
                  95,
                  118,
                  111,
                  116,
                  101,
                  114
                ]
              },
              {
                "kind": "arg",
                "path": "questKey"
              },
              {
                "kind": "account",
                "path": "voter"
              }
            ]
          }
        },
        {
          "name": "questVoterRecord",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  113,
                  117,
                  101,
                  115,
                  116,
                  95,
                  118,
                  111,
                  116,
                  101,
                  114
                ]
              },
              {
                "kind": "arg",
                "path": "questKey"
              },
              {
                "kind": "account",
                "path": "voter"
              }
            ]
          }
        },
        {
          "name": "voter",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "clock",
          "address": "SysvarC1ock11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "questKey",
          "type": "u64"
        },
        {
          "name": "voteChoice",
          "type": {
            "defined": {
              "name": "decisionVoteChoice"
            }
          }
        }
      ]
    },
    {
      "name": "voteQuest",
      "discriminator": [
        13,
        14,
        24,
        144,
        241,
        226,
        83,
        130
      ],
      "accounts": [
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "governanceItem",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  105,
                  116,
                  101,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "questKey"
              }
            ]
          }
        },
        {
          "name": "questVote",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  113,
                  117,
                  101,
                  115,
                  116,
                  95,
                  118,
                  111,
                  116,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "questKey"
              }
            ]
          }
        },
        {
          "name": "voterRecord",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  113,
                  117,
                  101,
                  115,
                  116,
                  95,
                  118,
                  111,
                  116,
                  101,
                  114
                ]
              },
              {
                "kind": "arg",
                "path": "questKey"
              },
              {
                "kind": "account",
                "path": "voter"
              }
            ]
          }
        },
        {
          "name": "voter",
          "writable": true,
          "signer": true
        },
        {
          "name": "voterCheckpoints",
          "docs": [
            "Voter's checkpoint history - stores voting power at different slots",
            "If not initialized, voter will have 0 voting power"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  111,
                  116,
                  101,
                  114,
                  95,
                  99,
                  104,
                  101,
                  99,
                  107,
                  112,
                  111,
                  105,
                  110,
                  116,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "voter"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "clock",
          "address": "SysvarC1ock11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "questKey",
          "type": "u64"
        },
        {
          "name": "voteChoice",
          "type": {
            "defined": {
              "name": "questVoteChoice"
            }
          }
        }
      ]
    },
    {
      "name": "withdrawTokens",
      "discriminator": [
        2,
        4,
        225,
        61,
        19,
        182,
        106,
        170
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  111,
                  118,
                  101,
                  114,
                  110,
                  97,
                  110,
                  99,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "treasuryPda",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "treasuryTokenAccount",
          "docs": [
            "Treasury token account holding the tokens"
          ],
          "writable": true
        },
        {
          "name": "destinationTokenAccount",
          "docs": [
            "Destination token account to receive withdrawn tokens"
          ],
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "answerOption",
      "discriminator": [
        196,
        35,
        157,
        240,
        44,
        198,
        28,
        243
      ]
    },
    {
      "name": "answerVote",
      "discriminator": [
        175,
        44,
        119,
        161,
        84,
        77,
        217,
        88
      ]
    },
    {
      "name": "answerVoterRecord",
      "discriminator": [
        103,
        47,
        246,
        49,
        18,
        77,
        101,
        158
      ]
    },
    {
      "name": "decisionVote",
      "discriminator": [
        214,
        38,
        107,
        156,
        176,
        194,
        4,
        136
      ]
    },
    {
      "name": "decisionVoterRecord",
      "discriminator": [
        51,
        94,
        120,
        232,
        39,
        192,
        232,
        48
      ]
    },
    {
      "name": "governance",
      "discriminator": [
        18,
        143,
        88,
        13,
        73,
        217,
        47,
        49
      ]
    },
    {
      "name": "governanceConfig",
      "discriminator": [
        81,
        63,
        124,
        107,
        210,
        100,
        145,
        70
      ]
    },
    {
      "name": "governanceItem",
      "discriminator": [
        179,
        52,
        33,
        225,
        212,
        45,
        211,
        154
      ]
    },
    {
      "name": "proposal",
      "discriminator": [
        26,
        94,
        189,
        187,
        116,
        136,
        53,
        33
      ]
    },
    {
      "name": "questVote",
      "discriminator": [
        102,
        5,
        65,
        206,
        17,
        132,
        196,
        105
      ]
    },
    {
      "name": "questVoterRecord",
      "discriminator": [
        166,
        161,
        4,
        27,
        201,
        98,
        176,
        61
      ]
    },
    {
      "name": "voterCheckpoints",
      "discriminator": [
        52,
        90,
        186,
        11,
        84,
        190,
        115,
        129
      ]
    }
  ],
  "events": [
    {
      "name": "answerEndTimeUpdated",
      "discriminator": [
        80,
        191,
        238,
        73,
        16,
        207,
        152,
        188
      ]
    },
    {
      "name": "answerFinalized",
      "discriminator": [
        37,
        15,
        210,
        129,
        101,
        243,
        40,
        192
      ]
    },
    {
      "name": "answerStarted",
      "discriminator": [
        43,
        51,
        254,
        40,
        4,
        223,
        118,
        241
      ]
    },
    {
      "name": "checkpointUpdated",
      "discriminator": [
        143,
        94,
        126,
        114,
        142,
        212,
        54,
        152
      ]
    },
    {
      "name": "collectionCreated",
      "discriminator": [
        69,
        167,
        76,
        142,
        182,
        183,
        233,
        139
      ]
    },
    {
      "name": "decisionCancelled",
      "discriminator": [
        136,
        245,
        7,
        102,
        105,
        149,
        242,
        149
      ]
    },
    {
      "name": "decisionEndTimeUpdated",
      "discriminator": [
        9,
        168,
        129,
        7,
        38,
        187,
        228,
        131
      ]
    },
    {
      "name": "decisionResultMade",
      "discriminator": [
        221,
        166,
        243,
        124,
        179,
        108,
        218,
        191
      ]
    },
    {
      "name": "decisionResultSet",
      "discriminator": [
        67,
        106,
        68,
        255,
        67,
        110,
        128,
        18
      ]
    },
    {
      "name": "decisionStarted",
      "discriminator": [
        223,
        238,
        44,
        3,
        128,
        144,
        211,
        109
      ]
    },
    {
      "name": "governanceItemCreated",
      "discriminator": [
        218,
        210,
        133,
        156,
        17,
        215,
        207,
        130
      ]
    },
    {
      "name": "governanceNftMinted",
      "discriminator": [
        103,
        11,
        11,
        240,
        80,
        68,
        239,
        9
      ]
    },
    {
      "name": "governancePaused",
      "discriminator": [
        129,
        71,
        164,
        74,
        29,
        52,
        170,
        192
      ]
    },
    {
      "name": "governanceUnpaused",
      "discriminator": [
        190,
        55,
        213,
        134,
        65,
        122,
        16,
        104
      ]
    },
    {
      "name": "maxTotalVoteUpdated",
      "discriminator": [
        238,
        159,
        149,
        197,
        183,
        203,
        60,
        105
      ]
    },
    {
      "name": "maxVotesUpdated",
      "discriminator": [
        150,
        221,
        215,
        121,
        166,
        80,
        106,
        231
      ]
    },
    {
      "name": "minTotalVoteUpdated",
      "discriminator": [
        13,
        100,
        147,
        163,
        249,
        45,
        149,
        162
      ]
    },
    {
      "name": "minimumNftsUpdated",
      "discriminator": [
        62,
        240,
        109,
        77,
        238,
        218,
        113,
        137
      ]
    },
    {
      "name": "proposalCreated",
      "discriminator": [
        186,
        8,
        160,
        108,
        81,
        13,
        51,
        206
      ]
    },
    {
      "name": "proposalResultSet",
      "discriminator": [
        47,
        45,
        43,
        22,
        206,
        184,
        251,
        111
      ]
    },
    {
      "name": "questCancelled",
      "discriminator": [
        180,
        76,
        82,
        192,
        51,
        17,
        186,
        11
      ]
    },
    {
      "name": "questDurationUpdated",
      "discriminator": [
        172,
        199,
        138,
        94,
        174,
        242,
        158,
        113
      ]
    },
    {
      "name": "questEndTimeUpdated",
      "discriminator": [
        220,
        51,
        74,
        235,
        54,
        192,
        239,
        115
      ]
    },
    {
      "name": "questResultMade",
      "discriminator": [
        54,
        19,
        105,
        214,
        4,
        243,
        220,
        162
      ]
    },
    {
      "name": "questResultSet",
      "discriminator": [
        71,
        255,
        83,
        11,
        84,
        160,
        244,
        204
      ]
    },
    {
      "name": "rewardAmountUpdated",
      "discriminator": [
        245,
        38,
        58,
        235,
        9,
        102,
        220,
        111
      ]
    },
    {
      "name": "rewardDistributed",
      "discriminator": [
        36,
        65,
        223,
        38,
        136,
        162,
        10,
        30
      ]
    },
    {
      "name": "voteDecisionCast",
      "discriminator": [
        132,
        104,
        219,
        241,
        172,
        133,
        115,
        127
      ]
    },
    {
      "name": "voteQuestCast",
      "discriminator": [
        142,
        97,
        106,
        89,
        49,
        143,
        71,
        133
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "governancePaused",
      "msg": "Governance is paused"
    },
    {
      "code": 6001,
      "name": "questionTooLong",
      "msg": "Question is too long (max 280 characters)"
    },
    {
      "code": 6002,
      "name": "questAlreadyFinalized",
      "msg": "Quest already finalized"
    },
    {
      "code": 6003,
      "name": "votingPeriodEnded",
      "msg": "Voting period has ended"
    },
    {
      "code": 6004,
      "name": "votingPeriodNotEnded",
      "msg": "Voting period has not ended yet"
    },
    {
      "code": 6005,
      "name": "invalidVoteChoice",
      "msg": "Invalid vote choice"
    },
    {
      "code": 6006,
      "name": "alreadyVoted",
      "msg": "Already voted"
    },
    {
      "code": 6007,
      "name": "insufficientVotes",
      "msg": "Insufficient votes to proceed"
    },
    {
      "code": 6008,
      "name": "alreadyFinalized",
      "msg": "Already finalized"
    },
    {
      "code": 6009,
      "name": "unauthorized",
      "msg": "unauthorized"
    },
    {
      "code": 6010,
      "name": "questNotApproved",
      "msg": "Quest not approved"
    },
    {
      "code": 6011,
      "name": "decisionAlreadyStarted",
      "msg": "Decision already started"
    },
    {
      "code": 6012,
      "name": "decisionAlreadyFinalized",
      "msg": "Decision already finalized"
    },
    {
      "code": 6013,
      "name": "answerAlreadyFinalized",
      "msg": "Answer already finalized"
    },
    {
      "code": 6014,
      "name": "invalidAnswerKey",
      "msg": "Invalid answer key"
    },
    {
      "code": 6015,
      "name": "notEligibleForReward",
      "msg": "Not eligible for reward"
    },
    {
      "code": 6016,
      "name": "rewardAlreadyClaimed",
      "msg": "Reward already claimed"
    },
    {
      "code": 6017,
      "name": "insufficientNfts",
      "msg": "Insufficient NFTs"
    },
    {
      "code": 6018,
      "name": "invalidParameter",
      "msg": "Invalid parameter"
    },
    {
      "code": 6019,
      "name": "invalidDuration",
      "msg": "Duration must be greater than 0"
    },
    {
      "code": 6020,
      "name": "invalidMaxVotes",
      "msg": "Max votes must be greater than 0"
    },
    {
      "code": 6021,
      "name": "invalidWithdrawAddress",
      "msg": "Cannot withdraw to zero address"
    },
    {
      "code": 6022,
      "name": "invalidWithdrawAmount",
      "msg": "Withdraw amount must be greater than 0"
    },
    {
      "code": 6023,
      "name": "insufficientBalance",
      "msg": "Insufficient balance"
    },
    {
      "code": 6024,
      "name": "transferFailed",
      "msg": "Transfer failed"
    },
    {
      "code": 6025,
      "name": "titleTooLong",
      "msg": "Title is too long (max 200 characters)"
    },
    {
      "code": 6026,
      "name": "titleEmpty",
      "msg": "Title cannot be empty"
    },
    {
      "code": 6027,
      "name": "resultTooLong",
      "msg": "Result is too long (max 500 characters)"
    },
    {
      "code": 6028,
      "name": "invalidMetadata",
      "msg": "Invalid metadata provided"
    },
    {
      "code": 6029,
      "name": "collectionAlreadyExists",
      "msg": "Collection already exists"
    },
    {
      "code": 6030,
      "name": "collectionNotCreated",
      "msg": "Collection not created yet"
    },
    {
      "code": 6031,
      "name": "answerResultEmpty",
      "msg": "Answer result is empty"
    },
    {
      "code": 6032,
      "name": "answerVoteNotFinalized",
      "msg": "Answer vote is not finalized"
    },
    {
      "code": 6033,
      "name": "voterDidNotVoteForWinningAnswer",
      "msg": "Voter did not vote for the winning answer"
    },
    {
      "code": 6034,
      "name": "voterHasNoVotes",
      "msg": "Voter has no votes"
    },
    {
      "code": 6035,
      "name": "voterAlreadyRewarded",
      "msg": "Voter has already been rewarded"
    },
    {
      "code": 6036,
      "name": "mathOverflow",
      "msg": "Math overflow occurred"
    },
    {
      "code": 6037,
      "name": "insufficientTreasuryBalance",
      "msg": "Insufficient treasury balance"
    },
    {
      "code": 6038,
      "name": "answerVotingNotStarted",
      "msg": "Answer voting has not started"
    },
    {
      "code": 6039,
      "name": "answerVoteFinalized",
      "msg": "Answer vote has already been finalized"
    },
    {
      "code": 6040,
      "name": "invalidAnswerKeys",
      "msg": "Invalid answer keys provided"
    },
    {
      "code": 6041,
      "name": "voteCountNotEqual",
      "msg": "Vote counts are not equal"
    },
    {
      "code": 6042,
      "name": "invalidPhase",
      "msg": "Invalid phase for this operation"
    },
    {
      "code": 6043,
      "name": "invalidNftOwner",
      "msg": "Invalid NFT owner"
    },
    {
      "code": 6044,
      "name": "invalidNftAmount",
      "msg": "Invalid NFT amount"
    },
    {
      "code": 6045,
      "name": "maxTotalVoteReached",
      "msg": "Maximum total vote limit reached"
    },
    {
      "code": 6046,
      "name": "insufficientVotingPower",
      "msg": "Insufficient voting power"
    },
    {
      "code": 6047,
      "name": "noQuestParticipation",
      "msg": "Must participate in quest voting to vote on decision"
    }
  ],
  "types": [
    {
      "name": "answerEndTimeUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "questKey",
            "type": "u64"
          },
          {
            "name": "oldEndTime",
            "type": "i64"
          },
          {
            "name": "newEndTime",
            "type": "i64"
          },
          {
            "name": "updatedBy",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "answerFinalized",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "questKey",
            "type": "u64"
          },
          {
            "name": "winningAnswer",
            "type": "u64"
          },
          {
            "name": "finalizedAt",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "answerOption",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "questKey",
            "type": "u64"
          },
          {
            "name": "answerKey",
            "type": "u64"
          },
          {
            "name": "totalVotes",
            "type": "u64"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "answerStarted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "questKey",
            "type": "u64"
          },
          {
            "name": "createdAt",
            "type": "u64"
          },
          {
            "name": "endAt",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "answerVote",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "questKey",
            "type": "u64"
          },
          {
            "name": "totalVoted",
            "type": "u64"
          },
          {
            "name": "finalized",
            "type": "bool"
          },
          {
            "name": "winningAnswer",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "answerVoterRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "questKey",
            "type": "u64"
          },
          {
            "name": "voter",
            "type": "pubkey"
          },
          {
            "name": "answerKey",
            "type": "u64"
          },
          {
            "name": "voteCount",
            "type": "u8"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "rewarded",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "checkpoint",
      "docs": [
        "Individual checkpoint recording voting power at a specific slot"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "slot",
            "type": "u64"
          },
          {
            "name": "nftCount",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "checkpointUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "voter",
            "type": "pubkey"
          },
          {
            "name": "slot",
            "type": "u64"
          },
          {
            "name": "nftCount",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "collectionCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "collectionMint",
            "type": "pubkey"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "createdAt",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "decisionCancelled",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "questKey",
            "type": "u64"
          },
          {
            "name": "cancelledBy",
            "type": "pubkey"
          },
          {
            "name": "totalVotesAtCancellation",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "decisionEndTimeUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "questKey",
            "type": "u64"
          },
          {
            "name": "oldEndTime",
            "type": "i64"
          },
          {
            "name": "newEndTime",
            "type": "i64"
          },
          {
            "name": "updatedBy",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "decisionResult",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "pending"
          },
          {
            "name": "success"
          },
          {
            "name": "adjourn"
          }
        ]
      }
    },
    {
      "name": "decisionResultMade",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "questKey",
            "type": "u64"
          },
          {
            "name": "result",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "decisionResultSet",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "questKey",
            "type": "u64"
          },
          {
            "name": "result",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "decisionStarted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "questKey",
            "type": "u64"
          },
          {
            "name": "createdAt",
            "type": "u64"
          },
          {
            "name": "endAt",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "decisionVote",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "questKey",
            "type": "u64"
          },
          {
            "name": "countSuccess",
            "type": "u64"
          },
          {
            "name": "countAdjourn",
            "type": "u64"
          },
          {
            "name": "totalVoted",
            "type": "u64"
          },
          {
            "name": "finalized",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "decisionVoteChoice",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "success"
          },
          {
            "name": "adjourn"
          }
        ]
      }
    },
    {
      "name": "decisionVoterRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "questKey",
            "type": "u64"
          },
          {
            "name": "voter",
            "type": "pubkey"
          },
          {
            "name": "voteChoice",
            "type": {
              "defined": {
                "name": "decisionVoteChoice"
              }
            }
          },
          {
            "name": "votes",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "governance",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "config",
            "type": "pubkey"
          },
          {
            "name": "totalItems",
            "type": "u64"
          },
          {
            "name": "activeItems",
            "type": "u64"
          },
          {
            "name": "completedItems",
            "type": "u64"
          },
          {
            "name": "totalRewardsDistributed",
            "type": "u64"
          },
          {
            "name": "totalNftsMinted",
            "type": "u64"
          },
          {
            "name": "collectionMint",
            "type": "pubkey"
          },
          {
            "name": "collectionCreatedAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "governanceConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "baseTokenMint",
            "type": "pubkey"
          },
          {
            "name": "baseNftCollection",
            "type": "pubkey"
          },
          {
            "name": "treasuryBump",
            "type": "u8"
          },
          {
            "name": "paused",
            "type": "bool"
          },
          {
            "name": "minTotalVote",
            "type": "u64"
          },
          {
            "name": "maxTotalVote",
            "type": "u64"
          },
          {
            "name": "minRequiredNft",
            "type": "u8"
          },
          {
            "name": "maxVotableNft",
            "type": "u8"
          },
          {
            "name": "durationHours",
            "type": "u64"
          },
          {
            "name": "constantRewardToken",
            "type": "u64"
          },
          {
            "name": "totalGovernance",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "governanceItem",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "questKey",
            "type": "u64"
          },
          {
            "name": "question",
            "type": "string"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "questResult",
            "type": {
              "defined": {
                "name": "questResult"
              }
            }
          },
          {
            "name": "decisionResult",
            "type": {
              "defined": {
                "name": "decisionResult"
              }
            }
          },
          {
            "name": "answerResult",
            "type": "u64"
          },
          {
            "name": "startSlot",
            "type": "u64"
          },
          {
            "name": "questStartTime",
            "type": "i64"
          },
          {
            "name": "questEndTime",
            "type": "i64"
          },
          {
            "name": "decisionStartTime",
            "type": "i64"
          },
          {
            "name": "decisionEndTime",
            "type": "i64"
          },
          {
            "name": "answerStartTime",
            "type": "i64"
          },
          {
            "name": "answerEndTime",
            "type": "i64"
          },
          {
            "name": "answerKeys",
            "type": {
              "vec": "u64"
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "governanceItemCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "questKey",
            "type": "u64"
          },
          {
            "name": "question",
            "type": "string"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "createdAt",
            "type": "u64"
          },
          {
            "name": "endAt",
            "type": "u64"
          },
          {
            "name": "startSlot",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "governanceNftMinted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "mintedAt",
            "type": "u64"
          },
          {
            "name": "nftNumber",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "governancePaused",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pausedBy",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "governanceUnpaused",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "unpausedBy",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "maxTotalVoteUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "oldMax",
            "type": "u64"
          },
          {
            "name": "newMax",
            "type": "u64"
          },
          {
            "name": "updatedBy",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "maxVotesUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "oldMax",
            "type": "u8"
          },
          {
            "name": "newMax",
            "type": "u8"
          },
          {
            "name": "updatedBy",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "minTotalVoteUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "oldMin",
            "type": "u64"
          },
          {
            "name": "newMin",
            "type": "u64"
          },
          {
            "name": "updatedBy",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "minimumNftsUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "oldMinimum",
            "type": "u8"
          },
          {
            "name": "newMinimum",
            "type": "u8"
          },
          {
            "name": "updatedBy",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "proposal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "proposalKey",
            "type": "u64"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "result",
            "type": {
              "defined": {
                "name": "proposalResult"
              }
            }
          },
          {
            "name": "totalVote",
            "type": "u16"
          },
          {
            "name": "resultVote",
            "type": "u16"
          },
          {
            "name": "endTime",
            "type": "i64"
          },
          {
            "name": "startBlock",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "proposalCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "proposalKey",
            "type": "u64"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "endTime",
            "type": "i64"
          },
          {
            "name": "startBlock",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "proposalResult",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "pending"
          },
          {
            "name": "yes"
          },
          {
            "name": "no"
          }
        ]
      }
    },
    {
      "name": "proposalResultSet",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "proposalKey",
            "type": "u64"
          },
          {
            "name": "result",
            "type": {
              "defined": {
                "name": "proposalResult"
              }
            }
          },
          {
            "name": "resultVote",
            "type": "u16"
          },
          {
            "name": "totalVote",
            "type": "u16"
          },
          {
            "name": "finalizedAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "questCancelled",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "questKey",
            "type": "u64"
          },
          {
            "name": "totalVoted",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "questDurationUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "oldDuration",
            "type": "u64"
          },
          {
            "name": "newDuration",
            "type": "u64"
          },
          {
            "name": "updatedBy",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "questEndTimeUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "questKey",
            "type": "u64"
          },
          {
            "name": "oldEndTime",
            "type": "i64"
          },
          {
            "name": "newEndTime",
            "type": "i64"
          },
          {
            "name": "updatedBy",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "questResult",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "pending"
          },
          {
            "name": "approved"
          },
          {
            "name": "rejected"
          }
        ]
      }
    },
    {
      "name": "questResultMade",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "questKey",
            "type": "u64"
          },
          {
            "name": "result",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "questResultSet",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "questKey",
            "type": "u64"
          },
          {
            "name": "result",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "questVote",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "questKey",
            "type": "u64"
          },
          {
            "name": "countApprover",
            "type": "u64"
          },
          {
            "name": "countRejector",
            "type": "u64"
          },
          {
            "name": "totalVoted",
            "type": "u64"
          },
          {
            "name": "finalized",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "questVoteChoice",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "approve"
          },
          {
            "name": "reject"
          }
        ]
      }
    },
    {
      "name": "questVoterRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "questKey",
            "type": "u64"
          },
          {
            "name": "voter",
            "type": "pubkey"
          },
          {
            "name": "voteCount",
            "type": "u8"
          },
          {
            "name": "voteChoice",
            "type": {
              "defined": {
                "name": "questVoteChoice"
              }
            }
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "rewardAmountUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "oldAmount",
            "type": "u64"
          },
          {
            "name": "newAmount",
            "type": "u64"
          },
          {
            "name": "updatedBy",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "rewardDistributed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "questKey",
            "type": "u64"
          },
          {
            "name": "voter",
            "type": "pubkey"
          },
          {
            "name": "answerKey",
            "type": "u64"
          },
          {
            "name": "voteCount",
            "type": "u64"
          },
          {
            "name": "rewardAmount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "voteDecisionCast",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "questKey",
            "type": "u64"
          },
          {
            "name": "voteChoice",
            "type": {
              "defined": {
                "name": "decisionVoteChoice"
              }
            }
          },
          {
            "name": "voter",
            "type": "pubkey"
          },
          {
            "name": "votes",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "voteQuestCast",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "questKey",
            "type": "u64"
          },
          {
            "name": "voteChoice",
            "type": {
              "defined": {
                "name": "questVoteChoice"
              }
            }
          },
          {
            "name": "voter",
            "type": "pubkey"
          },
          {
            "name": "votes",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "voterCheckpoints",
      "docs": [
        "Stores historical checkpoints for a voter",
        "Similar to OpenZeppelin's Votes.sol checkpoint system"
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "voter",
            "type": "pubkey"
          },
          {
            "name": "checkpoints",
            "type": {
              "vec": {
                "defined": {
                  "name": "checkpoint"
                }
              }
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
