"use client";

import { useLogs } from "@/lib/use-logs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function LogsTable() {
  const { logs, pagination, isLoading, isError, error, fetchPage } = useLogs(
    1,
    10
  );

  const handlePrevPage = () => {
    if (pagination && pagination.page > 1) {
      fetchPage(pagination.page - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination && pagination.page < pagination.totalPages) {
      fetchPage(pagination.page + 1);
    }
  };

  if (isError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <XCircle className="mx-auto mb-2" size={48} />
            <p className="font-semibold">Failed to load logs</p>
            <p className="text-sm text-muted-foreground">{error?.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Door Access Logs</span>
          {pagination && (
            <Badge variant="outline" className="font-geist-mono">
              {pagination.total} entries
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-12 w-12 rounded" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                  </TableRow>
                ))
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No logs found
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {log.image ? (
                        <img
                          src={`${API_BASE}${log.image}`}
                          alt="Log"
                          className="h-12 w-12 object-cover rounded border"
                        />
                      ) : (
                        <div className="h-12 w-12 bg-muted rounded border flex items-center justify-center">
                          <ImageIcon
                            size={20}
                            className="text-muted-foreground"
                          />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {log.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      {log.isOpen ? (
                        <Badge variant="default" className="bg-green-500">
                          <CheckCircle2 size={14} className="mr-1" />
                          Open
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <XCircle size={14} className="mr-1" />
                          Closed
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-geist-mono text-sm">
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={pagination.page <= 1 || isLoading}
              >
                <ChevronLeft size={16} className="mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={pagination.page >= pagination.totalPages || isLoading}
              >
                Next
                <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
