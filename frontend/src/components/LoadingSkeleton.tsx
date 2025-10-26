"use client";

import { motion } from "framer-motion";

/**
 * LoadingSkeleton Component
 * Animated skeleton loader matching ConfessionCard layout
 */
export function LoadingSkeleton() {
  return (
    <div className="glass-card overflow-hidden rounded-xl p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar skeleton */}
          <div className="shimmer h-10 w-10 rounded-full bg-purple-200 dark:bg-white/10" />
          <div className="space-y-2">
            {/* Name skeleton */}
            <div className="shimmer h-4 w-32 rounded bg-purple-200 dark:bg-white/10" />
            {/* Timestamp skeleton */}
            <div className="shimmer h-3 w-20 rounded bg-purple-200 dark:bg-white/10" />
          </div>
        </div>
        {/* Badge skeleton */}
        <div className="shimmer h-6 w-24 rounded-full bg-purple-200 dark:bg-white/10" />
      </div>

      {/* Content skeleton */}
      <div className="mb-4 space-y-2">
        <div className="shimmer h-4 w-full rounded bg-purple-200 dark:bg-white/10" />
        <div className="shimmer h-4 w-full rounded bg-purple-200 dark:bg-white/10" />
        <div className="shimmer h-4 w-3/4 rounded bg-purple-200 dark:bg-white/10" />
      </div>

      {/* Actions skeleton */}
      <div className="flex items-center gap-4">
        <div className="shimmer h-10 w-24 rounded-full bg-purple-200 dark:bg-white/10" />
        <div className="shimmer h-10 w-24 rounded-full bg-purple-200 dark:bg-white/10" />
      </div>
    </div>
  );
}

/**
 * Multiple loading skeletons for feed
 */
export function LoadingSkeletonGrid({ count = 3 }: { count?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: count }).map((_, i) => (
        <LoadingSkeleton key={i} />
      ))}
    </motion.div>
  );
}
