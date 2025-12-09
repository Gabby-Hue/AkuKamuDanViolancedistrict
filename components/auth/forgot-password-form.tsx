"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Email wajib diisi");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Format email tidak valid");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (resetError) {
        throw resetError;
      }

      setIsSuccess(true);
      toast.success("Link reset password telah dikirim", {
        description: "Silakan periksa inbox dan spam folder email Anda",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan";
      setError(errorMessage);
      toast.error("Gagal mengirim link reset password", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-2xl font-bold">Lupa Password</h1>
        <p className="text-muted-foreground text-sm">
          Masukkan email Anda dan kami akan mengirimkan link untuk reset password
        </p>
      </div>

      <FieldGroup>
        {isSuccess ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <p className="text-sm">
                  Link reset password telah dikirim ke email Anda. Silakan periksa inbox dan spam folder.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setIsSuccess(false);
                  setEmail("");
                }}
              >
                Kirim Ulang
              </Button>

              <FieldDescription className="text-center">
                Ingat password kembali?{" "}
                <Link href="/auth/login" className="underline underline-offset-4">
                  Login
                </Link>
              </FieldDescription>
            </div>
          </div>
        ) : (
          <>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                disabled={isLoading}
              />
            </Field>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-800">
                <p className="text-sm">{error}</p>
              </div>
            )}

            <Field>
              <Button type="submit" disabled={isLoading} onClick={handleSubmit}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  "Kirim Link Reset Password"
                )}
              </Button>
            </Field>

            <FieldDescription className="text-center">
              Ingat password kembali?{" "}
              <Link href="/auth/login" className="underline underline-offset-4">
                Login
              </Link>
            </FieldDescription>
          </>
        )}
      </FieldGroup>
    </div>
  );
}