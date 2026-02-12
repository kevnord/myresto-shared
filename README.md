# @myresto/shared

Shared utilities and components for the MyResto ecosystem.

## Installation

```bash
npm install @myresto/shared
```

For local development (before publishing to npm):

```bash
# In this package directory
npm link

# In your app directory
npm link @myresto/shared
```

## What's Included

### 🔧 Utilities

#### Theme Management
```ts
import { initTheme, getTheme, setTheme } from '@myresto/shared/lib/theme';

// Initialize theme on app startup
initTheme();

// Toggle theme
const current = getTheme();
setTheme(current === 'dark' ? 'light' : 'dark');
```

#### Brand Configuration
```ts
import { createBrand } from '@myresto/shared/lib/brand';

export const brand = createBrand({
  name: 'Event',
  iconPaths: {
    dark: '/icons/logo-white.png',
    light: '/icons/logo-black.png',
  }
});
```

#### API Client
```ts
import { createApiFetch } from '@myresto/shared/lib/api';

const apiFetch = createApiFetch('/api');

export const api = {
  getEvents: () => apiFetch<{ events: Event[] }>('/events'),
  createEvent: (data, token) => 
    apiFetch('/events', { method: 'POST', body: data, token }),
};
```

#### Auth Abstraction
```ts
import { useAuth, useUser, UserButton } from '@myresto/shared/lib/auth';

function MyComponent() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  
  return <UserButton />;
}
```

### 🧩 Components

#### Footer
```tsx
import Footer from '@myresto/shared/components/Footer';

<Footer 
  appName="MyRestoEvent"
  commitHash={__COMMIT_HASH__}
/>
```

### 🧪 Test Utilities

```ts
import { MockAuthProvider } from '@myresto/shared/test/mockAuth';

// Use VITE_AUTH_BYPASS=true to enable mock auth
```

## Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Watch mode for development
npm run dev
```

## Tech Stack

- React 19
- TypeScript
- Clerk (auth)
- Supabase (database)
- Tailwind CSS (styling)

## License

MIT
