# Next.js App Router Deep Dive

## Konsep Dasar

App Router adalah routing system modern dari Next.js yang menggunakan React Server Components (RSC) sebagai default.

### File Structure Pattern

```
app/
├── layout.tsx              # Root layout untuk seluruh aplikasi
├── page.tsx                # Homepage (/)
├── auth/
│   ├── login/page.tsx     # /auth/login
│   ├── register/page.tsx  # /auth/register
│   └── layout.tsx         # Layout untuk auth pages
├── api/
│   ├── payments/route.ts  # /api/payments (POST/GET)
│   └── venues/[id]/route.ts # /api/venues/123 (dynamic)
└── dashboard/
    ├── admin/page.tsx     # /dashboard/admin
    └── venue/page.tsx     # /dashboard/venue
```

**Sumber:** [Next.js File-based Routing](https://nextjs.org/docs/app/building-your-application/routing/defining-routes)

### Server Components vs Client Components

#### Server Components (Default)
```typescript
// app/page.tsx
export default async function Home() {
  // ✅ Berjalan di SERVER
  const data = await fetch('https://api.example.com/data'); // Direct fetch

  return <main>{...}</main>
}
```

**Keuntungan:**
- ✅ Direct database access
- ✅ Better SEO (pre-rendered HTML)
- ✅ Faster loading (no client-side JS)
- ✅ Secure (no secrets exposed to client)

**Sumber:** [Server Components Documentation](https://nextjs.org/docs/app/building-your-application/rendering/server-components)

#### Client Components
```typescript
// components/navbar.tsx
"use client"; // ← WAJIB untuk client components

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false); // ✅ React hooks

  return <nav>{...}</nav>
}
```

**Kapan pakai Client Component:**
- Pakai React hooks (useState, useEffect, etc.)
- Interactive UI (click handlers, form inputs)
- Browser-only APIs (window, document)
- Event listeners

**Sumber:** [Client Components Documentation](https://nextjs.org/docs/app/building-your-application/rendering/client-components)

### Route Handlers (API Routes)

#### Basic Structure
```typescript
// app/api/users/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Handle GET request
  return NextResponse.json({ users: [] });
}

export async function POST(request: Request) {
  const body = await request.json();
  // Handle POST request
  return NextResponse.json({ success: true });
}
```

**Sumber:** [Route Handlers Documentation](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

#### Dynamic API Routes
```typescript
// app/api/users/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id; // Dynamic parameter

  return NextResponse.json({ userId: id });
}
```

### Layout System

#### Root Layout
```typescript
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <Navbar />        {/* Global navigation */}
          {children}        {/* Page content */}
          <Footer />        {/* Global footer */}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

#### Nested Layouts
```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard">
      <Sidebar /> {/* Dashboard-specific sidebar */}
      {children} {/* admin/page.tsx or venue/page.tsx */}
    </div>
  );
}
```

**Sumber:** [Layouts Documentation](https://nextjs.org/docs/app/building-your-application/routing/layouts-and-templates)

### Metadata & SEO

#### Static Metadata
```typescript
// app/layout.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Courtease | Sewa Lapangan Olahraga',
  description: 'Temukan dan pesan lapangan olahraga favoritmu',
  keywords: ['olahraga', 'lapangan', 'booking'],
  openGraph: {
    title: 'Courtease',
    description: 'Sewa lapangan olahraga mudah',
    url: 'https://courtease.id',
  },
};
```

#### Dynamic Metadata
```typescript
// app/venues/[slug]/page.tsx
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const venue = await getVenueBySlug(params.slug);

  return {
    title: `${venue.name} - Courtease`,
    description: venue.description,
  };
}
```

**Sumber:** [Metadata Documentation](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)

### Data Fetching Patterns

#### Server-side Fetching
```typescript
// app/page.tsx
async function fetchCourts() {
  // ✅ Direct fetch ke database/API
  const supabase = createClient();
  const { data } = await supabase.from('courts').select('*');
  return data;
}

export default async function Home() {
  const courts = await fetchCourts(); // Server-side

  return <CourtList courts={courts} />; // Props ke client component
}
```

#### Client-side Fetching
```typescript
// components/realtime-updates.tsx
"use client";

import { useEffect, useState } from 'react';

export default function RealtimeUpdates() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // ✅ Client-side fetch untuk real-time data
    const fetchData = async () => {
      const response = await fetch('/api/live-data');
      const result = await response.json();
      setData(result);
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, []);

  return <div>{JSON.stringify(data)}</div>;
}
```

**Sumber:** [Data Fetching Documentation](https://nextjs.org/docs/app/building-your-application/data-fetching)

### Error Handling

#### Error Boundaries
```typescript
// app/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

#### 404 Pages
```typescript
// app/not-found.tsx
export default function NotFound() {
  return (
    <div>
      <h2>Page not found</h2>
      <p>Could not find requested resource</p>
    </div>
  );
}
```

**Sumber:** [Error Handling Documentation](https://nextjs.org/docs/app/building-your-application/routing/error-handling)

### Best Practices

#### ✅ DO:
- Gunakan Server Components untuk data fetching
- Pisahkan client dan server logic
- Validasi input di API routes
- Gunakan TypeScript untuk type safety
- Implement proper error boundaries

#### ❌ AVOID:
- Fetch data di client component kalau bisa di server
- Expose environment variables ke client
- Forget SEO metadata
- Skip error handling
- Mix client/server logic tanpa perlu

### Debugging Tips

#### 1. Console Logging
```typescript
// Server component logs di terminal
console.log('Server log:', data);

// Client component logs di browser console
'use client';
console.log('Client log:', data);
```

#### 2. Network Tab
- API requests muncul di Network tab browser
- Cek timing dan response untuk debugging

#### 3. Next.js Dev Tools
- Install `@next/debug` untuk advanced debugging
- Gunakan React DevTools untuk component inspection

---

**Key Takeaways:**
1. **Server-first mindset** untuk data fetching
2. **Proper separation** antara client/server
3. **Type safety** dengan TypeScript
4. **SEO optimization** dengan metadata
5. **Error handling** untuk robustness