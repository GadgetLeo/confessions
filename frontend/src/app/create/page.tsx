"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { EncryptionForm } from "@/components/EncryptionForm";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import toast from "react-hot-toast";
import { useConfessionVault } from "@/hooks/useConfessionVault";

/**
 * Create Page - Submit new confession
 */
export default function CreatePage() {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingCustomName, setPendingCustomName] = useState<string | null>(null);
  const [pendingCategory, setPendingCategory] = useState<string | null>(null);
  const { submitConfession, isSuccess, error } = useConfessionVault();

  // Handle transaction success
  useEffect(() => {
    const saveConfessionData = async () => {
      if (isSuccess && (pendingCustomName || pendingCategory) && address) {
        toast.dismiss();
        toast.success("Confession submitted successfully!");

        // Save customName with author address for fallback lookup
        if (pendingCustomName) {
          localStorage.setItem(`customName_${address}`, pendingCustomName);
        }

        // Fetch latest confession count to get the ID
        try {
          const { createPublicClient, http } = await import('viem');
          const { sepolia } = await import('viem/chains');
          const ConfessionVaultArtifact = await import('@/contracts/ConfessionVault.json');

          const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONFESSION_VAULT_ADDRESS as `0x${string}`;

          const client = createPublicClient({
            chain: sepolia,
            transport: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://sepolia.public.blastapi.io'),
          });

          const count = await client.readContract({
            address: CONTRACT_ADDRESS,
            abi: ConfessionVaultArtifact.abi,
            functionName: 'confessionCount',
          }) as bigint;

          const confessionId = Number(count);

          // Save customName if provided
          if (pendingCustomName) {
            localStorage.setItem(`customName_${confessionId}`, pendingCustomName);
            console.log(`Saved customName for confession ${confessionId}: ${pendingCustomName}`);
          }

          // Save category
          if (pendingCategory) {
            localStorage.setItem(`category_${confessionId}`, pendingCategory);
            console.log(`Saved category for confession ${confessionId}: ${pendingCategory}`);
          }
        } catch (error) {
          console.error('Failed to save confession data with confession ID:', error);
        }

        setPendingCustomName(null);
        setPendingCategory(null);
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } else if (isSuccess) {
        toast.dismiss();
        toast.success("Confession submitted successfully!");
        setTimeout(() => {
          router.push("/");
        }, 1500);
      }
    };

    saveConfessionData();
  }, [isSuccess, router, pendingCustomName, pendingCategory, address]);

  // Handle transaction error
  useEffect(() => {
    if (error) {
      toast.dismiss();
      toast.error(error.message || "Failed to submit confession");
      setIsSubmitting(false);
    }
  }, [error]);

  const handleSubmit = async (text: string, customName?: string, category?: string) => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsSubmitting(true);
    try {
      // Store customName and category temporarily - will be saved with confession ID after success
      if (customName) {
        setPendingCustomName(customName);
      }
      if (category) {
        setPendingCategory(category);
      }

      toast.loading("Submitting to blockchain...");
      await submitConfession(text);

      // Wait for confirmation
      toast.dismiss();
      toast.loading("Waiting for confirmation...");
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to submit confession");
      console.error(error);
      setIsSubmitting(false);
      setPendingCustomName(null);
      setPendingCategory(null);
    }
  };

  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="mx-auto max-w-7xl px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center"
        >
          {!isConnected ? (
            <div className="glass-card max-w-md rounded-xl p-8 text-center">
              <h2 className="mb-4 font-heading text-h2 font-semibold">
                Connect Your Wallet
              </h2>
              <p className="text-text-secondary">
                Please connect your wallet to submit a confession
              </p>
            </div>
          ) : (
            <EncryptionForm
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
