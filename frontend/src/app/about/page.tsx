"use client";

import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Lock, MessageSquare, ThumbsUp } from "lucide-react";

/**
 * About Page
 * Explains the platform and its purpose
 */
export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="mx-auto max-w-4xl px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {/* Hero */}
          <div className="text-center">
            <h1 className="mb-6 bg-gradient-to-r from-primary-purple-start to-primary-purple-end bg-clip-text font-heading text-hero font-bold text-transparent">
              About Us
            </h1>
          </div>

          {/* Main Story */}
          <div className="glass-card space-y-6 rounded-xl p-8">
            <p className="text-lg leading-relaxed text-gray-900 dark:text-white">
              I built Web3 Confessions because not everything belongs on-chain…
              <br />
              <span className="italic">except maybe your regrets</span> — encrypted, of course.
            </p>

            <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
              Sponsored by <span className="text-gray-500 dark:text-gray-400">(i&apos;m kidding who pays for this shit)</span>,
              we let you post your deepest alpha, drama, or repentance straight to the blockchain
              without revealing a single byte of it.
            </p>

            <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
              The smart contract can tally upvotes but never spill your secrets.
            </p>
          </div>

          {/* What You Can Do */}
          <div className="glass-card space-y-6 rounded-xl p-8">
            <h2 className="font-heading text-h2 font-semibold">What to Confess?</h2>

            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-primary-purple-start/20">
                  <MessageSquare className="h-6 w-6 text-purple-600 dark:text-primary-purple-start" />
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">
                    Say something about the shitty airdrop you got
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Got rugged by another &ldquo;community-first&rdquo; project? Let it out.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-success/20">
                  <ThumbsUp className="h-6 w-6 text-green-600 dark:text-success" />
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">
                    Vent out about the founders who called you out
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Anonymous revenge is the best revenge. On-chain forever.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-cyan-100 dark:bg-primary-cyan-start/20">
                  <Lock className="h-6 w-6 text-cyan-600 dark:text-primary-cyan-start" />
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">
                    Just say whatever you have in your mind
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Your thoughts, encrypted. Your privacy, proof-of-work.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* The Tech Behind It */}
          <div className="glass-card space-y-6 rounded-xl p-8">
            <h2 className="font-heading text-h2 font-semibold">How It Works</h2>

            <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
              You confess, the chain computes, and your privacy remains proof-of-work.
            </p>

            <div className="space-y-3">
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-semibold text-purple-600 dark:text-primary-purple-start">Fully Homomorphic Encryption (FHE)</span>
                {" "}means your confessions are encrypted before hitting the blockchain.
                The smart contract can count votes, track popularity, and do all the math
                without ever knowing what you actually said.
              </p>

              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-semibold text-green-600 dark:text-success">Complete Privacy.</span>
                {" "}No one can read your confessions. Not me, not the validators, not anyone.
                Just you and the encrypted void.
              </p>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
