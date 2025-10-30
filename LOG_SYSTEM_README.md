# Log System with Image Upload

Complete implementation of a log system with pagination and image upload functionality.

## Backend API

### Endpoints

#### 1. GET `/logs`

Retrieve logs with pagination support.

**Query Parameters:**

- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10) - Items per page

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "image": "/uploads/filename.jpg",
      "isOpen": true,
      "createdAt": "2025-10-30T19:57:31.361Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

#### 2. POST `/upload`

Upload an image file.

**Body (multipart/form-data):**

- `file` - Image file

**Response:**

```json
{
  "success": true,
  "path": "/uploads/1730318251234-image.jpg"
}
```

#### 3. POST `/logs`

Create a new log entry.

**Body (JSON):**

```json
{
  "image": "/uploads/filename.jpg",
  "isOpen": true
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "image": "/uploads/filename.jpg",
    "isOpen": true,
    "createdAt": "2025-10-30T19:57:31.361Z"
  }
}
```

### Database Schema

```sql
CREATE TABLE "log" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "image" text,
  "is_open" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
```

### Setup Backend

1. Install dependencies:

```bash
cd apps/backend
bun install
```

2. Setup database:

```bash
# Reset/create log table
bun run reset-log-table.ts

# Add sample data (optional)
bun run seed.ts
```

3. Start server:

```bash
bun run dev
```

Server runs on `http://localhost:3001`

## Frontend

### Features

- **Log Table Display** - Shows all logs with pagination
- **Image Preview** - Displays uploaded images inline
- **Status Badges** - Visual indicators for open/closed status
- **Responsive Design** - Mobile-first approach
- **Loading States** - Skeleton loaders while fetching data
- **Error Handling** - User-friendly error messages

### Components

#### `LogsTable` (`apps/web/src/app/_components/LogsTable.tsx`)

Main component that displays the log table with:

- Image thumbnails
- Log ID (truncated)
- Status badges (Open/Closed with icons)
- Timestamps
- Pagination controls

#### `useLogs` Hook (`apps/web/src/lib/use-logs.ts`)

Custom React hook for fetching logs:

```typescript
const { logs, pagination, isLoading, isError, error, fetchPage } = useLogs(
  1,
  10
);
```

### Helper Functions

#### `uploadImage(file: File): Promise<string | null>`

Upload an image and return the path.

```typescript
const imagePath = await uploadImage(file);
```

#### `createLog(image: string | null, isOpen: boolean): Promise<LogEntry | null>`

Create a new log entry.

```typescript
const log = await createLog("/uploads/image.jpg", true);
```

### Setup Frontend

1. Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

2. Install dependencies (if needed):

```bash
cd apps/web
bun install
```

3. Start dev server:

```bash
bun run dev
```

## Usage Example

### Creating a Log Entry with Image

```typescript
// 1. Upload image
const file = document.querySelector('input[type="file"]').files[0];
const imagePath = await uploadImage(file);

// 2. Create log entry
if (imagePath) {
  const log = await createLog(imagePath, true);
  console.log("Log created:", log);
}

// 3. Refresh logs table
refetch();
```

### Fetching Specific Page

```typescript
const { fetchPage } = useLogs();

// Navigate to page 2
await fetchPage(2);
```

## Tech Stack

### Backend

- **Elysia** - Fast web framework
- **Drizzle ORM** - Type-safe database toolkit
- **PostgreSQL** - Database
- **Bun** - Runtime

### Frontend

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Lucide React** - Icons

## API Testing

Test with curl:

```bash
# Get logs
curl http://localhost:3001/logs

# Get page 2
curl "http://localhost:3001/logs?page=2&limit=5"

# Upload image
curl -X POST http://localhost:3001/upload \
  -F "file=@/path/to/image.jpg"

# Create log
curl -X POST http://localhost:3001/logs \
  -H "Content-Type: application/json" \
  -d '{"image":"/uploads/test.jpg","isOpen":true}'
```

## Files Created/Modified

### Backend

- `apps/backend/src/db/schema/log.ts` - Log table schema
- `apps/backend/src/db/schema.ts` - Schema exports
- `apps/backend/src/db/index.ts` - Database connection
- `apps/backend/src/index.ts` - API endpoints
- `apps/backend/reset-log-table.ts` - Database reset script
- `apps/backend/seed.ts` - Sample data seeder

### Frontend

- `apps/web/src/lib/use-logs.ts` - Log fetching hook
- `apps/web/src/app/_components/LogsTable.tsx` - Log table component
- `apps/web/src/app/page.tsx` - Updated to include logs table
- `apps/web/.env.local` - Environment configuration

## Notes

- Images are stored in `apps/backend/uploads/` directory
- The backend serves uploaded images via `/uploads/*` route
- Pagination defaults to 10 items per page
- All timestamps are in ISO 8601 format
- The log table is responsive and mobile-friendly
