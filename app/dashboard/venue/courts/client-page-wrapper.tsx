"use client";

import { CourtsClientWrapper } from "./client-wrapper";
import type { VenueCourtDetail } from "@/lib/supabase/queries/venue-courts";
import type { VenueCourtMetrics } from "@/lib/supabase/queries/venue-courts";

interface ClientPageWrapperProps {
  courts: VenueCourtDetail[];
  metrics: VenueCourtMetrics | null;
  primaryVenueId: string | null;
  addCourtUrl: string;
}

export function ClientPageWrapper({
  courts,
  metrics,
  primaryVenueId,
  addCourtUrl
}: ClientPageWrapperProps) {
  return (
    <div className="flex items-center justify-between space-y-2">
      <h2 className="text-3xl font-bold tracking-tight">Lapangan Saya</h2>

      {/* Add Court Button */}
      <a href={addCourtUrl}>
        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v14m-7-7h14" />
          </svg>
          Tambah Lapangan
        </button>
      </a>

      <CourtsClientWrapper
        courts={courts}
        metrics={metrics}
        primaryVenueId={primaryVenueId}
      />
    </div>
  );
}