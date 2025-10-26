import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Confession interface matching contract structure
 */
export interface Confession {
  id: number;
  encryptedMessage: string;
  encryptedVotes: string;
  encryptedCreatedAt: string;
  author: string;
  ipfsCID: string;
  exists: boolean;
  // Client-side only fields
  decryptedMessage?: string;
  decryptedVotes?: number;
  timestamp?: number;
  customName?: string; // Custom display name set by user
  hasUpvoted?: boolean; // Whether current user has upvoted this confession
  category?: string; // Category slug (stored in localStorage)
}

/**
 * Application state interface
 */
interface AppState {
  // Wallet state
  isConnected: boolean;
  address: string | null;
  network: string | null;

  // UI state
  theme: "dark" | "light";
  isLoading: boolean;
  isSidebarOpen: boolean;

  // Confession state
  confessions: Confession[];
  selectedConfession: Confession | null;
  confessionCount: number;

  // Filter state
  filterMode: "recent" | "trending" | "all";
  sortMode: "newest" | "oldest" | "votes";

  // Actions - Wallet
  setWallet: (address: string, network: string) => void;
  disconnectWallet: () => void;

  // Actions - UI
  toggleTheme: () => void;
  setLoading: (loading: boolean) => void;
  toggleSidebar: () => void;

  // Actions - Confessions
  addConfession: (confession: Confession) => void;
  updateConfession: (id: number, updates: Partial<Confession>) => void;
  setConfessions: (confessions: Confession[]) => void;
  selectConfession: (confession: Confession | null) => void;
  clearConfessions: () => void;

  // Actions - Filters
  setFilterMode: (mode: "recent" | "trending" | "all") => void;
  setSortMode: (mode: "newest" | "oldest" | "votes") => void;
}

/**
 * Global application store using Zustand
 * Persists theme preference to localStorage
 */
export const useAppStore = create<AppState>()(
  persist(
    (set, _get) => ({
      // Initial state
      isConnected: false,
      address: null,
      network: null,
      theme: "dark",
      isLoading: false,
      isSidebarOpen: false,
      confessions: [],
      selectedConfession: null,
      confessionCount: 0,
      filterMode: "recent",
      sortMode: "newest",

      // Wallet actions
      setWallet: (address, network) =>
        set({
          isConnected: true,
          address,
          network,
        }),

      disconnectWallet: () =>
        set({
          isConnected: false,
          address: null,
          network: null,
        }),

      // UI actions
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "dark" ? "light" : "dark",
        })),

      setLoading: (loading) =>
        set({
          isLoading: loading,
        }),

      toggleSidebar: () =>
        set((state) => ({
          isSidebarOpen: !state.isSidebarOpen,
        })),

      // Confession actions
      addConfession: (confession) =>
        set((state) => ({
          confessions: [confession, ...state.confessions],
          confessionCount: state.confessionCount + 1,
        })),

      updateConfession: (id, updates) =>
        set((state) => ({
          confessions: state.confessions.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),

      setConfessions: (confessions) =>
        set({
          confessions,
          confessionCount: confessions.length,
        }),

      selectConfession: (confession) =>
        set({
          selectedConfession: confession,
        }),

      clearConfessions: () =>
        set({
          confessions: [],
          confessionCount: 0,
          selectedConfession: null,
        }),

      // Filter actions
      setFilterMode: (mode) =>
        set({
          filterMode: mode,
        }),

      setSortMode: (mode) =>
        set({
          sortMode: mode,
        }),
    }),
    {
      name: "web3-confessions-storage",
      partialize: (state) => ({
        // Only persist theme preference
        theme: state.theme,
      }),
    }
  )
);
