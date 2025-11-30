"use client";

import { EditCourtFormWithImages } from "@/components/edit-court-form-with-images";

interface ClientEditFormWrapperProps {
  court: any;
}

export function ClientEditFormWrapper({ court }: ClientEditFormWrapperProps) {
  return (
    <div className="max-w-[800px]">
      <EditCourtFormWithImages
        court={court}
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