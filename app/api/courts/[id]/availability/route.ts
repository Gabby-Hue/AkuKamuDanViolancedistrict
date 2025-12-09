import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeBookingStatus } from "@/lib/supabase/status";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
  const supabase = await createClient();
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "ID lapangan tidak valid." },
      { status: 400 },
    );
  }

  const now = new Date();
  const maxDate = new Date(now);
  maxDate.setMonth(maxDate.getMonth() + 3);
  maxDate.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from("court_booking_slots")
    .select("id, start_time, end_time, status, payment_status")
    .eq("court_id", id)
    .gte("end_time", now.toISOString())
    .lte("start_time", maxDate.toISOString())
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Failed to fetch court availability", error.message);
    return NextResponse.json(
      { error: "Tidak dapat memuat jadwal booking yang sudah ada." },
      { status: 500 },
    );
  }

  const bookings = (data ?? []).map((slot: any) => ({
    id: slot.id,
    start_time: slot.start_time,
    end_time: slot.end_time,
    status: normalizeBookingStatus(slot.status),
    payment_status: slot.payment_status,
  }));

  return NextResponse.json({ data: bookings });
}
