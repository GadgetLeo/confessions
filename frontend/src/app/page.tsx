"use client";

import { useState, useEffect, useRef } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { ConfessionCard } from "@/components/ConfessionCard";
import { LoadingSkeletonGrid } from "@/components/LoadingSkeleton";
import { motion } from "framer-motion";
import { Plus, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useAppStore, Confession } from "@/store/useAppStore";
import { useConfessionCount, useConfessionVault } from "@/hooks/useConfessionVault";
import { useAccount } from "wagmi";
import { hexToString } from "viem";
import toast from "react-hot-toast";
import ConfessionVaultArtifact from "@/contracts/ConfessionVault.json";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONFESSION_VAULT_ADDRESS as `0x${string}`;
const CONTRACT_ABI = ConfessionVaultArtifact.abi;

/**
 * Home Page - Main confession feed
 * Displays all confessions with filtering and sorting options
 */
export default function Home() {
  const { confessions, setConfessions } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  const { count: confessionCount } = useConfessionCount();
  const { upvote } = useConfessionVault();
  const { address } = useAccount();
  const [recentConfessionsToShow, setRecentConfessionsToShow] = useState(15);
  const popularScrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const animationRef = useRef<number | null>(null);

  // Load confessions from contract using wagmi's multicall
  useEffect(() => {
    const loadConfessions = async () => {
      console.log("Loading confessions, count:", confessionCount);

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

        // Fetch each confession
        for (let i = 1; i <= confessionCount; i++) {
          try {
            console.log(`Fetching confession ${i}...`);
            const data = await client.readContract({
              address: CONTRACT_ADDRESS,
              abi: CONTRACT_ABI,
              functionName: 'getConfession',
              args: [BigInt(i)],
            }) as any;

            console.log(`Confession ${i} data:`, data);

            // Decode message from hex
            const messageText = hexToString(data.message);
            console.log(`Decoded message:`, messageText);

            // Check if current user has upvoted this confession
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

            // Try to retrieve customName from localStorage
            // Check multiple possible keys: by confession ID and by author
            const customNameById = localStorage.getItem(`customName_${i}`);
            const customNameByAuthor = localStorage.getItem(`customName_${data.author}`);
            const customName = customNameById || customNameByAuthor || undefined;

            // Get category from localStorage (default to "stupid-take")
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
              decryptedVotes: Number(data.voteCount) || 0, // Public vote count
              timestamp: Number(data.createdAt),
              hasUpvoted: hasUserUpvoted,
              customName: customName,
              category: category,
            });
          } catch (err) {
            console.error(`Failed to load confession ${i}:`, err);
          }
        }

        console.log("Loaded confessions:", loadedConfessions);
        setConfessions(loadedConfessions.reverse()); // Show newest first
      } catch (error) {
        toast.error("Failed to load confessions");
        console.error("Error loading confessions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfessions();
  }, [confessionCount, setConfessions]);

  const handleUpvote = async (id: number) => {
    try {
      await upvote(id);
      // Toast is handled in ConfessionCard component
    } catch (error) {
      console.error(error);
      // Error toast is handled in ConfessionCard component
    }
  };

  const scrollPopular = (direction: 'left' | 'right') => {
    if (popularScrollRef.current) {
      const scrollAmount = 400;
      const newScrollPosition = direction === 'left'
        ? popularScrollRef.current.scrollLeft - scrollAmount
        : popularScrollRef.current.scrollLeft + scrollAmount;

      popularScrollRef.current.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      });
    }
  };

  const loadMoreRecent = () => {
    setRecentConfessionsToShow(prev => prev + 9);
  };

  // Setup native event listeners for smooth dragging
  useEffect(() => {
    const container = popularScrollRef.current;
    if (!container) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let velocity = 0;
    let lastX = 0;
    let lastTime = 0;

    const handleStart = (e: MouseEvent) => {
      // Cancel any ongoing momentum
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }

      isDown = true;
      setIsDragging(true);
      container.classList.add('active');
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
      velocity = 0;
      lastX = e.pageX;
      lastTime = Date.now();
    };

    const handleMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();

      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX);
      container.scrollLeft = scrollLeft - walk;

      // Calculate velocity
      const now = Date.now();
      const timeDelta = now - lastTime;
      if (timeDelta > 0) {
        velocity = (e.pageX - lastX) / timeDelta * 16;
      }
      lastX = e.pageX;
      lastTime = now;
    };

    const handleEnd = () => {
      isDown = false;
      setIsDragging(false);
      container.classList.remove('active');

      // Apply momentum
      if (Math.abs(velocity) > 0.5) {
        let currentVelocity = velocity;
        const friction = 0.92;

        const animate = () => {
          if (!container) return;

          currentVelocity *= friction;
          container.scrollLeft -= currentVelocity;

          if (Math.abs(currentVelocity) > 0.5) {
            animationRef.current = requestAnimationFrame(animate);
          } else {
            animationRef.current = null;
          }
        };

        animationRef.current = requestAnimationFrame(animate);
      }
    };

    container.addEventListener('mousedown', handleStart);
    container.addEventListener('mousemove', handleMove);
    container.addEventListener('mouseup', handleEnd);
    container.addEventListener('mouseleave', handleEnd);

    return () => {
      container.removeEventListener('mousedown', handleStart);
      container.removeEventListener('mousemove', handleMove);
      container.removeEventListener('mouseup', handleEnd);
      container.removeEventListener('mouseleave', handleEnd);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [confessions, isLoading]); // Re-run when confessions load

  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="mx-auto max-w-7xl px-6 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="mb-4 bg-gradient-to-r from-primary-purple-start via-primary-purple-end to-primary-cyan-end bg-clip-text font-heading text-hero font-bold text-transparent">
            Anonymous Confessions
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-h3 text-gray-700 dark:text-gray-300">
            Share your secrets encrypted on-chain.
          </p>

          {/* CTA Button */}
          <Link href="/create">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-gradient inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold"
            >
              <Plus className="h-5 w-5" />
              Create Confession
              <Sparkles className="h-5 w-5" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12 grid gap-6 md:grid-cols-2"
        >
          <div className="glass-card rounded-xl p-6 text-center">
            <div className="mb-2 text-4xl font-bold text-purple-600 dark:text-primary-purple-start">
              {confessionCount}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Confessions</div>
          </div>
          <div className="glass-card rounded-xl p-6 text-center">
            <div className="mb-2 text-4xl font-bold text-green-600 dark:text-success">FHEVM</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Vote Encryption</div>
          </div>
        </motion.div>

        {/* Confession Feed */}
        {isLoading ? (
          <LoadingSkeletonGrid count={6} />
        ) : confessions.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <p className="mb-4 text-h3 text-gray-700 dark:text-gray-300">
              No confessions yet
            </p>
            <p className="text-gray-500 dark:text-gray-400">Be the first to share!</p>
          </div>
        ) : (
          <>
            {/* Popular Confessions */}
            {confessions.filter(c => (c.decryptedVotes || 0) > 0).length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mb-12"
              >
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="font-heading text-h2 font-semibold">
                    Popular Confessions
                  </h2>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => scrollPopular('left')}
                      className="rounded-full bg-purple-100 p-2 text-purple-700 transition-all hover:bg-purple-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                      aria-label="Scroll left"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => scrollPopular('right')}
                      className="rounded-full bg-purple-100 p-2 text-purple-700 transition-all hover:bg-purple-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                      aria-label="Scroll right"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </motion.button>
                  </div>
                </div>
                <div
                  ref={popularScrollRef}
                  className={`flex gap-6 overflow-x-auto pb-4 scrollbar-hide select-none ${
                    isDragging ? 'cursor-grabbing snap-none' : 'cursor-grab snap-x snap-mandatory'
                  }`}
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch',
                    touchAction: 'pan-x'
                  }}
                >
                  {confessions
                    .filter(c => (c.decryptedVotes || 0) > 0)
                    .sort((a, b) => (b.decryptedVotes || 0) - (a.decryptedVotes || 0))
                    .slice(0, 6)
                    .map((confession, index) => (
                      <motion.div
                        key={confession.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex-shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] snap-start"
                      >
                        <ConfessionCard
                          confession={confession}
                          onUpvote={handleUpvote}
                          isHomePage={true}
                        />
                      </motion.div>
                    ))}
                </div>
              </motion.div>
            )}

            {/* Recent Confessions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <h2 className="mb-6 font-heading text-h2 font-semibold">
                Recent Confessions
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {confessions.slice(0, recentConfessionsToShow).map((confession, index) => (
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
              {recentConfessionsToShow < confessions.length && (
                <div className="mt-8 text-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={loadMoreRecent}
                    className="btn-gradient inline-flex items-center gap-2 px-6 py-3 font-semibold"
                  >
                    View More
                  </motion.button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
