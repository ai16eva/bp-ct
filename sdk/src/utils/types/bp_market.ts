/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/bp_market.json`.
 */
export type BpMarket = {
  "address": "754huLjoBYmYqozy5hVd7hrxCvZAQByatXi6qLWEUVUS",
  "metadata": {
    "name": "bpMarket",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "adjournMarket",
      "discriminator": [
        122,
        223,
        248,
        29,
        26,
        4,
        248,
        39
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "configAccount",
          "writable": true
        },
        {
          "name": "marketAccount",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "bet",
      "discriminator": [
        94,
        203,
        166,
        126,
        20,
        243,
        169,
        82
      ],
      "accounts": [
        {
          "name": "voter",
          "writable": true,
          "signer": true
        },
        {
          "name": "configAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
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
          "name": "marketAccount",
          "docs": [
            "Market account - moved before bet_mint so we can reference betting_token in constraint"
          ],
          "writable": true
        },
        {
          "name": "betMint",
          "docs": [
            "Token mint - now validates against market's betting_token instead of global base_token"
          ],
          "writable": true
        },
        {
          "name": "userTokenAccount",
          "writable": true
        },
        {
          "name": "vaultTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "marketAccount"
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
                "path": "betMint"
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
          "name": "answerAccount",
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
                  114
                ]
              },
              {
                "kind": "account",
                "path": "market_account.market_key",
                "account": "marketAccount"
              }
            ]
          }
        },
        {
          "name": "betAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  101,
                  116,
                  116,
                  105,
                  110,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "voter"
              },
              {
                "kind": "account",
                "path": "market_account.market_key",
                "account": "marketAccount"
              },
              {
                "kind": "arg",
                "path": "answerKey"
              }
            ]
          }
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
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "answerKey",
          "type": "u64"
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "finishMarket",
      "discriminator": [
        200,
        216,
        58,
        2,
        224,
        204,
        151,
        26
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "configAccount",
          "writable": true
        },
        {
          "name": "marketAccount",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
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
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "configAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
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
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "baseToken",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "lockUser",
      "discriminator": [
        118,
        19,
        22,
        44,
        105,
        116,
        16,
        42
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "configAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
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
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "userToLock",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "publishMarket",
      "discriminator": [
        145,
        24,
        249,
        5,
        188,
        66,
        211,
        38
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "configAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
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
          "name": "marketAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  97,
                  114,
                  107,
                  101,
                  116
                ]
              },
              {
                "kind": "arg",
                "path": "marketKey"
              }
            ]
          }
        },
        {
          "name": "answerAccount",
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
                  114
                ]
              },
              {
                "kind": "arg",
                "path": "marketKey"
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
          "name": "marketKey",
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
          "name": "bettingToken",
          "type": "pubkey"
        },
        {
          "name": "createFee",
          "type": "u64"
        },
        {
          "name": "creatorFeePercentage",
          "type": "u64"
        },
        {
          "name": "serviceFeePercentage",
          "type": "u64"
        },
        {
          "name": "charityFeePercentage",
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
      "name": "receiveToken",
      "discriminator": [
        185,
        164,
        173,
        232,
        195,
        71,
        72,
        205
      ],
      "accounts": [
        {
          "name": "voter",
          "writable": true,
          "signer": true
        },
        {
          "name": "configAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
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
          "name": "marketAccount",
          "docs": [
            "Market account - moved before bet_mint so we can reference betting_token in constraint"
          ],
          "writable": true
        },
        {
          "name": "betMint",
          "docs": [
            "Token mint - now validates against market's betting_token instead of global base_token"
          ],
          "writable": true
        },
        {
          "name": "userBetTokenAccount",
          "writable": true
        },
        {
          "name": "vaultBetTokenAccount",
          "writable": true
        },
        {
          "name": "betAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  101,
                  116,
                  116,
                  105,
                  110,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "voter"
              },
              {
                "kind": "account",
                "path": "market_account.market_key",
                "account": "marketAccount"
              },
              {
                "kind": "account",
                "path": "bet_account.answer_key",
                "account": "bettingAccount"
              }
            ]
          }
        },
        {
          "name": "answerAccount",
          "writable": true
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
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "retrieveTokens",
      "discriminator": [
        208,
        194,
        68,
        55,
        183,
        22,
        93,
        135
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "configAccount",
          "writable": true
        },
        {
          "name": "vaultTokenAccount",
          "writable": true
        },
        {
          "name": "remainsTokenAccount",
          "writable": true
        },
        {
          "name": "marketAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associateTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "setAccount",
      "discriminator": [
        100,
        58,
        16,
        200,
        83,
        84,
        162,
        203
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "configAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
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
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "accountType",
          "type": {
            "defined": {
              "name": "accountType"
            }
          }
        },
        {
          "name": "newAccount",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "setBaseToken",
      "discriminator": [
        51,
        119,
        37,
        180,
        190,
        169,
        5,
        96
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "configAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
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
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "newBaseToken",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "successMarket",
      "discriminator": [
        252,
        13,
        1,
        40,
        160,
        91,
        131,
        212
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "configAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
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
          "name": "marketAccount",
          "docs": [
            "Market account - moved before bet_mint so we can reference betting_token in constraint"
          ],
          "writable": true
        },
        {
          "name": "betMint",
          "docs": [
            "Token mint - now validates against market's betting_token instead of global base_token"
          ],
          "writable": true
        },
        {
          "name": "creatorTokenAccount",
          "writable": true
        },
        {
          "name": "cojamTokenAccount",
          "writable": true
        },
        {
          "name": "charityTokenAccount",
          "writable": true
        },
        {
          "name": "vaultTokenAccount",
          "writable": true
        },
        {
          "name": "answerAccount",
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
                  114
                ]
              },
              {
                "kind": "account",
                "path": "market_account.market_key",
                "account": "marketAccount"
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
          "name": "correctAnswerKey",
          "type": "u64"
        }
      ]
    },
    {
      "name": "unlockUser",
      "discriminator": [
        48,
        213,
        38,
        162,
        16,
        8,
        225,
        235
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "configAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
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
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "userToUnlock",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "updateOwner",
      "discriminator": [
        164,
        188,
        124,
        254,
        132,
        26,
        198,
        178
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "configAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
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
        }
      ],
      "args": [
        {
          "name": "newOwner",
          "type": "pubkey"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "answerAccount",
      "discriminator": [
        75,
        175,
        139,
        96,
        119,
        135,
        123,
        71
      ]
    },
    {
      "name": "bettingAccount",
      "discriminator": [
        128,
        101,
        147,
        11,
        71,
        96,
        22,
        160
      ]
    },
    {
      "name": "configAccount",
      "discriminator": [
        189,
        255,
        97,
        70,
        186,
        189,
        24,
        102
      ]
    },
    {
      "name": "marketAccount",
      "discriminator": [
        201,
        78,
        187,
        225,
        240,
        198,
        201,
        251
      ]
    }
  ],
  "events": [
    {
      "name": "accountUpdated",
      "discriminator": [
        120,
        129,
        219,
        252,
        61,
        244,
        114,
        88
      ]
    },
    {
      "name": "baseTokenUpdated",
      "discriminator": [
        196,
        124,
        8,
        215,
        57,
        246,
        106,
        27
      ]
    },
    {
      "name": "betPlaced",
      "discriminator": [
        88,
        88,
        145,
        226,
        126,
        206,
        32,
        0
      ]
    },
    {
      "name": "exchangePaused",
      "discriminator": [
        137,
        117,
        89,
        221,
        45,
        6,
        36,
        234
      ]
    },
    {
      "name": "exchangeUnpaused",
      "discriminator": [
        47,
        203,
        144,
        190,
        138,
        133,
        198,
        198
      ]
    },
    {
      "name": "feeUpdated",
      "discriminator": [
        228,
        75,
        43,
        103,
        9,
        196,
        182,
        4
      ]
    },
    {
      "name": "feesWithdrawn",
      "discriminator": [
        234,
        15,
        0,
        119,
        148,
        241,
        40,
        21
      ]
    },
    {
      "name": "marketAdjourned",
      "discriminator": [
        255,
        9,
        83,
        139,
        244,
        130,
        217,
        61
      ]
    },
    {
      "name": "marketFinished",
      "discriminator": [
        55,
        252,
        141,
        64,
        190,
        178,
        104,
        34
      ]
    },
    {
      "name": "marketPublished",
      "discriminator": [
        106,
        5,
        122,
        180,
        225,
        32,
        176,
        166
      ]
    },
    {
      "name": "marketSuccess",
      "discriminator": [
        28,
        146,
        105,
        87,
        226,
        249,
        99,
        105
      ]
    },
    {
      "name": "ownershipTransferred",
      "discriminator": [
        172,
        61,
        205,
        183,
        250,
        50,
        38,
        98
      ]
    },
    {
      "name": "tokenPaused",
      "discriminator": [
        126,
        54,
        76,
        161,
        125,
        151,
        148,
        59
      ]
    },
    {
      "name": "tokenReceived",
      "discriminator": [
        251,
        126,
        204,
        211,
        2,
        159,
        194,
        227
      ]
    },
    {
      "name": "tokenUnpaused",
      "discriminator": [
        225,
        17,
        68,
        81,
        129,
        134,
        145,
        169
      ]
    },
    {
      "name": "usdpBought",
      "discriminator": [
        203,
        83,
        218,
        0,
        242,
        36,
        198,
        13
      ]
    },
    {
      "name": "usdpSold",
      "discriminator": [
        206,
        75,
        44,
        126,
        21,
        49,
        253,
        29
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "alreadyInitialized",
      "msg": "The configuration account is already initialized."
    },
    {
      "code": 6001,
      "name": "unauthorized",
      "msg": "You are not authorized to perform this action."
    },
    {
      "code": 6002,
      "name": "mathOperationError",
      "msg": "Operation resulted in an error."
    },
    {
      "code": 6003,
      "name": "marketNotFinished",
      "msg": "Market/AdjournMarket: Market is not finished"
    },
    {
      "code": 6004,
      "name": "marketDoesExist",
      "msg": "Market/DraftMarket: Market key does exist"
    },
    {
      "code": 6005,
      "name": "marketNotApproved",
      "msg": "Market/Bet: Market is not approved"
    },
    {
      "code": 6006,
      "name": "maxAnswersReached",
      "msg": "The maximum number of answers has been reached."
    },
    {
      "code": 6007,
      "name": "answerAlreadyExists",
      "msg": "The answer key already exists."
    },
    {
      "code": 6008,
      "name": "answerNotExists",
      "msg": "The answer key does not exist."
    },
    {
      "code": 6009,
      "name": "marketDoesNotContainAnswerKey",
      "msg": "Market/SuccessMarket: Market does not contain answerKey"
    },
    {
      "code": 6010,
      "name": "cannotClaimToken",
      "msg": "Market/Receive: Cannot receive token"
    },
    {
      "code": 6011,
      "name": "cannotRetrieveToken",
      "msg": "Market/Retrieve: Cannot Retrieve not finished market"
    },
    {
      "code": 6012,
      "name": "cannotRetrieveBeforeDate",
      "msg": "Market/Retrieve: Cannot Retrieve before 180 days"
    },
    {
      "code": 6013,
      "name": "answerKeyNotRight",
      "msg": "Market/Receive: Answer key is not succeeded answer key"
    },
    {
      "code": 6014,
      "name": "invalidBetMint",
      "msg": "Market/Bet: Invalid bet mint"
    },
    {
      "code": 6015,
      "name": "invalidAnswerKey",
      "msg": "Market/ClaimToken: Invalid time range"
    },
    {
      "code": 6016,
      "name": "invalidTimeRange",
      "msg": "Market/ClaimToken: Invalid answer key"
    },
    {
      "code": 6017,
      "name": "overflow",
      "msg": "Operation Error: Overflow"
    },
    {
      "code": 6018,
      "name": "invalidRewardMint",
      "msg": "Invalid reward mint"
    },
    {
      "code": 6019,
      "name": "noAnswersProvided",
      "msg": "No answer keys provided"
    },
    {
      "code": 6020,
      "name": "userAlreadyLocked",
      "msg": "User is already locked"
    },
    {
      "code": 6021,
      "name": "userNotLocked",
      "msg": "User is not locked"
    },
    {
      "code": 6022,
      "name": "maxLockedUsersReached",
      "msg": "Maximum number of locked users has been reached"
    },
    {
      "code": 6023,
      "name": "marketNotResolved",
      "msg": "Market has not been resolved yet"
    },
    {
      "code": 6024,
      "name": "insufficientFunds",
      "msg": "Insufficient funds in the market"
    },
    {
      "code": 6025,
      "name": "invalidBetAmount",
      "msg": "Bet amount must be greater than zero"
    }
  ],
  "types": [
    {
      "name": "accountType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "cojamFee"
          },
          {
            "name": "charityFee"
          },
          {
            "name": "remain"
          }
        ]
      }
    },
    {
      "name": "accountUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "accountType",
            "type": {
              "defined": {
                "name": "accountType"
              }
            }
          },
          {
            "name": "oldAccount",
            "type": "pubkey"
          },
          {
            "name": "newAccount",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "answer",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "answerKey",
            "type": "u64"
          },
          {
            "name": "answerTotalTokens",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "answerAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "answers",
            "type": {
              "vec": {
                "defined": {
                  "name": "answer"
                }
              }
            }
          },
          {
            "name": "exist",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "baseTokenUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "oldToken",
            "type": "pubkey"
          },
          {
            "name": "newToken",
            "type": "pubkey"
          },
          {
            "name": "updatedBy",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "betPlaced",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "voter",
            "type": "pubkey"
          },
          {
            "name": "marketKey",
            "type": "pubkey"
          },
          {
            "name": "answerKey",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "bettingAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "marketKey",
            "type": "u64"
          },
          {
            "name": "answerKey",
            "type": "u64"
          },
          {
            "name": "voter",
            "type": "pubkey"
          },
          {
            "name": "tokens",
            "type": "u64"
          },
          {
            "name": "createTime",
            "type": "u64"
          },
          {
            "name": "exist",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "configAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "baseToken",
            "type": "pubkey"
          },
          {
            "name": "cojamFeeAccount",
            "type": "pubkey"
          },
          {
            "name": "charityFeeAccount",
            "type": "pubkey"
          },
          {
            "name": "remainAccount",
            "type": "pubkey"
          },
          {
            "name": "lockedUsers",
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "exchangePaused",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pausedBy",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "exchangeUnpaused",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "unpausedBy",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "feeUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "oldFeeBps",
            "type": "u16"
          },
          {
            "name": "newFeeBps",
            "type": "u16"
          },
          {
            "name": "updatedBy",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "feesWithdrawn",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "recipient",
            "type": "pubkey"
          },
          {
            "name": "usdtAmount",
            "type": "u64"
          },
          {
            "name": "usdpAmount",
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
      "name": "marketAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "marketKey",
            "type": "u64"
          },
          {
            "name": "bettingToken",
            "type": "pubkey"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "marketStatus"
              }
            }
          },
          {
            "name": "creatorFee",
            "type": "u64"
          },
          {
            "name": "creatorFeePercentage",
            "type": "u64"
          },
          {
            "name": "serviceFeePercentage",
            "type": "u64"
          },
          {
            "name": "charityFeePercentage",
            "type": "u64"
          },
          {
            "name": "approveTime",
            "type": "u64"
          },
          {
            "name": "finishTime",
            "type": "u64"
          },
          {
            "name": "adjournTime",
            "type": "u64"
          },
          {
            "name": "successTime",
            "type": "u64"
          },
          {
            "name": "correctAnswerKey",
            "type": "u64"
          },
          {
            "name": "marketTotalTokens",
            "type": "u64"
          },
          {
            "name": "marketRemainTokens",
            "type": "u64"
          },
          {
            "name": "marketRewardBaseTokens",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "marketAdjourned",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "marketKey",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "marketFinished",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "marketKey",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "marketPublished",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "marketKey",
            "type": "u64"
          },
          {
            "name": "bettingToken",
            "type": "pubkey"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "createFee",
            "type": "u64"
          },
          {
            "name": "creatorFeePercentage",
            "type": "u64"
          },
          {
            "name": "serviceFeePercentage",
            "type": "u64"
          },
          {
            "name": "charityFeePercentage",
            "type": "u64"
          },
          {
            "name": "answerKeys",
            "type": {
              "vec": "u64"
            }
          }
        ]
      }
    },
    {
      "name": "marketStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "draft"
          },
          {
            "name": "approve"
          },
          {
            "name": "finished"
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
      "name": "marketSuccess",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "marketKey",
            "type": "u64"
          },
          {
            "name": "answerKey",
            "type": "u64"
          },
          {
            "name": "creatorFee",
            "type": "u64"
          },
          {
            "name": "serviceFee",
            "type": "u64"
          },
          {
            "name": "marketRemainTokens",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "ownershipTransferred",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "previousOwner",
            "type": "pubkey"
          },
          {
            "name": "newOwner",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "tokenPaused",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pausedBy",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "tokenReceived",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "receiver",
            "type": "pubkey"
          },
          {
            "name": "marketKey",
            "type": "u64"
          },
          {
            "name": "bettingKey",
            "type": "u64"
          },
          {
            "name": "receivedTokens",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "tokenUnpaused",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "unpausedBy",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "usdpBought",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "buyer",
            "type": "pubkey"
          },
          {
            "name": "usdtAmount",
            "type": "u64"
          },
          {
            "name": "usdpAmount",
            "type": "u64"
          },
          {
            "name": "feeAmount",
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
      "name": "usdpSold",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "seller",
            "type": "pubkey"
          },
          {
            "name": "usdpAmount",
            "type": "u64"
          },
          {
            "name": "usdtAmount",
            "type": "u64"
          },
          {
            "name": "feeAmount",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    }
  ]
};
