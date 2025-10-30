import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";

export type CheckState = "ok" | "error" | "unknown";

interface StatusResponse {
  serverStatus: CheckState;
  hardwareStatus: CheckState;
  server?: { status: string };
  hardware?: { status: string };
  status?: string;
}

/**
 * Poll an endpoint (default /api/status) and return a simple status shape.
 * Expected response (flexible):
 * {
 *   server?: { status: 'ok'|'error', last_checked?: ISO, checks?: number },
 *   hardware?: { status: 'ok'|'error', last_checked?: ISO, checks?: number }
 * }
 * If the endpoint shape differs, the hook will try to infer simple statuses.
 */

async function fetchStatus(url: string): Promise<{
  serverStatus: CheckState;
  hardwareStatus: CheckState;
}> {
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  const json = await res.json().catch(() => null);

  let serverStatus: CheckState = "unknown";
  let hardwareStatus: CheckState = "unknown";

  // Try to interpret response
  if (json && typeof json === "object") {
    // server
    if (json.server) {
      const s = (json.server.status as string) || "unknown";
      serverStatus = s === "ok" ? "ok" : s === "error" ? "error" : "unknown";
    } else if (json.serverStatus) {
      serverStatus = json.serverStatus === "ok" ? "ok" : json.serverStatus === "error" ? "error" : "unknown";
    }

    if (json.hardware) {
      const h = (json.hardware.status as string) || "unknown";
      hardwareStatus = h === "ok" ? "ok" : h === "error" ? "error" : "unknown";
    } else if (json.hardwareStatus) {
      hardwareStatus = json.hardwareStatus === "ok" ? "ok" : json.hardwareStatus === "error" ? "error" : "unknown";
    }

    // Fallback: if response has a generic status string
    if (!json.server && !json.serverStatus && json.status) {
      const s = String(json.status);
      serverStatus = s === "ok" ? "ok" : s === "error" ? "error" : "unknown";
    }
  } else {
    // no useful body, assume ok if 2xx
    serverStatus = "ok";
  }

  return { serverStatus, hardwareStatus };
}

export function useStatus(
  url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/status`,
  autoRefreshMs = 10_000
) {
  const fetchCountRef = useRef(0);
  const lastCheckedRef = useRef<string | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["status", url],
    queryFn: async () => {
      fetchCountRef.current += 1;
      lastCheckedRef.current = new Date().toISOString();
      return fetchStatus(url);
    },
    refetchInterval: autoRefreshMs > 0 ? Math.max(5_000, autoRefreshMs) : false,
    staleTime: 5_000,
    retry: 2,
  });

  return {
    serverStatus: data?.serverStatus || "unknown",
    hardwareStatus: data?.hardwareStatus || "unknown",
    fetchCount: fetchCountRef.current,
    lastCheckedAt: lastCheckedRef.current,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}
