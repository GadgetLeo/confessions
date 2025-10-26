"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";

/**
 * Footer Component
 * Displays creator attribution with X (Twitter) link
 */
export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="glass-card border-t py-8 dark:border-white/10"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            Made with{" "}
            <Heart className="h-4 w-4 fill-primary-purple-start text-primary-purple-start" />{" "}
            by{" "}
            <a
              href="https://x.com/GadgetLeo"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-purple-600 transition-colors hover:text-purple-700 dark:text-primary-purple-start dark:hover:text-primary-purple-end"
            >
              @GadgetLeo
            </a>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Privacy-preserving confessions powered by FHEVM
          </p>
        </div>
      </div>
    </motion.footer>
  );
}
