"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { AppRole } from "@/lib/supabase/roles";

const DASHBOARD_BY_ROLE: Record<AppRole, string> = {
  admin: "/dashboard/admin",
  venue_partner: "/dashboard/venue",
  user: "/",
};

export function LoginForm({
  className,
  redirectTo,
  ...props
}: React.ComponentProps<"form"> & { redirectTo?: string | null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!email || !password) {
      toast.error("Email dan password wajib diisi");
      return;
    }

    const supabase = createClient();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error("Login failed: No user returned");
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Failed to load profile role", profileError.message);
        // Continue with default role if profile lookup fails
      }

      const role = (profile?.role as AppRole | null) ?? "user";

      if (!profile) {
        await supabase
          .from("profiles")
          .upsert({ id: user.id, role: role })
          .select("role")
          .maybeSingle();
      }

      // Use custom redirect URL if provided, otherwise use role-based default
      const redirectUrl =
        redirectTo ?? DASHBOARD_BY_ROLE[role] ?? DASHBOARD_BY_ROLE.user;

      router.replace(redirectUrl);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error("Tidak dapat masuk", {
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Masuk ke akun anda</h1>
          <p className="text-muted-foreground text-sm">
            Masuk untuk melanjutkan pemesanan lapangan atau ikuti diskusi
            komunitas.
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            autoComplete="email"
            required
            disabled={isLoading}
          />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            disabled={isLoading}
          />
        </Field>
        <Field>
          <Button
            type="submit"
            className="bg-orange-500 dark:bg-teal-500 hover:bg-orange-600 dark:hover:bg-teal-600 text-white"
            disabled={isLoading}
          >
            {isLoading ? "Memproses..." : "Login"}
          </Button>
        </Field>
        <Field>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="underline underline-offset-4"
            >
              Sign up
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
