import { useQuery } from "@tanstack/react-query";
import { useWebhookUrl } from "../contexts/config-context";

interface HardwareStatus {
  is_online: boolean;
  gate_status: "open" | "closed";
  model_loaded: boolean;
  manual_mode: boolean;
  confidence_threshold?: number;
}

export function useHardwareStatus() {
  const webhookUrl = useWebhookUrl();

  return useQuery<HardwareStatus>({
    queryKey: ["hardware-status", webhookUrl],
    queryFn: async () => {
      if (!webhookUrl) {
        throw new Error("Webhook URL is not configured");
      }

      const statusUrl = webhookUrl.endsWith("/")
        ? `${webhookUrl}status`
        : `${webhookUrl}/status`;

      const response = await fetch(statusUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch hardware status: ${response.statusText}`);
      }

      return response.json();
    },
    enabled: !!webhookUrl, // Only run query if webhookUrl exists
    refetchInterval: 5000, // Refetch every 5 seconds
    retry: 3,
    retryDelay: 1000,
  });
}
