"use client";

import { AddCourtFormWithImages } from "@/components/add-court-form-with-images";

interface ClientFormWrapperProps {
  venueId: string;
}

export function ClientFormWrapper({ venueId }: ClientFormWrapperProps) {
  return (
    <div className="max-w-[800px]">
      <AddCourtFormWithImages
        venueId={venueId}
        onSuccess={() => {
          // Success will be handled by client-side navigation
        }}
        onClose={() => {
          // Close will be handled by client-side navigation
        }}
      />
    </div>
  );
}