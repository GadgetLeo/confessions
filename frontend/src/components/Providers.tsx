"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { config } from "@/lib/wagmi";
import "@rainbow-me/rainbowkit/styles.css";
import { Toaster } from "react-hot-toast";
import { useAppStore } from "@/store/useAppStore";
import { useEffect, Component, ReactNode } from "react";
import { FloatingThemeToggle } from "@/components/FloatingThemeToggle";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Error Boundary for WalletConnect errors
class WalletConnectErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('WalletConnect Error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // Show fallback UI with wallet connect error
      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-deep-space-1 via-deep-space-2 to-deep-space-3">
          <div className="glass-card max-w-md rounded-xl p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold text-primary-purple-start">
              Wallet Connection Issue
            </h2>
            <p className="mb-4 text-text-secondary">
              There was a problem initializing the wallet connection. The app will work, but wallet features may be limited.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-gradient px-6 py-3"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Global providers wrapper for the application
 * Includes Web3 providers (Wagmi, RainbowKit) and UI providers (Toast)
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const theme = useAppStore((state) => state.theme);

  // Apply theme class to html element
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  // Dynamic RainbowKit theme
  const rainbowTheme = theme === "dark"
    ? darkTheme({
        accentColor: "#9333ea",
        accentColorForeground: "white",
        borderRadius: "large",
      })
    : lightTheme({
        accentColor: "#9333ea",
        accentColorForeground: "white",
        borderRadius: "large",
      });

  // Dynamic toast styles
  const toastStyles = theme === "dark"
    ? {
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        color: "#ffffff",
        borderRadius: "12px",
      }
    : {
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(0, 0, 0, 0.1)",
        color: "#000000",
        borderRadius: "12px",
      };

  return (
    <WalletConnectErrorBoundary>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider theme={rainbowTheme}>
            {children}
            <FloatingThemeToggle />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: toastStyles,
                success: {
                  iconTheme: {
                    primary: "#10b981",
                    secondary: theme === "dark" ? "#ffffff" : "#000000",
                  },
                },
                error: {
                  iconTheme: {
                    primary: "#ec4899",
                    secondary: theme === "dark" ? "#ffffff" : "#000000",
                  },
                },
              }}
            />
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </WalletConnectErrorBoundary>
  );
}
