"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUploadImage, useCreateLog } from "@/lib/use-logs";
import { Upload, Plus } from "lucide-react";
import { toast } from "sonner";

interface CreateLogFormProps {
  onSuccess?: () => void;
}

export default function CreateLogForm({ onSuccess }: CreateLogFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [preview, setPreview] = useState<string | null>(null);

  const uploadImageMutation = useUploadImage();
  const createLogMutation = useCreateLog();

  const isUploading =
    uploadImageMutation.isPending || createLogMutation.isPending;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let imagePath: string | null = null;

      if (file) {
        imagePath = await uploadImageMutation.mutateAsync(file);
      }

      await createLogMutation.mutateAsync({ image: imagePath, isOpen });

      toast.success("Log created successfully!");
      setFile(null);
      setPreview(null);
      setIsOpen(true);
      onSuccess?.();
    } catch (error) {
      console.error("Error creating log:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus size={20} />
          Create New Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image">Image (optional)</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            {preview && (
              <div className="mt-2">
                <img
                  src={preview}
                  alt="Preview"
                  className="h-32 w-32 object-cover rounded border"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Door Status</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={isOpen ? "default" : "outline"}
                onClick={() => setIsOpen(true)}
                disabled={isUploading}
                className="flex-1"
              >
                Open
              </Button>
              <Button
                type="button"
                variant={!isOpen ? "default" : "outline"}
                onClick={() => setIsOpen(false)}
                disabled={isUploading}
                className="flex-1"
              >
                Closed
              </Button>
            </div>
          </div>

          <Button type="submit" disabled={isUploading} className="w-full">
            {isUploading ? (
              "Creating..."
            ) : (
              <>
                <Upload size={16} className="mr-2" />
                Create Log
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
