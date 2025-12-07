"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, MessageSquare, Loader2 } from "lucide-react";
import { submitReviewAction } from "./review-actions";

interface ReviewFormProps {
  bookingId: string;
  profileId: string;
  courtName: string;
}

function SubmitButton({ rating }: { rating: number }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending || rating === 0}
      className="w-full"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Mengirim Review...
        </>
      ) : (
        <>
          <MessageSquare className="mr-2 h-4 w-4" />
          Kirim Review
        </>
      )}
    </Button>
  );
}

export default function ReviewForm({ bookingId, profileId, courtName }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResult(null);

    const formData = new FormData(e.currentTarget);

    // Add required fields that aren't in form inputs
    formData.set("bookingId", bookingId);
    formData.set("profileId", profileId);

    try {
      const response = await submitReviewAction(formData);
      if (response.success) {
        setResult({
          success: true,
          message: response.message || "Review berhasil dikirim",
        });
      } else {
        setResult({
          success: false,
          message: response.error || "Gagal mengirim review",
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Terjadi kesalahan",
      });
    }
  };

  if (result?.success) {
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
            <div className="flex items-center justify-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="h-8 w-8 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
            <p className="text-green-600 font-medium mb-2">
              {result.message}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Terima kasih atas feedback Anda
            </p>
          </div>
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
          Bagikan pengalaman bermain Anda di {courtName}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Hidden inputs for form data */}
          <input type="hidden" name="bookingId" value={bookingId} />
          <input type="hidden" name="profileId" value={profileId} />
          <input type="hidden" name="rating" value={rating} />

          {/* Star Rating */}
          <div>
            <Label className="text-sm font-medium">Rating Bintang *</Label>
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 transition-transform hover:scale-110"
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredStar || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-200 text-gray-400"
                    }`}
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
              name="comment"
              placeholder="Ceritakan pengalaman Anda bermain di lapangan ini..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-2"
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/500 karakter
            </p>
          </div>

          {/* Error Message */}
          {result && !result.success && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{result.message}</p>
            </div>
          )}

          {/* Submit Button */}
          <SubmitButton rating={rating} />

          <p className="text-xs text-gray-500 text-center">
            Review akan ditampilkan secara publik di forum
          </p>
        </form>
      </CardContent>
    </Card>
  );
}