# React Query Migration Guide

## Overview

This document describes the migration of all API data fetching from custom hooks with manual state management to React Query (TanStack Query v5) for better caching, synchronization, and developer experience.

## Migration Completed

### ✅ Migrated Hooks

#### 1. `use-logs.ts` - Log Management

**Before**: Manual `useState` + `useEffect` for fetching, uploading, and creating logs  
**After**: React Query with `useQuery` and `useMutation`

**Changes**:

- Created `fetchLogs(page, limit)` async function
- Created `uploadImageAPI(file)` async function
- Created `createLogAPI(data)` async function
- `useLogs()` hook now uses `useQuery` with `["logs", page, limit]` query key
- `useUploadImage()` mutation for file uploads
- `useCreateLog()` mutation with automatic cache invalidation via `queryClient.invalidateQueries({ queryKey: ["logs"] })`

**Benefits**:

- Automatic caching and background refetching
- Built-in loading and error states
- Cache invalidation ensures UI updates after mutations
- Pagination state managed reactively

#### 2. `use-status.ts` - Server/Hardware Status Polling

**Before**: Manual `useState` + `useEffect` + `setInterval` for 10s polling  
**After**: React Query with `useQuery` and `refetchInterval`

**Changes**:

- Created `fetchStatus(url)` async function
- Uses `useQuery` with `refetchInterval: autoRefreshMs` for automatic polling
- Replaced manual interval cleanup with React Query's built-in mechanism
- Uses refs (`fetchCountRef`, `lastCheckedRef`) for metadata tracking

**Benefits**:

- Automatic polling without manual interval management
- Built-in retry logic (retry: 2)
- Cleaner code with less boilerplate
- Automatic cleanup on unmount

#### 3. `use-weather.ts` - Weather Data Fetching

**Before**: Manual `useState` + `useEffect` + `setInterval` for auto-refresh + `axios`  
**After**: React Query with `useQuery` and `refetchInterval`

**Changes**:

- Created `fetchWeather(latitude, longitude, timezone)` async function
- Uses `useQuery` with configurable `refetchInterval` (minimum 5s)
- Preserved icon/label computation with `useMemo`
- Replaced manual polling with React Query's `refetchInterval`

**Benefits**:

- Automatic polling for weather updates
- Cached weather data across components
- Proper error handling and retry logic
- Cleaner separation of data fetching and UI logic

### ⏭️ Not Migrated (No API Calls)

#### `use-time.ts` - Local Time Management

**Reason**: This hook uses local browser time with `setInterval` - no API calls, purely client-side state. React Query is not needed for this use case.

## Setup

### Dependencies Installed

```json
{
  "@tanstack/react-query": "^5.90.5",
  "@tanstack/react-query-devtools": "^5.90.2"
}
```

### Provider Configuration

**`apps/web/src/components/query-provider.tsx`**:

```typescript
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 60 seconds
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

**`apps/web/src/components/providers.tsx`** - Updated to wrap app:

```typescript
<QueryProvider>
  <ThemeProvider>{children}</ThemeProvider>
</QueryProvider>
```

## Usage Patterns

### Query Pattern (Data Fetching)

```typescript
import { useQuery } from "@tanstack/react-query";

async function fetchData(params) {
  const response = await fetch(url);
  return response.json();
}

export function useMyData(params) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["myData", params],
    queryFn: () => fetchData(params),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 10000, // Poll every 10s (optional)
    retry: 2,
  });

  return { data, isLoading, isError, error, refetch };
}
```

### Mutation Pattern (Data Modification)

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function createData(input) {
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.json();
}

export function useCreateData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createData,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["myData"] });
    },
  });
}

// In component:
const createMutation = useCreateData();
await createMutation.mutateAsync(data);
```

## Benefits of Migration

1. **Automatic Caching**: Data is cached and reused across components
2. **Background Refetching**: Stale data is automatically refetched
3. **Optimistic Updates**: Can implement optimistic UI updates easily
4. **Reduced Boilerplate**: No manual `useState`, `useEffect`, or `setInterval` management
5. **Better Performance**: Automatic request deduplication and batching
6. **DevTools**: React Query DevTools for debugging query states
7. **Type Safety**: Full TypeScript support for queries and mutations
8. **Error Handling**: Built-in retry logic and error states

## DevTools

Access React Query DevTools by clicking the floating icon in development mode. It shows:

- Active queries and their states
- Cache contents and staleness
- Query timings and refetch behavior
- Mutation states

## Testing

To verify the migration:

1. Start backend: `cd apps/backend && bun run dev`
2. Start frontend: `cd apps/web && npm run dev`
3. Open browser DevTools → Network tab
4. Observe React Query DevTools (floating icon)
5. Verify:
   - Status polling every 10s in header
   - Weather updates every 60s
   - Log creation invalidates cache and refetches
   - Image upload followed by log creation works
   - Pagination maintains separate cache entries

## Future Improvements

Potential enhancements with React Query:

- **Optimistic Updates**: Update UI before server confirms
- **Infinite Queries**: Replace pagination with infinite scroll
- **Prefetching**: Prefetch next page when user is close
- **Suspense**: Use React Suspense for cleaner loading states
- **Mutations Queue**: Offline-first with mutation persistence

## References

- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [React Query Best Practices](https://tkdodo.eu/blog/practical-react-query)
- [Query Keys Guide](https://tkdodo.eu/blog/effective-react-query-keys)
