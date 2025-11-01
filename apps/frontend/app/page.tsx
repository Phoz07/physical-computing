"use client";

import { Card } from "@/components/ui/card";
import Weather from "./_components/Weather";
import LogTable from "./_components/LogTable";
import {
  DoorClosed,
  DoorOpen,
  AlertCircle,
  VideoOff,
  Loader2,
} from "lucide-react";
import { useWebhookUrl } from "../src/contexts/config-context";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Home() {
  const webhookUrl = useWebhookUrl();
  const [imageError, setImageError] = useState(false);
  const [gateLoading, setGateLoading] = useState(false);
  const [currentGateAction, setCurrentGateAction] = useState<
    "open" | "close" | null
  >(null);

  const getStreamUrl = () => {
    if (!webhookUrl) return null;
    return webhookUrl.endsWith("/")
      ? `${webhookUrl}stream.mjpg`
      : `${webhookUrl}/stream.mjpg`;
  };

  const handleGateControl = async (action: "open" | "close") => {
    if (!webhookUrl) {
      toast.error("Webhook URL is not configured");
      return;
    }

    setGateLoading(true);
    setCurrentGateAction(action);

    try {
      const gateUrl = webhookUrl.endsWith("/")
        ? `${webhookUrl}gate`
        : `${webhookUrl}/gate`;

      const response = await fetch(gateUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} gate: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        toast.success(data.message || `Gate ${action}ed successfully`);
      } else {
        toast.error(data.message || `Failed to ${action} gate`);
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to ${action} gate. Please check your connection.`
      );
    } finally {
      setGateLoading(false);
      setCurrentGateAction(null);
    }
  };

  const streamUrl = getStreamUrl();

  return (
    <div className="w-full flex justify-center">
      <div className="container flex flex-col gap-4 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <Card className="aspect-video w-225 max-w-full overflow-hidden p-0 relative">
            <div className="absolute bottom-2 left-2 z-10">
              {/* Gate Control Buttons */}
              <div className="flex gap-2 bg-background/80 backdrop-blur-md rounded-full p-1.5">
                <Button
                  onClick={() => handleGateControl("open")}
                  disabled={!webhookUrl || gateLoading}
                  variant="ghost"
                  className="rounded-full hover:bg-green-500/20 hover:text-green-600 disabled:opacity-50 h-10 w-10 p-0"
                >
                  {gateLoading && currentGateAction === "open" ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <DoorOpen className="h-5 w-5" />
                  )}
                </Button>
                <Button
                  onClick={() => handleGateControl("close")}
                  disabled={!webhookUrl || gateLoading}
                  variant="ghost"
                  className="rounded-full hover:bg-red-500/20 hover:text-red-600 disabled:opacity-50 h-10 w-10 p-0"
                >
                  {gateLoading && currentGateAction === "close" ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <DoorClosed className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>

            {!webhookUrl ? (
              <div className="aspect-video w-full h-full flex flex-col items-center justify-center bg-muted text-muted-foreground px-4">
                <AlertCircle className="h-12 w-12 mb-2 text-destructive" />
                <p className="font-semibold text-destructive">
                  Webhook URL Not Configured
                </p>
                <p className="text-sm text-center">
                  Please configure the webhook URL in settings
                </p>
                <p className="text-xs mt-3 text-center font-bold uppercase text-destructive">
                  If you updated webhook, please reload website to display
                  camera
                </p>
              </div>
            ) : imageError ? (
              <div className="aspect-video w-full h-full flex flex-col items-center justify-center bg-muted text-muted-foreground px-4">
                <VideoOff className="h-12 w-12 mb-2 text-destructive" />
                <p className="font-semibold text-destructive">
                  Stream Not Available
                </p>
                <p className="text-sm text-center">
                  Unable to connect to camera stream
                </p>
                <p className="text-xs mt-2 opacity-70">Endpoint: {streamUrl}</p>
                <p className="text-xs mt-3 text-center font-bold uppercase text-destructive">
                  If you updated webhook, please reload website to display
                  camera
                </p>
              </div>
            ) : (
              <img
                src={streamUrl || ""}
                className="aspect-video w-full h-auto"
                alt="Camera Stream"
                onError={() => setImageError(true)}
              />
            )}
          </Card>
          <Card className="flex-1 flex items-start lg:items-end p-6">
            <Weather />
          </Card>
        </div>
        <Card className="p-6">
          <LogTable />
        </Card>
      </div>
    </div>
  );
}
