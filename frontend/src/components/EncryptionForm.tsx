"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Loader2, Sparkles, ChevronDown, Check } from "lucide-react";
import { validateConfessionLength } from "@/lib/utils";
import toast from "react-hot-toast";

interface EncryptionFormProps {
  onSubmit: (text: string, customName?: string, category?: string) => Promise<void>;
  isSubmitting?: boolean;
}

const categories = [
  { name: "Circle Jerkers", slug: "circle-jerkers", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  { name: "Rekt Founders", slug: "rekt-founders", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  { name: "Projects", slug: "projects", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  { name: "Hidden Crushes", slug: "hidden-crushes", color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400" },
  { name: "Stupid Take", slug: "stupid-take", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  { name: "Speculations", slug: "speculations", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
];

/**
 * EncryptionForm Component
 * Form for creating new encrypted confessions
 * Features: character counter, validation, encryption indicator, custom name
 */
export function EncryptionForm({
  onSubmit,
  isSubmitting = false,
}: EncryptionFormProps) {
  const [text, setText] = useState("");
  const [customName, setCustomName] = useState("");
  const [category, setCategory] = useState("stupid-take"); // Default category
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const validation = validateConfessionLength(text);

  const selectedCategory = categories.find(c => c.slug === category) || categories[4];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    };

    if (isCategoryOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCategoryOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validation.isValid) {
      toast.error(
        text.length < 10
          ? "Confession must be at least 10 characters"
          : "Confession exceeds maximum length (500 characters)"
      );
      return;
    }

    try {
      await onSubmit(text, customName.trim() || undefined, category);
      setText(""); // Clear form on success
      setCustomName(""); // Clear name field
      setCategory("stupid-take"); // Reset to default
      toast.success("Confession submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit confession");
      console.error(error);
    }
  };

  const getCounterColor = () => {
    switch (validation.status) {
      case "error":
        return "text-red-600 dark:text-error";
      case "warning":
        return "text-amber-600 dark:text-warning";
      default:
        return "text-gray-500 dark:text-gray-400";
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      onSubmit={handleSubmit}
      className="glass-card w-full max-w-2xl space-y-6 rounded-xl p-8"
    >
      {/* Header */}
      <div className="text-center">
        <h2 className="mb-2 flex items-center justify-center gap-2 font-heading text-h2 font-bold">
          <Sparkles className="h-6 w-6 text-purple-600 dark:text-primary-purple-start" />
          Share Your Encrypted Confession
        </h2>
        <p className="text-gray-700 dark:text-gray-300">
          Your confession will be encrypted on-chain for complete privacy
        </p>
      </div>

      {/* Custom Name Input */}
      <div>
        <label htmlFor="customName" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Display Name (optional)
        </label>
        <input
          id="customName"
          type="text"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          placeholder="e.g., CryptoWhale, AnonDev, etc."
          maxLength={20}
          disabled={isSubmitting}
          className="focus-ring w-full rounded-lg border border-purple-200 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-primary-purple-start focus:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-400 dark:focus:bg-white/10"
          style={{ fontSize: "16px" }} // Prevent iOS zoom
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Leave blank to remain &ldquo;Anonymous&rdquo;
        </p>
      </div>

      {/* Category Dropdown */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Category
        </label>
        <div className="relative" ref={dropdownRef}>
          {/* Dropdown Button */}
          <button
            type="button"
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            disabled={isSubmitting}
            className="focus-ring flex w-full items-center justify-between rounded-lg border border-purple-200 bg-white px-4 py-3 text-gray-900 transition-all hover:border-purple-300 focus:border-primary-purple-start focus:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:border-white/20 dark:focus:bg-white/10"
            style={{ fontSize: "16px" }}
          >
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${selectedCategory.color}`}>
                {selectedCategory.name}
              </span>
            </div>
            <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform dark:text-gray-500 ${isCategoryOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isCategoryOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute z-10 mt-2 w-full overflow-hidden rounded-lg border border-purple-200 bg-white shadow-lg dark:border-white/10 dark:bg-[#1a0b2e]"
              >
                <div className="max-h-60 overflow-y-auto py-1">
                  {categories.map((cat) => (
                    <button
                      key={cat.slug}
                      type="button"
                      onClick={() => {
                        setCategory(cat.slug);
                        setIsCategoryOpen(false);
                      }}
                      className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-purple-50 dark:hover:bg-purple-900/20"
                    >
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${cat.color}`}>
                        {cat.name}
                      </span>
                      {category === cat.slug && (
                        <Check className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Choose a category for your confession
        </p>
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your confession here... (min 10 characters)"
          disabled={isSubmitting}
          className="focus-ring min-h-[200px] w-full resize-none rounded-lg border border-purple-200 bg-white p-4 text-gray-900 placeholder:text-gray-400 focus:border-primary-purple-start focus:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-gray-400 dark:focus:bg-white/10"
          style={{ fontSize: "16px" }} // Prevent iOS zoom
        />

        {/* Character Counter */}
        <div
          className={`absolute bottom-3 right-3 text-xs font-medium ${getCounterColor()}`}
        >
          {validation.length} / 500
        </div>
      </div>

      {/* Encryption Indicator */}
      <motion.div
        animate={{
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="flex items-center justify-center gap-2 text-sm text-success"
      >
        <Lock className="h-4 w-4" />
        <span>This will be encrypted on-chain using FHEVM</span>
      </motion.div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        whileHover={{ scale: validation.isValid && !isSubmitting ? 1.02 : 1 }}
        whileTap={{ scale: validation.isValid && !isSubmitting ? 0.98 : 1 }}
        disabled={!validation.isValid || isSubmitting}
        className="btn-gradient focus-ring w-full py-4 text-lg font-semibold disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            {isSubmitting ? "Encrypting & Submitting..." : "Processing..."}
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            Confess Anonymously
            <Lock className="h-5 w-5" />
          </span>
        )}
      </motion.button>

      {/* Validation Hint */}
      {text.length > 0 && !validation.isValid && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-sm text-error"
        >
          {text.length < 10
            ? `Need ${10 - text.length} more characters (min 10)`
            : `Exceeded by ${Math.abs(validation.remaining)} characters`}
        </motion.p>
      )}
    </motion.form>
  );
}
