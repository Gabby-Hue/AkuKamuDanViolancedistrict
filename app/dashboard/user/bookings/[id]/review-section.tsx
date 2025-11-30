"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, MessageSquare, Loader2 } from "lucide-react";
import type { BookingDetail } from "@/lib/services/booking.service";

interface ReviewSectionProps {
  booking: BookingDetail;
  hasExistingReview: boolean;
}

export default function ReviewSection({ booking, hasExistingReview }: ReviewSectionProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submittedReview, setSubmittedReview] = useState<{
    rating: number;
    comment: string | null;
  } | null>(null);

  // Check if review can be submitted based on database state
  const canReview = booking.status === "completed" && booking.completed_at && !hasExistingReview && !booking.review_submitted_at;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setError("Silakan pilih rating bintang");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/bookings/${booking.id}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          comment: comment.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal mengirim review");
      }

      setSuccess(true);
      // Store the submitted review data to display it
      setSubmittedReview({
        rating,
        comment: comment.trim() || null,
      });

      // Refresh the page to get the official review data from server
      router.refresh();

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canReview && !hasExistingReview) {
    // Show submitted review if available (from current session)
    if (submittedReview) {
      const displayRating = Math.round(submittedReview.rating);

      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Review Anda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <div className="flex items-center justify-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-8 w-8 ${
                      star <= displayRating
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-200 text-gray-400"
                    }`}
                  />
                ))}
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {submittedReview.rating.toFixed(1)} / 5.0
              </p>
              <p className="text-sm text-green-600 font-medium mb-3">
                Review Anda telah dikirim
              </p>
              {submittedReview.comment && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-left">
                  <p className="text-gray-700 dark:text-gray-300 italic">
                    "{submittedReview.comment}"
                  </p>
                </div>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                Terima kasih atas feedback Anda
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Show submitted review message if review_submitted_at exists but no review data yet
    if (booking.review_submitted_at) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Review Anda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <div className="flex items-center justify-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-8 w-8 fill-gray-200 text-gray-400"
                  />
                ))}
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                - / 5.0
              </p>
              <p className="text-sm text-green-600 font-medium mb-3">
                Review Anda telah dikirim
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                Review sedang diproses oleh sistem
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Show cannot review message
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Review Lapangan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {booking.status !== "completed"
                ? "Review dapat ditulis setelah sesi bermain selesai"
                : "Loading review data..."
              }
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Display existing review from database
  if (hasExistingReview && booking.review) {
    const displayRating = Math.round(booking.review.rating);
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Review Anda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="flex items-center justify-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-8 w-8 ${
                    star <= displayRating
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-200 text-gray-400"
                  }`}
                />
              ))}
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {booking.review.rating.toFixed(1)} / 5.0
            </p>
            <p className="text-sm text-green-600 font-medium mb-3">
              Review Anda telah dikirim
            </p>
            {booking.review.comment && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-left">
                <p className="text-gray-700 dark:text-gray-300 italic">
                  "{booking.review.comment}"
                </p>
              </div>
            )}
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
              Terima kasih telah memberikan feedback untuk lapangan ini
            </p>
            {booking.review.forum_thread_id && (
              <div className="mt-3">
                <p className="text-xs text-gray-500">
                  Review ini juga dibagikan ke forum publik
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Display submitted review while waiting for server refresh
  if (submittedReview) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Review Anda
          </CardTitle>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center py-6">
              <div className="flex items-center justify-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-8 w-8 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {submittedReview.rating.toFixed(1)} / 5.0
              </p>
              <p className="text-green-600 font-medium mb-3">
                Review berhasil dikirim!
              </p>
              {submittedReview.comment && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-left">
                  <p className="text-gray-700 dark:text-gray-300 italic">
                    "{submittedReview.comment}"
                  </p>
                </div>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                Terima kasih atas feedback Anda
              </p>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="flex items-center justify-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-8 w-8 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Review Anda telah tersimpan
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Review Lapangan
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Bagikan pengalaman bermain Anda di {booking.court.name}
        </p>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="text-center py-6">
            <div className="flex items-center justify-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="h-8 w-8 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
            <p className="text-green-600 font-medium mb-2">
              Review berhasil dikirim!
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Terima kasih atas feedback Anda
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Star Rating */}
            <div>
              <Label className="text-sm font-medium">Rating Bintang *</Label>
              <div className="flex items-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`p-1 transition-transform ${
                      success ? "cursor-not-allowed" : "hover:scale-110"
                    }`}
                    disabled={success}
                    onMouseEnter={() => !success && setHoveredStar(star)}
                    onMouseLeave={() => !success && setHoveredStar(0)}
                    onClick={() => !success && setRating(star)}
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= (hoveredStar || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-200 text-gray-400"
                      } ${success ? "opacity-60" : ""}`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {rating === 1 && "Sangat Buruk"}
                  {rating === 2 && "Buruk"}
                  {rating === 3 && "Cukup"}
                  {rating === 4 && "Baik"}
                  {rating === 5 && "Sangat Baik"}
                </p>
              )}
            </div>

            {/* Comment */}
            <div>
              <Label htmlFor="comment" className="text-sm font-medium">
                Komentar (Opsional)
              </Label>
              <Textarea
                id="comment"
                placeholder="Ceritakan pengalaman Anda bermain di lapangan ini..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={success}
                className={`mt-2 ${success ? "opacity-60 cursor-not-allowed" : ""}`}
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {comment.length}/500 karakter
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || rating === 0 || success}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengirim Review...
                </>
              ) : success ? (
                <>
                  <Star className="mr-2 h-4 w-4" />
                  Review Terkirim
                </>
              ) : (
                <>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Kirim Review
                </>
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              Review akan ditampilkan secara publik di forum
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
}