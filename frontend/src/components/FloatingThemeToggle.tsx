"use client";

import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

/**
 * Floating Theme Toggle Widget
 * Fixed position theme switcher with responsive sizing
 */
export function FloatingThemeToggle() {
  const { theme, toggleTheme } = useAppStore();

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-lg transition-all hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:from-purple-600 dark:to-purple-800 dark:shadow-purple-900/30 dark:hover:shadow-purple-900/50 sm:h-14 sm:w-14"
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === "dark" ? 0 : 180 }}
        transition={{ duration: 0.3 }}
      >
        {theme === "dark" ? (
          <Sun className="h-5 w-5 sm:h-6 sm:w-6" />
        ) : (
          <Moon className="h-5 w-5 sm:h-6 sm:w-6" />
        )}
      </motion.div>
    </motion.button>
  );
}
