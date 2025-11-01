"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import dayjs from "dayjs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Eye, ImageOff } from "lucide-react";
import Image from "next/image";

interface Log {
  id: string;
  image: string | null;
  isOpen: boolean;
  createdAt: string;
}

interface LogsResponse {
  data: Log[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function LogTable() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const REFETCH_INTERVAL = 3000; // 3 seconds

  async function getLog(): Promise<LogsResponse> {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/logs?page=${page}&limit=${limit}`
      );
      return res.data;
    } catch (err) {
      if (err instanceof Error) {
        toast.error("Error getting data logs", {
          description: `${err.message}`,
        });
        throw err;
      }
      throw new Error("Unknown error occurred");
    }
  }

  const { data, isLoading, isError, dataUpdatedAt } = useQuery({
    queryKey: ["logs", page, limit],
    queryFn: getLog,
    staleTime: 0,
    refetchInterval: REFETCH_INTERVAL,
  });

  // Countdown timer based on dataUpdatedAt
  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const timeSinceUpdate = now - dataUpdatedAt;
      const timeUntilRefetch = REFETCH_INTERVAL - timeSinceUpdate;
      const secondsRemaining = Math.ceil(timeUntilRefetch / 1000);

      setCountdown(secondsRemaining > 0 ? secondsRemaining : 0);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 100);

    return () => clearInterval(timer);
  }, [dataUpdatedAt]);

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setIsDialogOpen(true);
  };

  const handleNextPage = () => {
    if (data && page < data.pagination.totalPages) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("MMM DD, YYYY, hh:mm:ss A");
  };

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="py-4 px-6">Image</TableHead>
                <TableHead className="py-4 px-6">Status</TableHead>
                <TableHead className="py-4 px-6">Created At</TableHead>
                <TableHead className="text-right py-4 px-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: limit }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell className="py-4 px-6">
                    <Skeleton className="h-16 w-16 rounded-md" />
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell className="text-right py-4 px-6">
                    <Skeleton className="h-9 w-20 ml-auto" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-16" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full p-8 text-center">
        <p className="text-red-500">Error loading logs. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="py-4 px-6">Image</TableHead>
              <TableHead className="py-4 px-6">Status</TableHead>
              <TableHead className="py-4 px-6">Created At</TableHead>
              <TableHead className="text-right py-4 px-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data && data.data.length > 0 ? (
              data.data.map((log, index) => (
                <TableRow key={log.id}>
                  <TableCell className="py-4 px-6">
                    {log.image ? (
                      <div
                        className="relative w-16 h-16 rounded-md overflow-hidden border cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => handleImageClick(log.image!)}
                      >
                        <Image
                          src={`${process.env.NEXT_PUBLIC_API_URL}${log.image}`}
                          alt="Log preview"
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="relative w-16 h-16 rounded-md overflow-hidden border bg-muted flex items-center justify-center">
                        <ImageOff className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <Badge variant={log.isOpen ? "default" : "secondary"}>
                      {log.isOpen ? "Open" : "Closed"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm py-4 px-6">
                    {formatDate(log.createdAt)}
                  </TableCell>
                  <TableCell className="text-right py-4 px-6">
                    {log.image ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleImageClick(log.image!)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        No image
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground py-8"
                >
                  No logs found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="text-sm text-muted-foreground">
            {data && (
              <>
                Page {page} of {data.pagination.totalPages} (
                {data.pagination.total} total entries)
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show:</span>
            <Select
              value={limit.toString()}
              onValueChange={(value) => {
                setLimit(Number(value));
                setPage(1); // Reset to first page when limit changes
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span>Auto-refresh in {countdown}s</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={!data || page === data.pagination.totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Image Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Log Image</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="relative w-full h-[500px]">
              <Image
                src={`${process.env.NEXT_PUBLIC_API_URL}${selectedImage}`}
                alt="Log image"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
