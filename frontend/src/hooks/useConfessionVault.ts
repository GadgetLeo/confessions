import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { stringToHex } from 'viem';
import ConfessionVaultArtifact from '@/contracts/ConfessionVault.json';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONFESSION_VAULT_ADDRESS as `0x${string}`;
const CONTRACT_ABI = ConfessionVaultArtifact.abi;

export function useConfessionVault() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Submit a confession
  const submitConfession = async (message: string) => {
    if (!CONTRACT_ADDRESS) {
      throw new Error('Contract address not configured');
    }

    // Convert message to hex bytes
    const messageHex = stringToHex(message);

    return writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'submitConfession',
      args: [messageHex],
    });
  };

  // Upvote a confession (vote count encrypted on-chain)
  const upvote = async (confessionId: number) => {
    if (!CONTRACT_ADDRESS) {
      throw new Error('Contract address not configured');
    }

    return writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'upvote',
      args: [BigInt(confessionId)],
    });
  };

  return {
    submitConfession,
    upvote,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Hook to read confession count
export function useConfessionCount() {
  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'confessionCount',
  });

  return {
    count: data ? Number(data) : 0,
    isLoading,
    refetch,
  };
}

// Hook to read a specific confession
export function useConfession(id: number) {
  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getConfession',
    args: [BigInt(id)],
    query: {
      enabled: id > 0,
    },
  });

  return {
    confession: data,
    isLoading,
    refetch,
  };
}

// Hook to check if user has upvoted
export function useHasUpvoted(confessionId: number, userAddress?: `0x${string}`) {
  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'hasUserUpvoted',
    args: [BigInt(confessionId), userAddress!],
    query: {
      enabled: !!userAddress && confessionId > 0,
    },
  });

  return {
    hasUpvoted: !!data,
    isLoading,
    refetch,
  };
}

// Hook to get remaining cooldown
export function useRemainingCooldown(userAddress?: `0x${string}`) {
  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getRemainingCooldown',
    args: [userAddress!],
    query: {
      enabled: !!userAddress,
    },
  });

  return {
    cooldown: data ? Number(data) : 0,
    isLoading,
    refetch,
  };
}
