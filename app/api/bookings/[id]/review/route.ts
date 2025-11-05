import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeBookingStatus } from "@/lib/supabase/status";

const REVIEW_CATEGORY_SLUG = "reviews";

function formatBookingWindow(startIso: string, endIso: string) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const dateLabel = start.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const startTime = start.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTime = end.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dateLabel} • ${startTime} - ${endTime} WIB`;
}

type Params = { params: Promise<{ id: string }> };

type RequestBody = {
  rating?: unknown;
  comment?: unknown;
};

export async function POST(request: Request, { params }: Params) {
  const supabase = await createClient();
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "ID booking tidak valid." },
      { status: 400 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as RequestBody;
  const ratingValue = Number(body.rating);

  if (!Number.isFinite(ratingValue) || ratingValue < 1 || ratingValue > 5) {
    return NextResponse.json(
      { error: "Nilai rating harus antara 1 hingga 5 bintang." },
      { status: 400 },
    );
  }

  const normalizedRating = Math.round(ratingValue * 2) / 2;
  const comment =
    typeof body.comment === "string" && body.comment.trim().length > 0
      ? body.comment.trim()
      : null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Silakan login sebagai pemain untuk mengirim review." },
      { status: 401 },
    );
  }

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select(
      `id, court_id, profile_id, start_time, end_time, status, completed_at,
       court:courts(id, slug, name, sport, venue:venues(name))`,
    )
    .eq("id", id)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (bookingError || !booking) {
    return NextResponse.json(
      { error: "Booking tidak ditemukan atau bukan milik kamu." },
      { status: 404 },
    );
  }

  const bookingStatus = normalizeBookingStatus(booking.status);
  if (bookingStatus !== "completed" && !booking.completed_at) {
    return NextResponse.json(
      { error: "Review hanya bisa dikirim setelah sesi bermain selesai." },
      { status: 400 },
    );
  }

  const { data: existingReviewRow } = await supabase
    .from("court_reviews")
    .select("id, forum_thread_id")
    .eq("booking_id", booking.id)
    .maybeSingle();

  let reviewId = existingReviewRow?.id ?? null;
  let forumThreadId = existingReviewRow?.forum_thread_id ?? null;

  if (reviewId) {
    const { error: updateError, data: updated } = await supabase
      .from("court_reviews")
      .update({
        rating: normalizedRating,
        comment,
      })
      .eq("id", reviewId)
      .select("id, forum_thread_id")
      .maybeSingle();

    if (updateError || !updated) {
      console.error("Failed to update review", updateError?.message);
      return NextResponse.json(
        { error: "Gagal memperbarui review." },
        { status: 500 },
      );
    }

    forumThreadId = updated.forum_thread_id ?? forumThreadId;
  } else {
    const { error: insertError, data: inserted } = await supabase
      .from("court_reviews")
      .insert({
        court_id: booking.court_id,
        profile_id: user.id,
        rating: normalizedRating,
        comment,
        booking_id: booking.id,
      })
      .select("id")
      .maybeSingle();

    if (insertError || !inserted) {
      console.error("Failed to insert review", insertError?.message);
      return NextResponse.json(
        { error: "Gagal menyimpan review baru." },
        { status: 500 },
      );
    }

    reviewId = inserted.id;
  }

  const courtRecord = Array.isArray(booking.court)
    ? booking.court[0]
    : (booking.court ?? null);
  const venueSource = courtRecord?.venue;
  const venueRecord = Array.isArray(venueSource)
    ? venueSource[0]
    : (venueSource ?? null);
  const courtName = courtRecord?.name ?? "Lapangan";
  const ratingLabel = `${normalizedRating.toFixed(1)} ★`;
  const playingWindow = formatBookingWindow(
    booking.start_time,
    booking.end_time,
  );
  const reviewTitle = `Review ${courtName} — ${ratingLabel}`;
  const excerpt = comment
    ? comment.slice(0, 160)
    : `${courtName} dinilai ${ratingLabel}`;
  const tags = [
    "review",
    courtRecord?.sport?.toLowerCase() ?? "olahraga",
    venueRecord?.name ? venueRecord.name.toLowerCase() : undefined,
  ].filter(Boolean) as string[];

  const reviewBodyLines = [
    `Rating: ${ratingLabel}`,
    `Jadwal bermain: ${playingWindow}`,
  ];
  if (comment) {
    reviewBodyLines.push("", comment);
  }
  const reviewBody = reviewBodyLines.join("\n");

  if (forumThreadId) {
    const { error: threadUpdateError } = await supabase
      .from("forum_threads")
      .update({
        title: reviewTitle,
        body: reviewBody,
        excerpt,
        tags,
      })
      .eq("id", forumThreadId);

    if (threadUpdateError) {
      console.error(
        "Failed to update review thread",
        threadUpdateError.message,
      );
    }
  } else {
    const slugBase = courtRecord?.slug ?? `booking-${booking.id}`;
    const slug = `review-${slugBase}-${Math.random().toString(36).slice(2, 8)}`;

    const { data: reviewCategory } = await supabase
      .from("forum_categories")
      .select("id")
      .eq("slug", REVIEW_CATEGORY_SLUG)
      .maybeSingle();

    const { data: thread, error: threadInsertError } = await supabase
      .from("forum_threads")
      .insert({
        slug,
        title: reviewTitle,
        body: reviewBody,
        excerpt,
        category_id: reviewCategory?.id ?? null,
        author_profile_id: user.id,
        tags,
      })
      .select("id")
      .maybeSingle();

    if (threadInsertError || !thread) {
      console.error(
        "Failed to create review thread",
        threadInsertError?.message,
      );
      return NextResponse.json(
        { error: "Review tersimpan, tetapi gagal membagikan ke forum." },
        { status: 500 },
      );
    }

    forumThreadId = thread.id;

    const { error: linkError } = await supabase
      .from("court_reviews")
      .update({ forum_thread_id: thread.id })
      .eq("id", reviewId);

    if (linkError) {
      console.error("Failed to link review thread", linkError.message);
    }
  }

  await revalidateTag("explore", "max");

  return NextResponse.json({
    data: {
      review_id: reviewId,
      forum_thread_id: forumThreadId,
      rating: normalizedRating,
      comment,
    },
  });
}
