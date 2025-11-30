"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteCourt } from "@/lib/supabase/queries/venue-courts";
import type { VenueCourtDetail } from "@/lib/supabase/queries/venue-courts";

interface DeleteCourtDialogProps {
  court: VenueCourtDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeleteCourtDialog({ court, open, onOpenChange, onSuccess }: DeleteCourtDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await deleteCourt(court.id);

      if (result.success) {
        onOpenChange(false);
        onSuccess();
      } else {
        setError(result.error || "Terjadi kesalahan saat menghapus lapangan");
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      console.error("Delete court error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hapus Lapangan</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus lapangan "{court.name}"?
            <span className="text-red-600 font-semibold"> PERINGATAN: Tindakan ini akan menghapus lapangan secara permanen dari sistem.</span>
            Semua data terkait termasuk gambar, jadwal blackout, dan histori akan dihapus.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-muted p-4 rounded-md">
            <h4 className="font-medium mb-2">Detail Lapangan:</h4>
            <div className="space-y-1 text-sm">
              <p><strong>Nama:</strong> {court.name}</p>
              <p><strong>Tipe:</strong> {court.sport}</p>
              <p><strong>Harga:</strong> Rp {court.pricePerHour.toLocaleString("id-ID")}/jam</p>
              <p><strong>Status:</strong> {court.isActive ? "Aktif" : "Non-aktif"}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Menghapus..." : "Hapus Lapangan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}