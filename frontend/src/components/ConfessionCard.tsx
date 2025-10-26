"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Share2, Clock } from "lucide-react";
import { Confession } from "@/store/useAppStore";
import { getRelativeTime } from "@/lib/utils";
import Avatar from "boring-avatars";
import toast from "react-hot-toast";

const categories: Record<string, string> = {
  "circle-jerkers": "Circle Jerkers",
  "rekt-founders": "Rekt Founders",
  "projects": "Projects",
  "hidden-crushes": "Hidden Crushes",
  "stupid-take": "Stupid Take",
  "speculations": "Speculations",
};

const categoryColors: Record<string, string> = {
  "circle-jerkers": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "rekt-founders": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  "projects": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "hidden-crushes": "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  "stupid-take": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  "speculations": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

interface ConfessionCardProps {
  confession: Confession;
  onUpvote?: (id: number) => Promise<void>;
  isHomePage?: boolean;
}

/**
 * ConfessionCard Component
 * Displays a single confession with glassmorphism design
 * Features: encrypted state, upvote button, share functionality
 */
export function ConfessionCard({ confession, onUpvote, isHomePage = false }: ConfessionCardProps) {
  const [isUpvoted, setIsUpvoted] = useState(confession.hasUpvoted || false);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [localVoteCount, setLocalVoteCount] = useState(confession.decryptedVotes || 0);

  // Sync with prop changes (e.g., after refresh)
  useEffect(() => {
    setIsUpvoted(confession.hasUpvoted || false);
    setLocalVoteCount(confession.decryptedVotes || 0);
  }, [confession.hasUpvoted, confession.decryptedVotes]);

  const handleUpvote = async () => {
    if (isUpvoted || !onUpvote) return;

    setIsUpvoting(true);
    try {
      await onUpvote(confession.id);
      setIsUpvoted(true);
      setLocalVoteCount(prev => prev + 1);
      toast.success("Upvoted!");
    } catch (error) {
      toast.error("Failed to upvote");
      console.error(error);
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/confession/${confession.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const displayText = confession.decryptedMessage || "🔒 Encrypted";
  // On homepage, use shorter truncation for fixed card size
  const truncateLength = isHomePage ? 150 : 200;
  const shouldTruncate = displayText.length > truncateLength;
  const truncatedText = shouldTruncate && !isExpanded
    ? `${displayText.slice(0, truncateLength)}...`
    : displayText;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={`glass-card group relative overflow-hidden rounded-xl p-6 transition-all duration-300 hover:shadow-xl ${
        isHomePage && !isExpanded ? 'h-[320px] flex flex-col' : ''
      }`}
    >
      {/* Animated gradient border on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-purple-start to-primary-cyan-end opacity-0 transition-opacity group-hover:opacity-20" />

      {/* Header */}
      <div className="relative mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar
            size={40}
            name={confession.author}
            variant="beam"
            colors={["#9333ea", "#c026d3", "#06b6d4", "#3b82f6", "#a78bfa"]}
          />
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {confession.customName || "Anonymous"}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Clock className="h-3 w-3" />
              <span>
                {confession.timestamp
                  ? getRelativeTime(confession.timestamp)
                  : "Recently"}
              </span>
            </div>
          </div>
        </div>

        {/* Category Badge */}
        <div className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${categoryColors[confession.category || "stupid-take"]}`}>
          <span>{categories[confession.category || "stupid-take"]}</span>
        </div>
      </div>

      {/* Content */}
      <div className={`relative mb-4 ${isHomePage && !isExpanded ? 'flex-1 overflow-hidden' : ''}`}>
        <p className="leading-relaxed text-gray-700 dark:text-gray-300">
          {truncatedText}
        </p>
        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-sm text-purple-600 hover:underline dark:text-primary-purple-start"
          >
            {isExpanded ? "Show less" : "Show more"}
          </button>
        )}
      </div>

      {/* Footer Actions */}
      <div className="relative flex items-center gap-4">
        {/* Upvote Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleUpvote}
          disabled={isUpvoted || isUpvoting}
          className={`focus-ring flex items-center gap-2 rounded-full px-4 py-2 transition-all ${
            isUpvoted
              ? "bg-gradient-to-r from-primary-purple-start to-error text-white"
              : "bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <Heart
            className={`h-4 w-4 ${isUpvoted ? "fill-current" : ""}`}
          />
          <span className="text-sm font-medium">
            {localVoteCount}
          </span>
        </motion.button>

        {/* Share Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleShare}
          className="focus-ring flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-purple-700 transition-all hover:bg-purple-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
        >
          <Share2 className="h-4 w-4" />
          <span className="text-sm">Share</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
