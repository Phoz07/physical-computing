"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Config {
  id: string;
  webhookUrl: string | null;
}

interface ConfigResponse {
  data: Config | null;
  error?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function fetchConfig(): Promise<Config | null> {
  const response = await fetch(`${API_BASE}/config`);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const json: ConfigResponse = await response.json();

  if (json.error) {
    throw new Error(json.error);
  }

  return json.data;
}

async function updateConfigAPI(webhookUrl: string): Promise<Config> {
  const response = await fetch(`${API_BASE}/config`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ webhookUrl }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const json = await response.json();

  if (json.error) {
    throw new Error(json.error);
  }

  return json.data;
}

export function useConfig() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["config"],
    queryFn: fetchConfig,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    config: data,
    isLoading,
    isError,
    error: error as Error | null,
  };
}

export function useUpdateConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateConfigAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["config"] });
    },
  });
}
