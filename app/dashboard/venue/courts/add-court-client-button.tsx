"use client";

import { Plus } from "lucide-react";

interface AddCourtClientButtonProps {
  onClick: () => void;
}

export function AddCourtClientButton({ onClick }: AddCourtClientButtonProps) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center rounded-md border border-dashed bg-muted px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
    >
      <Plus className="mr-2 h-4 w-4" />
      Tambah Lapangan
    </button>
  );
}