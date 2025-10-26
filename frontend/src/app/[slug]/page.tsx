"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ConfessionCard } from "@/components/ConfessionCard";
import { LoadingSkeletonGrid } from "@/components/LoadingSkeleton";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { useAppStore, Confession } from "@/store/useAppStore";
import { useConfessionCount, useConfessionVault } from "@/hooks/useConfessionVault";
import { useAccount } from "wagmi";
import { hexToString } from "viem";
import toast from "react-hot-toast";
import ConfessionVaultArtifact from "@/contracts/ConfessionVault.json";
import { notFound } from "next/navigation";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONFESSION_VAULT_ADDRESS as `0x${string}`;
const CONTRACT_ABI = ConfessionVaultArtifact.abi;

const categories: Record<string, string> = {
  "circle-jerkers": "Circle Jerkers",
  "rekt-founders": "Rekt Founders",
  "projects": "Projects",
  "hidden-crushes": "Hidden Crushes",
  "stupid-take": "Stupid Take",
  "speculations": "Speculations",
};

/**
 * Category Page
 * Displays confessions filtered by category
 */
export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  // Show 404 if invalid category
  if (!categories[slug]) {
    notFound();
  }

  const categoryName = categories[slug];

  const { setConfessions } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  const [categoryConfessions, setCategoryConfessions] = useState<Confession[]>([]);
  const { count: confessionCount } = useConfessionCount();
  const { upvote } = useConfessionVault();
  const { address } = useAccount();

  // Load confessions from contract
  useEffect(() => {
    const loadConfessions = async () => {
      if (confessionCount === 0) {
        setIsLoading(false);
        setConfessions([]);
        return;
      }

      setIsLoading(true);
      try {
        const { createPublicClient, http } = await import('viem');
        const { sepolia } = await import('viem/chains');

        const client = createPublicClient({
          chain: sepolia,
          transport: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://sepolia.public.blastapi.io'),
        });

        const loadedConfessions: Confession[] = [];

        for (let i = 1; i <= confessionCount; i++) {
          try {
            const data = await client.readContract({
              address: CONTRACT_ADDRESS,
              abi: CONTRACT_ABI,
              functionName: 'getConfession',
              args: [BigInt(i)],
            }) as any;

            const messageText = hexToString(data.message);

            let hasUserUpvoted = false;
            if (address) {
              try {
                const upvoteStatus = await client.readContract({
                  address: CONTRACT_ADDRESS,
                  abi: CONTRACT_ABI,
                  functionName: 'hasUserUpvoted',
                  args: [BigInt(i), address],
                }) as boolean;
                hasUserUpvoted = upvoteStatus;
              } catch (err) {
                console.error(`Failed to check upvote status for confession ${i}:`, err);
              }
            }

            const customNameById = localStorage.getItem(`customName_${i}`);
            const customNameByAuthor = localStorage.getItem(`customName_${data.author}`);
            const customName = customNameById || customNameByAuthor || undefined;

            // Get category from localStorage
            const category = localStorage.getItem(`category_${i}`) || "stupid-take";

            loadedConfessions.push({
              id: i,
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
            });
          } catch (err) {
            console.error(`Failed to load confession ${i}:`, err);
          }
        }

        setConfessions(loadedConfessions.reverse());

        // Filter by category
        const filtered = loadedConfessions.filter(c => c.category === slug);
        // Sort by votes (best first)
        filtered.sort((a, b) => (b.decryptedVotes || 0) - (a.decryptedVotes || 0));
        setCategoryConfessions(filtered);
      } catch (error) {
        toast.error("Failed to load confessions");
        console.error("Error loading confessions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfessions();
  }, [confessionCount, setConfessions, slug, address]);

  const handleUpvote = async (id: number) => {
    try {
      await upvote(id);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="mx-auto max-w-7xl px-6 py-12">
        {/* Category Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="mb-4 bg-gradient-to-r from-primary-purple-start via-primary-purple-end to-primary-cyan-end bg-clip-text font-heading text-hero font-bold text-transparent">
            {categoryName}
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-h3 text-gray-700 dark:text-gray-300">
            {categoryConfessions.length} confession{categoryConfessions.length !== 1 ? 's' : ''} in this category
          </p>
        </motion.div>

        {/* Confessions Grid */}
        {isLoading ? (
          <LoadingSkeletonGrid count={6} />
        ) : categoryConfessions.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <p className="mb-4 text-h3 text-gray-700 dark:text-gray-300">
              No confessions in this category yet
            </p>
            <p className="text-gray-500 dark:text-gray-400">Be the first to share!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categoryConfessions.map((confession, index) => (
              <motion.div
                key={confession.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ConfessionCard
                  confession={confession}
                  onUpvote={handleUpvote}
                  isHomePage={true}
                />
              </motion.div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
