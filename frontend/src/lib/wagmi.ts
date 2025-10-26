import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";

/**
 * Wagmi and RainbowKit configuration
 * Configures Web3 wallet connection for Sepolia testnet
 */

// Get project ID from env, fallback to a known working public project ID
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "3fbb6bba6f1de962d911bb5b5c9dba88";

// Only show warning in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  if (!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID === 'YOUR_PROJECT_ID_HERE') {
    console.warn('⚠️ Using fallback WalletConnect Project ID. Get your own at https://cloud.walletconnect.com/');
  }
}

export const config = getDefaultConfig({
  appName: "Web3 Confessions",
  projectId,
  chains: [sepolia],
  ssr: true, // Enable server-side rendering support
});
