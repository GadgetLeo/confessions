"use client";

import { useState } from "react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Lock, ChevronDown, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Navigation Header Component
 * Sticky header with logo, nav items, theme toggle, and wallet connection
 */
const categories = [
  { name: "Circle Jerkers", slug: "circle-jerkers" },
  { name: "Rekt Founders", slug: "rekt-founders" },
  { name: "Projects", slug: "projects" },
  { name: "Hidden Crushes", slug: "hidden-crushes" },
  { name: "Stupid Take", slug: "stupid-take" },
  { name: "Speculations", slug: "speculations" },
];

export function Navigation() {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="glass-card sticky top-0 z-50 border-b backdrop-blur-sm dark:border-white/10"
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-heading">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-gradient-to-r from-primary-purple-start to-primary-purple-end"
            >
              <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </motion.div>
            <span className="bg-gradient-to-r from-primary-purple-start to-primary-purple-end bg-clip-text text-base sm:text-xl font-bold text-transparent">
              Web3 Confessions
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden items-center gap-8 lg:flex">
            <Link
              href="/"
              className="text-gray-700 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Home
            </Link>
            <Link
              href="/create"
              className="text-gray-700 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Create
            </Link>

            {/* Categories Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsCategoriesOpen(true)}
              onMouseLeave={() => setIsCategoriesOpen(false)}
            >
              <button className="flex items-center gap-1 text-gray-700 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                Categories
                <ChevronDown className={`h-4 w-4 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isCategoriesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 top-full mt-2 w-48 glass-card rounded-lg border shadow-xl dark:border-white/10 dark:bg-[#1a0b2e] dark:shadow-2xl"
                  >
                    <div className="py-2">
                      {categories.map((category) => (
                        <Link
                          key={category.slug}
                          href={`/${category.slug}`}
                          className="block px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-purple-50 hover:text-purple-700 dark:text-gray-200 dark:hover:bg-purple-900/30 dark:hover:text-purple-300"
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              href="/about"
              className="text-gray-700 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              About
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Wallet Connect Button - Optimized for mobile */}
            <div className="wallet-connect-wrapper">
              <ConnectButton
                chainStatus="icon"
                showBalance={false}
                accountStatus={{
                  smallScreen: "avatar",
                  largeScreen: "full",
                }}
              />
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="focus-ring flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-purple-100 text-purple-700 transition-colors hover:bg-purple-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 lg:hidden"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </motion.button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 z-50 h-full w-72 bg-white shadow-2xl dark:bg-[#1a0b2e] lg:hidden"
            >
              <div className="flex flex-col h-full">
                {/* Drawer Header */}
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-white/10">
                  <div className="flex items-center gap-2 font-heading">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-primary-purple-start to-primary-purple-end">
                      <Lock className="h-4 w-4 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-primary-purple-start to-primary-purple-end bg-clip-text text-lg font-bold text-transparent">
                      Menu
                    </span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto px-6 py-6">
                  <div className="space-y-6">
                    {/* Main Links */}
                    <div className="space-y-2">
                      <Link
                        href="/"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block rounded-lg px-4 py-3 text-base font-medium text-gray-700 transition-all hover:bg-purple-50 hover:text-purple-700 dark:text-gray-200 dark:hover:bg-purple-900/30 dark:hover:text-purple-300"
                      >
                        Home
                      </Link>
                      <Link
                        href="/create"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block rounded-lg px-4 py-3 text-base font-medium text-gray-700 transition-all hover:bg-purple-50 hover:text-purple-700 dark:text-gray-200 dark:hover:bg-purple-900/30 dark:hover:text-purple-300"
                      >
                        Create Confession
                      </Link>
                      <Link
                        href="/about"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block rounded-lg px-4 py-3 text-base font-medium text-gray-700 transition-all hover:bg-purple-50 hover:text-purple-700 dark:text-gray-200 dark:hover:bg-purple-900/30 dark:hover:text-purple-300"
                      >
                        About
                      </Link>
                    </div>

                    {/* Categories Section */}
                    <div>
                      <h3 className="mb-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Categories
                      </h3>
                      <div className="space-y-2">
                        {categories.map((category) => (
                          <Link
                            key={category.slug}
                            href={`/${category.slug}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block rounded-lg px-4 py-3 text-base font-medium text-gray-700 transition-all hover:bg-purple-50 hover:text-purple-700 dark:text-gray-200 dark:hover:bg-purple-900/30 dark:hover:text-purple-300"
                          >
                            {category.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
