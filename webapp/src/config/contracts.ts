import type { Address } from "viem";

const defaultAddress = "0x0000000000000000000000000000000000000000";
const envAddress = import.meta.env.VITE_BELIEF_MARKET_ADDRESS;

if (!envAddress || envAddress === defaultAddress) {
  console.warn(
    "[BeliefMarket] Contract address missing. Set VITE_BELIEF_MARKET_ADDRESS in your .env file."
  );
}

export const BELIEF_MARKET_ADDRESS: Address = (
  envAddress || defaultAddress
) as Address;

export const BELIEF_MARKET_ABI = [
  {
    type: "function",
    name: "MIN_VOTE_STAKE",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "MIN_DURATION",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "MAX_DURATION",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "getReplicaBetIds",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string[]" }]
  },
  {
    type: "function",
    name: "getReplicaBet",
    stateMutability: "view",
    inputs: [{ name: "marketId", type: "string" }],
    outputs: [
      { name: "title", type: "string" },
      { name: "description", type: "string" },
      { name: "creator", type: "address" },
      { name: "platformStake", type: "uint256" },
      { name: "voteStake", type: "uint256" },
      { name: "expiryTime", type: "uint256" },
      { name: "isResolved", type: "bool" },
      { name: "revealedYes", type: "uint64" },
      { name: "revealedNo", type: "uint64" },
      { name: "prizePool", type: "uint256" },
      { name: "yesWon", type: "bool" },
      { name: "revealPending", type: "bool" }
    ]
  },
  {
    type: "function",
    name: "getReplicaRevealStatus",
    stateMutability: "view",
    inputs: [{ name: "marketId", type: "string" }],
    outputs: [
      { name: "isResolved", type: "bool" },
      { name: "pending", type: "bool" },
      { name: "revealedYes", type: "uint64" },
      { name: "revealedNo", type: "uint64" },
      { name: "decryptionRequestId", type: "uint256" }
    ]
  },
  {
    type: "function",
    name: "getReplicaDecryptionRequestId",
    stateMutability: "pure",
    inputs: [{ name: "marketId", type: "string" }],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "hasReplicaUserVoted",
    stateMutability: "view",
    inputs: [
      { name: "marketId", type: "string" },
      { name: "user", type: "address" }
    ],
    outputs: [{ name: "", type: "bool" }]
  },
  {
    type: "function",
    name: "hasReplicaUserClaimed",
    stateMutability: "view",
    inputs: [
      { name: "marketId", type: "string" },
      { name: "user", type: "address" }
    ],
    outputs: [{ name: "", type: "bool" }]
  },
  {
    type: "function",
    name: "getReplicaUserVoteType",
    stateMutability: "view",
    inputs: [
      { name: "marketId", type: "string" },
      { name: "user", type: "address" }
    ],
    outputs: [
      { name: "exists", type: "bool" },
      { name: "voteType", type: "uint8" },
      { name: "claimed", type: "bool" }
    ]
  },
  {
    type: "function",
    name: "createReplicaBet",
    stateMutability: "nonpayable",
    inputs: [
      { name: "marketId", type: "string" },
      { name: "title", type: "string" },
      { name: "description", type: "string" },
      { name: "voteStake", type: "uint256" },
      { name: "duration", type: "uint256" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "castReplicaVote",
    stateMutability: "payable",
    inputs: [
      { name: "marketId", type: "string" },
      { name: "voteType", type: "uint8" },
      { name: "encryptedWeight", type: "bytes32" },
      { name: "inputProof", type: "bytes" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "authorizeReplicaReveal",
    stateMutability: "nonpayable",
    inputs: [{ name: "marketId", type: "string" }],
    outputs: []
  },
  {
    type: "function",
    name: "submitReplicaTally",
    stateMutability: "nonpayable",
    inputs: [
      { name: "marketId", type: "string" },
      { name: "cleartexts", type: "bytes" },
      { name: "decryptionProof", type: "bytes" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "getReplicaDecryptHandles",
    stateMutability: "view",
    inputs: [{ name: "marketId", type: "string" }],
    outputs: [
      { name: "yesHandle", type: "bytes32" },
      { name: "noHandle", type: "bytes32" },
      { name: "pending", type: "bool" }
    ]
  },
  {
    type: "function",
    name: "cancelReplicaBet",
    stateMutability: "nonpayable",
    inputs: [{ name: "marketId", type: "string" }],
    outputs: []
  },
  {
    type: "function",
    name: "claimReplicaPrize",
    stateMutability: "nonpayable",
    inputs: [{ name: "marketId", type: "string" }],
    outputs: []
  },
  {
    type: "function",
    name: "claimReplicaRefund",
    stateMutability: "nonpayable",
    inputs: [{ name: "marketId", type: "string" }],
    outputs: []
  }
] as const;
