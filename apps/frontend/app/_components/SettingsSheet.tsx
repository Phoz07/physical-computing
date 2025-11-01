"use client";

import { useState, useEffect } from "react";
import { useConfig, useUpdateConfig } from "@/lib/use-config";
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
import { Settings, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SettingsSheet() {
  const { config, isLoading } = useConfig();
  const updateConfig = useUpdateConfig();
  const [webhookUrl, setWebhookUrl] = useState("");
  const [open, setOpen] = useState(false);

  // Update local state when config loads
  useEffect(() => {
    if (config?.webhookUrl) {
      setWebhookUrl(config.webhookUrl);
    }
  }, [config]);

  const handleSave = async () => {
    if (!webhookUrl.trim()) {
      toast.error("Hardware Hook URL cannot be empty");
      return;
    }

    try {
      await updateConfig.mutateAsync(webhookUrl);
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
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Configuration Settings</SheetTitle>
          <SheetDescription>
            Configure hardware hook and other system settings.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 p-4">
          <div className="grid gap-2">
            <Label htmlFor="webhook-url">Hardware Hook URL</Label>
            <Input
              id="webhook-url"
              type="url"
              placeholder="https://example.com/gate-control"
              value={webhookUrl}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setWebhookUrl(e.target.value)
              }
              disabled={isLoading || updateConfig.isPending}
            />
            <p className="text-sm text-muted-foreground">
              Enter the hardware hook URL used to control the gate. The system
              will send requests to this endpoint to open/close the automatic
              door.
            </p>
          </div>

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
