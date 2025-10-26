"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { ConfessionCard } from "@/components/ConfessionCard";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Confession } from "@/store/useAppStore";
import toast from "react-hot-toast";
import { useConfessionVault } from "@/hooks/useConfessionVault";
import { useAccount } from "wagmi";
import { hexToString } from "viem";
import ConfessionVaultArtifact from "@/contracts/ConfessionVault.json";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONFESSION_VAULT_ADDRESS as `0x${string}`;
const CONTRACT_ABI = ConfessionVaultArtifact.abi;

/**
 * Confession Detail Page
 * Displays a single confession in detail view
 */
export default function ConfessionDetailPage() {
  const params = useParams();
  const confessionId = params.id as string;
  const [confession, setConfession] = useState<Confession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { upvote } = useConfessionVault();
  const { address } = useAccount();

  useEffect(() => {
    const loadConfession = async () => {
      setIsLoading(true);
      try {
        const { createPublicClient, http } = await import('viem');
        const { sepolia } = await import('viem/chains');

        const client = createPublicClient({
          chain: sepolia,
          transport: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://sepolia.public.blastapi.io'),
        });

        const id = parseInt(confessionId);

        // Fetch confession data
        const data = await client.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'getConfession',
          args: [BigInt(id)],
        }) as any;

        // Decode message from hex
        const messageText = hexToString(data.message);

        // Check if current user has upvoted
        let hasUserUpvoted = false;
        if (address) {
          try {
            const upvoteStatus = await client.readContract({
              address: CONTRACT_ADDRESS,
              abi: CONTRACT_ABI,
              functionName: 'hasUserUpvoted',
              args: [BigInt(id), address],
            }) as boolean;
            hasUserUpvoted = upvoteStatus;
          } catch (err) {
            console.error(`Failed to check upvote status:`, err);
          }
        }

        // Try to retrieve customName from localStorage
        const customNameById = localStorage.getItem(`customName_${id}`);
        const customNameByAuthor = localStorage.getItem(`customName_${data.author}`);
        const customName = customNameById || customNameByAuthor || undefined;

        // Get category from localStorage (default to "stupid-take")
        const category = localStorage.getItem(`category_${id}`) || "stupid-take";

        const loadedConfession: Confession = {
          id: id,
          encryptedMessage: data.message,
          encryptedVotes: "0x00",
          encryptedCreatedAt: "0x00",
          author: data.author,
          ipfsCID: data.ipfsCID || "",
          exists: true,
          decryptedMessage: messageText,
          decryptedVotes: Number(data.voteCount) || 0,
          timestamp: Number(data.createdAt),
          hasUpvoted: hasUserUpvoted,
          customName: customName,
          category: category,
        };

        setConfession(loadedConfession);
      } catch (error) {
        toast.error("Failed to load confession");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfession();
  }, [confessionId, address]);

  const handleUpvote = async (id: number) => {
    try {
      await upvote(id);
      // Reload confession to get updated vote count
      if (confession) {
        setConfession({
          ...confession,
          decryptedVotes: (confession.decryptedVotes || 0) + 1,
          hasUpvoted: true,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="mx-auto max-w-4xl px-6 py-12">
        {/* Back Button */}
        <Link href="/">
          <motion.button
            whileHover={{ x: -4 }}
            className="mb-8 flex items-center gap-2 text-text-secondary transition-colors hover:text-text-primary"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Feed
          </motion.button>
        </Link>

        {/* Confession Detail */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : confession ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ConfessionCard confession={confession} onUpvote={handleUpvote} />
          </motion.div>
        ) : (
          <div className="glass-card rounded-xl p-12 text-center">
            <h2 className="mb-4 font-heading text-h2 font-semibold">
              Confession Not Found
            </h2>
            <p className="text-text-secondary">
              This confession doesn&apos;t exist or has been removed.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
