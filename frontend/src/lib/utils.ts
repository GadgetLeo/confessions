import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind classes
 * Combines clsx and tailwind-merge for proper class handling
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Truncate Ethereum address for display
 * @param address Full Ethereum address
 * @param startChars Number of characters to show at start (default: 6)
 * @param endChars Number of characters to show at end (default: 4)
 * @returns Truncated address (e.g., "0x1234...5678")
 */
export function truncateAddress(
  address: string,
  startChars: number = 6,
  endChars: number = 4
): string {
  if (!address) return "";
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Convert timestamp to relative time (e.g., "2h ago", "1d ago")
 * @param timestamp Unix timestamp in seconds
 * @returns Relative time string
 */
export function getRelativeTime(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 2592000) return `${Math.floor(diff / 604800)}w ago`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)}mo ago`;
  return `${Math.floor(diff / 31536000)}y ago`;
}

/**
 * Format number with commas for readability
 * @param num The number to format
 * @returns Formatted string (e.g., "1,234,567")
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Generate a deterministic color from a string (for avatars)
 * @param str Input string (e.g., wallet address)
 * @returns HSL color string
 */
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = hash % 360;
  return `hsl(${h}, 70%, 50%)`;
}

/**
 * Copy text to clipboard
 * @param text Text to copy
 * @returns Promise that resolves when copy is complete
 */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  }
}

/**
 * Validate character count for confessions
 * @param text The confession text
 * @param maxLength Maximum allowed length
 * @returns Object with validation result and remaining characters
 */
export function validateConfessionLength(
  text: string,
  maxLength: number = 500
): {
  isValid: boolean;
  length: number;
  remaining: number;
  status: "ok" | "warning" | "error";
} {
  const length = text.length;
  const remaining = maxLength - length;

  let status: "ok" | "warning" | "error" = "ok";
  if (length > maxLength) status = "error";
  else if (length > maxLength * 0.9) status = "warning";

  return {
    isValid: length >= 10 && length <= maxLength,
    length,
    remaining,
    status,
  };
}

/**
 * Sleep for a specified duration
 * @param ms Milliseconds to sleep
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if the app is running in development mode
 */
export const isDevelopment = process.env.NODE_ENV === "development";

/**
 * Get contract address from environment
 */
export const getContractAddress = (): string => {
  const address = process.env.NEXT_PUBLIC_CONFESSION_VAULT_ADDRESS;
  if (!address) {
    throw new Error("Contract address not configured");
  }
  return address;
};
