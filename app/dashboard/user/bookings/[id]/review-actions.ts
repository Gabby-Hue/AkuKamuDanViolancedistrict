"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function submitReviewAction(formData: FormData) {
  try {
    const bookingId = formData.get("bookingId") as string;
    const profileId = formData.get("profileId") as string;
    const rating = parseInt(formData.get("rating") as string);
    const comment = formData.get("comment") as string;

    // Validation
    if (!bookingId || !profileId || !rating || rating < 1 || rating > 5) {
      return {
        success: false,
        error: "Invalid input data. Please select a rating.",
      };
    }

    const supabase = await createClient();

    // Check if booking exists and is completed
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, court_id, status, completed_at")
      .eq("id", bookingId)
      .eq("profile_id", profileId)
      .single();

    if (bookingError || !booking) {
      return {
        success: false,
        error: "Booking not found",
      };
    }

    if (booking.status !== "completed" || !booking.completed_at) {
      return {
        success: false,
        error: "Booking must be completed to review",
      };
    }

    // Check if review already exists
    const { data: existingReview } = await supabase
      .from("court_reviews")
      .select("id")
      .eq("booking_id", bookingId)
      .maybeSingle();

    if (existingReview) {
      return {
        success: false,
        error: "Review already submitted",
      };
    }

    // Create the review
    const { data: review, error: reviewError } = await supabase
      .from("court_reviews")
      .insert({
        booking_id: bookingId,
        court_id: booking.court_id,
        profile_id: profileId,
        rating: rating,
        comment: comment.trim() || null,
      })
      .select("id")
      .single();

    if (reviewError) {
      console.error("Failed to create review:", reviewError);
      return {
        success: false,
        error: "Failed to create review",
      };
    }

    // Update booking to mark review as submitted
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        review_submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    if (updateError) {
      console.error("Failed to update booking review timestamp:", updateError);
      // Don't fail the operation, just log it
    }

    // Revalidate the page to show the new review
    revalidatePath(`/dashboard/user/bookings/${bookingId}`);

    return {
      success: true,
      message: "Review submitted successfully!",
      reviewId: review.id,
    };

  } catch (error) {
    console.error("Error submitting review:", error);
    return {
      success: false,
      error: "Internal server error",
    };
  }
}