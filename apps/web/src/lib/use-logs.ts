import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export interface LogEntry {
  id: string;
  image: string | null;
  isOpen: boolean;
  createdAt: Date | string;
}

export interface LogsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface LogsResponse {
  data: LogEntry[];
  pagination: LogsPagination;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// API Functions
async function fetchLogs(page: number, limit: number): Promise<LogsResponse> {
  const response = await fetch(
    `${API_BASE}/logs?page=${page}&limit=${limit}`
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data;
}

async function uploadImageAPI(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data.path;
}

async function createLogAPI(
  image: string | null,
  isOpen: boolean
): Promise<LogEntry> {
  const response = await fetch(`${API_BASE}/logs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ image, isOpen }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data.data;
}

// React Query Hooks
export function useLogs(initialPage = 1, limit = 10) {
  const [page, setPage] = useState(initialPage);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["logs", page, limit],
    queryFn: () => fetchLogs(page, limit),
    staleTime: 0, // Always fetch fresh data
    refetchInterval: false, // Don't auto-refetch on interval
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
  });

  return {
    logs: data?.data || [],
    pagination: data?.pagination || null,
    isLoading,
    isError,
    error: error as Error | null,
    // refetch,
    fetchPage: (newPage: number) => {
      setPage(newPage);
    },
    currentPage: page,
  };
}

export function useUploadImage() {
  return useMutation({
    mutationFn: uploadImageAPI,
  });
}

export function useCreateLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ image, isOpen }: { image: string | null; isOpen: boolean }) =>
      createLogAPI(image, isOpen),
    onSuccess: () => {
      // Invalidate and refetch logs
      queryClient.invalidateQueries({ queryKey: ["logs"] });
    },
  });
}
