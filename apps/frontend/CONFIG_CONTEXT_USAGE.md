# Config Context Usage

## Setup Complete! ✅

Config Context ถูกสร้างแล้วและ integrate เข้ากับ Provider หลักแล้ว

## How to Use

### 1. Get Full Config Object

```tsx
import { useConfigContext } from "@/contexts/config-context";

function MyComponent() {
  const { config, isLoading, error, refetch } = useConfigContext();

  if (isLoading) return <div>Loading config...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <p>Webhook URL: {config?.webhookUrl ?? "Not set"}</p>
      <button onClick={() => refetch()}>Refresh Config</button>
    </div>
  );
}
```

### 2. Get Specific Value (Convenience Hook)

```tsx
import { useWebhookUrl } from "@/contexts/config-context";

function MyComponent() {
  const webhookUrl = useWebhookUrl();

  return <div>Webhook: {webhookUrl ?? "Not configured"}</div>;
}
```

### 3. Check Loading State

```tsx
import { useIsConfigLoading } from "@/contexts/config-context";

function MyComponent() {
  const isLoading = useIsConfigLoading();

  if (isLoading) {
    return <Skeleton />;
  }

  return <div>Content...</div>;
}
```

### 4. Update Config (with mutation)

```tsx
import { useConfigContext } from "@/contexts/config-context";
import { useUpdateConfig } from "@/lib/use-config";

function SettingsForm() {
  const { config } = useConfigContext();
  const updateConfig = useUpdateConfig();

  const handleSave = async (newUrl: string) => {
    try {
      await updateConfig.mutateAsync(newUrl);
      // Config will auto-refresh via context
    } catch (error) {
      console.error("Failed to update:", error);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        handleSave(formData.get("webhookUrl") as string);
      }}
    >
      <input name="webhookUrl" defaultValue={config?.webhookUrl ?? ""} />
      <button type="submit">Save</button>
    </form>
  );
}
```

## Available Hooks

### `useConfigContext()`

Returns full context with:

- `config: Config | null` - Config object with id and webhookUrl
- `isLoading: boolean` - Loading state
- `error: Error | null` - Error if any
- `refetch: () => Promise<void>` - Manually refetch config

### `useWebhookUrl()`

Returns: `string | null` - Just the webhook URL

### `useIsConfigLoading()`

Returns: `boolean` - Loading state only

## Type Safety

All hooks are fully type-safe:

```tsx
const { config } = useConfigContext();

// TypeScript knows:
config?.id; // string
config?.webhookUrl; // string | null
```

## Error Handling

```tsx
const { error } = useConfigContext();

if (error) {
  // Type-safe error object
  console.error(error.message);
}
```

## Auto-refresh

Context automatically refreshes when:

- useUpdateConfig mutation succeeds
- Manual refetch() is called
- Query is invalidated

## Provider Already Added! ✅

ConfigProvider is already wrapped in your root Provider component, so you can use these hooks anywhere in your app!
