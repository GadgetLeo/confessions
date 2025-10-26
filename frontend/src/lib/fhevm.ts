/**
 * FHEVM Client Library Wrapper
 * Provides client-side encryption for upvotes using Zama's FHEVM
 */

type FhevmInstance = any;

let fhevmInstance: FhevmInstance | null = null;

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

/**
 * Initialize FHEVM instance for client-side encryption
 * This needs to be called before any encryption operations
 */
export async function initFhevm(): Promise<FhevmInstance> {
  if (fhevmInstance) {
    return fhevmInstance;
  }

  if (!isBrowser) {
    throw new Error("FHEVM can only be initialized in browser environment");
  }

  try {
    // Dynamically import fhevmjs to avoid SSR issues
    const { createInstance } = await import("fhevmjs");

    // Create FHEVM instance with Sepolia chain ID
    fhevmInstance = await createInstance({
      chainId: 11155111, // Sepolia
      publicKey: process.env.NEXT_PUBLIC_FHE_PUBLIC_KEY || "",
      networkUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://sepolia.public.blastapi.io",
    });

    console.log("FHEVM instance initialized successfully");
    return fhevmInstance;
  } catch (error) {
    console.error("Failed to initialize FHEVM:", error);
    throw error;
  }
}

/**
 * Encrypt a uint32 value for use in smart contract
 * @param value The number to encrypt (e.g., 1 for upvote)
 * @returns Encrypted bytes as hex string
 */
export async function encryptUint32(value: number): Promise<string> {
  if (!fhevmInstance) {
    await initFhevm();
  }

  if (!fhevmInstance) {
    throw new Error("FHEVM instance not initialized");
  }

  try {
    // Encrypt the value using FHEVM
    const encrypted = fhevmInstance.encrypt32(value);
    return `0x${Buffer.from(encrypted).toString('hex')}`;
  } catch (error) {
    console.error("Encryption failed:", error);
    throw error;
  }
}

/**
 * Get the FHEVM instance
 */
export function getFhevmInstance(): FhevmInstance | null {
  return fhevmInstance;
}

/**
 * Reset FHEVM instance (useful for testing or network changes)
 */
export function resetFhevmInstance(): void {
  fhevmInstance = null;
}
