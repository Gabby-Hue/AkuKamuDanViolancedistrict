"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { MailIcon } from "lucide-react";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get("full_name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!fullName) {
      toast.error("Nama lengkap wajib diisi");
      return;
    }

    if (!email || !password) {
      toast.error("Email dan password wajib diisi");
      return;
    }

    const supabase = createClient();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        throw error;
      }

      const user = data.user;

      if (user) {
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: user.id,
          full_name: fullName,
          role: "user",
        });

        if (profileError) {
          console.error("Failed to upsert profile", profileError.message);
        }

        toast.success("Akun berhasil dibuat", {
          description: "Anda sudah dapat masuk menggunakan akun tersebut.",
        });
        router.replace("/auth/login");
        return;
      }

      toast.success("Registrasi berhasil", {
        description: "Silakan periksa email Anda untuk konfirmasi.",
      });
      router.replace("/auth/login");
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan tak terduga";
      toast.error("Tidak dapat membuat akun", {
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
          <h1 className="text-2xl font-bold">Buat akun baru</h1>
          <p className="text-muted-foreground text-sm">
            Daftar untuk memulai pemesanan lapangan atau bergabung dengan
            komunitas.
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="full_name">Nama lengkap</FieldLabel>
          <Input
            id="full_name"
            name="full_name"
            placeholder="Nama lengkap"
            autoComplete="name"
            required
            disabled={isLoading}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="phone">Nomor telepon</FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              <InputGroupText>+62</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              id="phone"
              name="phone"
              type="tel"
              placeholder="81234567890"
              autoComplete="tel"
              required
              disabled={isLoading}
              className="gap-2"
            />
          </InputGroup>
        </Field>
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
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            disabled={isLoading}
          />
        </Field>
        <Field>
          <Button
            type="submit"
            className="bg-orange-500 dark:bg-teal-500 hover:bg-orange-600 dark:hover:bg-teal-600 dark:text-white"
            disabled={isLoading}
          >
            {isLoading ? "Memproses..." : "Daftar"}
          </Button>
        </Field>
        <FieldDescription className="text-center">
          Sudah punya akun?
          <Link
            href="/auth/login"
            className="ml-1 underline underline-offset-4"
          >
            Masuk
          </Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}
