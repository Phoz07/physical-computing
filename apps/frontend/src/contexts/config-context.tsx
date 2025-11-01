import { useConfig } from "@/lib/use-config";
import { useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { createContext, useContext, type ReactNode } from "react";

// Types
export interface Config {
  id: string;
  webhookUrl: string | null;
}

interface ConfigContextValue {
  config: Config | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// Create context with undefined as initial value
const ConfigContext = createContext<ConfigContextValue | undefined>(undefined);

// Provider component
interface ConfigProviderProps {
  children: ReactNode;
}

export function ConfigProvider({ children }: ConfigProviderProps) {
  const { config, isLoading, error } = useConfig();
  const queryClient = useQueryClient();

  const value: ConfigContextValue = {
    config: config ?? null,
    isLoading,
    error: error ?? null,
    refetch: async () => {
      await queryClient.invalidateQueries({ queryKey: ["config"] });
    },
  };

  return (
    <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
  );
}

// Custom hook to use config context
export function useConfigContext(): ConfigContextValue {
  const context = useContext(ConfigContext);

  if (context === undefined) {
    throw new Error("useConfigContext must be used within a ConfigProvider");
  }

  return context;
}

// Convenience hooks for specific config values
export function useWebhookUrl(): string | null {
  const { config } = useConfigContext();
  return config?.webhookUrl ?? null;
}

export function useIsConfigLoading(): boolean {
  const { isLoading } = useConfigContext();
  return isLoading;
}
