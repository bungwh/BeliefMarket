import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toast } from "sonner";
import { BELIEF_MARKET_ADDRESS, BELIEF_MARKET_ABI } from "@/config/contracts";
import type { Address } from "viem";
import { useEffect } from "react";

const contractConfig = {
  address: BELIEF_MARKET_ADDRESS,
  abi: BELIEF_MARKET_ABI
} as const;

// Helper function to get Etherscan link
const getEtherscanLink = (hash: string) => {
  return `https://sepolia.etherscan.io/tx/${hash}`;
};

// ========= Read Hooks =========
export const useMinVoteStake = () =>
  useReadContract({
    ...contractConfig,
    functionName: "MIN_VOTE_STAKE"
  });

export const useMinDuration = () =>
  useReadContract({
    ...contractConfig,
    functionName: "MIN_DURATION"
  });

export const useMaxDuration = () =>
  useReadContract({
    ...contractConfig,
    functionName: "MAX_DURATION"
  });

export const useListBets = () =>
  useReadContract({
    ...contractConfig,
    functionName: "getReplicaBetIds"
  });

export const useGetBet = (betId?: string) => {
  const enabled = Boolean(betId);
  return useReadContract({
    ...contractConfig,
    functionName: "getReplicaBet",
    args: enabled ? [betId as string] : undefined,
    query: { enabled }
  });
};

export const useHasVoted = (betId?: string, user?: Address) => {
  const enabled = Boolean(betId && user);
  return useReadContract({
    ...contractConfig,
    functionName: "hasReplicaUserVoted",
    args: enabled ? [betId as string, user as Address] : undefined,
    query: { enabled }
  });
};

export const useHasClaimed = (betId?: string, user?: Address) => {
  const enabled = Boolean(betId && user);
  return useReadContract({
    ...contractConfig,
    functionName: "hasReplicaUserClaimed",
    args: enabled ? [betId as string, user as Address] : undefined,
    query: { enabled }
  });
};

export const useUserVoteInfo = (betId?: string, user?: Address) => {
  const enabled = Boolean(betId && user);
  return useReadContract({
    ...contractConfig,
    functionName: "getReplicaUserVoteType",
    args: enabled ? [betId as string, user as Address] : undefined,
    query: { enabled }
  });
};

export const useDecryptHandles = (betId?: string) => {
  const enabled = Boolean(betId);
  return useReadContract({
    ...contractConfig,
    functionName: "getReplicaDecryptHandles",
    args: enabled ? [betId as string] : undefined,
    query: { enabled }
  });
};

// ========= Write Helpers =========
const useTransaction = () => {
  const { writeContract, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, isError: isReceiptError } = useWaitForTransactionReceipt({ hash });

  // Show toast notification when transaction is confirmed or fails
  useEffect(() => {
    if (isSuccess && hash) {
      toast.success("Transaction Successful!", {
        description: "Click to view details",
        action: {
          label: "View",
          onClick: () => window.open(getEtherscanLink(hash), "_blank")
        },
        duration: 5000
      });
    }
  }, [isSuccess, hash]);

  useEffect(() => {
    if (isReceiptError && hash) {
      toast.error("Transaction Failed", {
        description: "Click to view details",
        action: {
          label: "View",
          onClick: () => window.open(getEtherscanLink(hash), "_blank")
        },
        duration: 5000
      });
    }
  }, [isReceiptError, hash]);

  useEffect(() => {
    if (error) {
      toast.error("Transaction Rejected", {
        description: error.message || "User rejected the transaction",
        duration: 5000
      });
    }
  }, [error]);

  return { writeContract, hash, error, isPending, isConfirming, isSuccess };
};

export const useCreateBet = () => {
  const tx = useTransaction();
  const createBet = async (
    betId: string,
    title: string,
    description: string,
    voteStake: bigint,
    duration: bigint
  ) => {
    try {
      tx.writeContract({
        ...contractConfig,
        functionName: "createReplicaBet",
        args: [betId, title, description, voteStake, duration]
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to create market");
      throw error;
    }
  };
  return { createBet, ...tx };
};

export const useCastVote = () => {
  const tx = useTransaction();
  const castVote = async (
    betId: string,
    voteType: number,
    voteStake: bigint,
    encryptedWeight: `0x${string}`,
    inputProof: `0x${string}`
  ) => {
    try {
      tx.writeContract({
        ...contractConfig,
        functionName: "castReplicaVote",
        args: [betId, voteType, encryptedWeight, inputProof],
        value: voteStake
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to cast vote");
      throw error;
    }
  };
  return { castVote, ...tx };
};

export const useAuthorizeReveal = () => {
  const tx = useTransaction();
  const requestReveal = async (betId: string) => {
    try {
      tx.writeContract({
        ...contractConfig,
        functionName: "authorizeReplicaReveal",
        args: [betId]
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to request reveal");
      throw error;
    }
  };
  return { requestReveal, ...tx };
};

export const useSubmitTally = () => {
  const tx = useTransaction();
  const submitTally = async (betId: string, cleartexts: `0x${string}`, proof: `0x${string}`) => {
    try {
      tx.writeContract({
        ...contractConfig,
        functionName: "submitReplicaTally",
        args: [betId, cleartexts, proof]
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit tally");
      throw error;
    }
  };
  return { submitTally, ...tx };
};

export const useClaimPrize = () => {
  const tx = useTransaction();
  const claimPrize = async (betId: string) => {
    try {
      tx.writeContract({
        ...contractConfig,
        functionName: "claimReplicaPrize",
        args: [betId]
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to claim prize");
      throw error;
    }
  };
  return { claimPrize, ...tx };
};

export const useClaimRefund = () => {
  const tx = useTransaction();
  const claimRefund = async (betId: string) => {
    try {
      tx.writeContract({
        ...contractConfig,
        functionName: "claimReplicaRefund",
        args: [betId]
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to claim refund");
      throw error;
    }
  };
  return { claimRefund, ...tx };
};
