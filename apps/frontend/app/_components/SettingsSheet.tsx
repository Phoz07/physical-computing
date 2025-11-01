"use client";

import { useState, useEffect } from "react";
import { useConfig, useUpdateConfig } from "@/lib/use-config";
import { useConfigContext } from "../../src/contexts/config-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Settings,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

export default function SettingsSheet() {
  const { config, isLoading } = useConfig();
  const { refetch } = useConfigContext();
  const updateConfig = useUpdateConfig();
  const [webhookUrl, setWebhookUrl] = useState("");
  const [open, setOpen] = useState(false);
  const [isApiDocsOpen, setIsApiDocsOpen] = useState(false);
  const [testStatus, setTestStatus] = useState<
    "idle" | "testing" | "success" | "error"
  >("idle");
  const [testMessage, setTestMessage] = useState("");

  // Update local state when config loads
  useEffect(() => {
    if (config?.webhookUrl) {
      setWebhookUrl(config.webhookUrl);
    }
  }, [config]);

  // Auto-open modal if config is null or webhook URL is null/empty
  useEffect(() => {
    if (!isLoading && (!config || !config.webhookUrl)) {
      setOpen(true);
    }
  }, [config, isLoading]);

  // Reset test status when URL changes
  useEffect(() => {
    setTestStatus("idle");
    setTestMessage("");
  }, [webhookUrl]);

  const handleTestConnection = async () => {
    if (!webhookUrl.trim()) {
      toast.error("Please enter a webhook URL first");
      return;
    }

    setTestStatus("testing");
    setTestMessage("Testing connection...");

    try {
      // Append /status to the user input URL
      const testUrl = webhookUrl.endsWith("/")
        ? `${webhookUrl}status`
        : `${webhookUrl}/status`;

      const response = await fetch(testUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setTestStatus("success");
        setTestMessage("Connection successful! Device is online.");
        toast.success("Connection test passed!");
      } else {
        setTestStatus("error");
        setTestMessage(
          `Connection failed: ${response.status} ${response.statusText}`
        );
        toast.error("Connection test failed");
      }
    } catch (error) {
      setTestStatus("error");
      setTestMessage(
        error instanceof Error
          ? `Connection error: ${error.message}`
          : "Failed to connect to device"
      );
      toast.error("Could not reach the device");
    }
  };

  const handleSave = async () => {
    if (!webhookUrl.trim()) {
      toast.error("Hardware Hook URL cannot be empty");
      return;
    }

    try {
      await updateConfig.mutateAsync(webhookUrl);
      // Refresh context after saving
      await refetch();
      toast.success("Configuration saved successfully!");
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save configuration"
      );
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Configuration Settings</SheetTitle>
          <SheetDescription>
            Configure hardware hook and other system settings.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 p-4">
          {/* Webhook URL Configuration */}
          <div className="grid gap-2">
            <Label htmlFor="webhook-url">Hardware Hook URL</Label>
            <Input
              id="webhook-url"
              type="url"
              placeholder="http://192.168.1.100:8000"
              value={webhookUrl}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setWebhookUrl(e.target.value)
              }
              disabled={
                isLoading || updateConfig.isPending || testStatus === "testing"
              }
            />
            <p className="text-sm text-muted-foreground">
              Enter the hardware hook URL used to control the gate. The system
              will send requests to this endpoint to open/close the automatic
              door.
            </p>
          </div>

          {/* Test Connection Section */}
          <div className="grid gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleTestConnection}
              disabled={
                !webhookUrl.trim() || testStatus === "testing" || isLoading
              }
            >
              {testStatus === "testing" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                <>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Test Connection
                </>
              )}
            </Button>

            {/* Test Status Display */}
            {testStatus !== "idle" && testStatus !== "testing" && (
              <div
                className={`flex items-center gap-2 rounded-md border p-3 text-sm ${
                  testStatus === "success"
                    ? "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400"
                    : "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400"
                }`}
              >
                {testStatus === "success" ? (
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 flex-shrink-0" />
                )}
                <span>{testMessage}</span>
              </div>
            )}
          </div>

          {/* Webhook API Documentation */}
          <Collapsible
            open={isApiDocsOpen}
            onOpenChange={setIsApiDocsOpen}
            className="grid gap-3 rounded-lg border p-4 bg-muted/50"
          >
            <CollapsibleTrigger className="flex items-center justify-between hover:opacity-70 transition-opacity">
              <div className="text-left">
                <h3 className="font-semibold text-sm">
                  Webhook API Documentation
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Your device should implement the following endpoints
                </p>
              </div>
              <ChevronDown
                className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                  isApiDocsOpen ? "rotate-180" : ""
                }`}
              />
            </CollapsibleTrigger>

            <CollapsibleContent className="space-y-4 text-xs pt-2">
              {/* GET /status */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <code className="rounded bg-green-500/20 px-1.5 py-0.5 text-green-700 dark:text-green-400 font-mono font-semibold">
                    GET
                  </code>
                  <code className="font-mono font-semibold">/status</code>
                </div>
                <p className="text-muted-foreground">
                  Returns the current status of the device and gate
                </p>
                <div className="rounded bg-background p-3 font-mono text-xs border">
                  <div className="text-muted-foreground mb-1">Response:</div>
                  <pre className="text-foreground">{`{
  "is_online": true,
  "gate_status": "closed",
  "model_loaded": true,
  "manual_mode": false
}`}</pre>
                </div>
              </div>

              {/* POST /gate */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <code className="rounded bg-blue-500/20 px-1.5 py-0.5 text-blue-700 dark:text-blue-400 font-mono font-semibold">
                    POST
                  </code>
                  <code className="font-mono font-semibold">/gate</code>
                </div>
                <p className="text-muted-foreground">
                  Manually control the gate (open/close)
                </p>
                <div className="rounded bg-background p-3 font-mono text-xs border">
                  <div className="text-muted-foreground mb-1">
                    Request Body:
                  </div>
                  <pre className="text-foreground">{`{
  "action": "open" // or "close"
}`}</pre>
                </div>
                <div className="rounded bg-background p-3 font-mono text-xs border">
                  <div className="text-muted-foreground mb-1">Response:</div>
                  <pre className="text-foreground">{`{
  "status": "success",
  "message": "Gate opened"
}`}</pre>
                </div>
              </div>

              {/* GET /stream.mjpg */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <code className="rounded bg-green-500/20 px-1.5 py-0.5 text-green-700 dark:text-green-400 font-mono font-semibold">
                    GET
                  </code>
                  <code className="font-mono font-semibold">/stream.mjpg</code>
                </div>
                <p className="text-muted-foreground">
                  MJPEG camera stream (read-only, for monitoring)
                </p>
              </div>

              <div className="pt-2 border-t text-muted-foreground">
                <p className="font-medium mb-2">Additional Information:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Device automatically detects helmets using YOLO model</li>
                  <li>Gate opens automatically when helmet is detected</li>
                  <li>Manual mode can be toggled for direct control</li>
                  <li>Detection images and logs are sent to backend</li>
                </ul>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading configuration...
            </div>
          )}
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button variant="outline" disabled={updateConfig.isPending}>
              Cancel
            </Button>
          </SheetClose>
          <Button onClick={handleSave} disabled={updateConfig.isPending}>
            {updateConfig.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
