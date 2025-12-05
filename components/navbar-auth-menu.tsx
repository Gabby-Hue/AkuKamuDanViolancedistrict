"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  ArrowRight,
  LayoutDashboard,
  Loader2,
  LogOut,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

type NavbarAuthMenuProps = {
  variant?: "inline" | "stacked";
  onAction?: () => void;
};

type AuthenticatedUser = {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: string | null;
};

// Helper function to get dashboard URL based on user role
function getDashboardUrl(userRole: string | null): string {
  switch (userRole) {
    case "admin":
      return "/dashboard/admin";
    case "venue_partner":
      return "/dashboard/venue";
    case "user":
    default:
      return "/dashboard/user";
  }
}

export function NavbarAuthMenu({
  variant = "inline",
  onAction,
}: NavbarAuthMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const actionRef = useRef(onAction);

  useEffect(() => {
    actionRef.current = onAction;
  }, [onAction]);

  useEffect(() => {
    const supabase = createClient();
    let ignore = false;

    const hydrateUser = async () => {
      if (ignore) {
        return;
      }
      setLoading(true);
      try {
        const {
          data: { user: authUser },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          const isMissingSession =
            typeof error.message === "string" &&
            error.message.toLowerCase().includes("auth session missing");

          if (isMissingSession) {
            if (!ignore) {
              setUser(null);
              setLoading(false);
            }
            return;
          }

          console.error("Failed to fetch session", error.message);
          // Don't throw here, just continue with null user
        }

        if (!authUser) {
          if (!ignore) {
            setUser(null);
            setLoading(false);
          }
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", authUser.id)
          .maybeSingle();

        if (profileError) {
          console.error("Failed to fetch profile", profileError.message);
        }

        if (!ignore) {
          setUser({
            id: authUser.id,
            email: authUser.email ?? "",
            fullName:
              (profile?.full_name as string | null) ??
              (typeof authUser.user_metadata?.full_name === "string"
                ? (authUser.user_metadata.full_name as string)
                : null),
            avatarUrl: null,
            role: (profile?.role as string | null) ?? null,
          });
          setLoading(false);
        }
      } catch (error) {
        console.error("Failed to hydrate auth state", error);
        if (!ignore) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    void hydrateUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (ignore) {
          return;
        }

        if (!session) {
          setUser(null);
          setLoading(false);
          return;
        }

        void hydrateUser();
      },
    );

    const subscription = listener?.subscription;

    return () => {
      ignore = true;
      subscription?.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    if (signingOut) {
      return;
    }

    setSigningOut(true);
    const supabase = createClient();

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }

      setUser(null);
      router.refresh();
      if (actionRef.current) {
        actionRef.current();
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Tidak dapat keluar dari akun";
      toast.error("Gagal keluar", {
        description: message,
      });
    } finally {
      setSigningOut(false);
    }
  };

  const renderLoading = () => {
    if (variant === "stacked") {
      return <Skeleton className="h-32 w-full rounded-3xl" />;
    }
    return <Skeleton className="h-9 w-9 rounded-full" />;
  };

  const renderGuestActions = () => {
    if (variant === "stacked") {
      return (
        <div className="space-y-3 rounded-3xl border border-slate-200/80 bg-white/70 p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Bergabung dengan Courtease
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Masuk untuk mengatur booking atau daftar gratis sebagai venue
              partner.
            </p>
          </div>
          <div className="grid gap-2">
            <Button asChild className="w-full rounded-full">
              <Link
                href={`/auth/login?redirect=${encodeURIComponent(pathname)}`}
                onClick={() => {
                  actionRef.current?.();
                }}
              >
                Masuk
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full rounded-full border-brand/40 text-brand hover:border-brand hover:bg-brand/10 hover:text-brand-strong dark:border-brand/30 dark:text-brand dark:hover:bg-brand/20"
            >
              <Link
                href="/auth/register"
                onClick={() => {
                  actionRef.current?.();
                }}
              >
                Daftar Sekarang
              </Link>
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="hidden sm:flex items-center gap-2">
        <Button asChild variant="link">
          <Link href={`/auth/login?redirect=${encodeURIComponent(pathname)}`}>
            Masuk
          </Link>
        </Button>
        <Button asChild className="rounded-full px-6 text-sm font-semibold">
          <Link
            href={`/auth/register?redirect=${encodeURIComponent(pathname)}`}
          >
            Daftar
          </Link>
        </Button>
      </div>
    );
  };

  if (loading) {
    return renderLoading();
  }

  if (!user) {
    return renderGuestActions();
  }

  const initials =
    (user.fullName ?? user.email)?.charAt(0)?.toUpperCase() ?? "U";

  if (variant === "stacked") {
    return (
      <div className="space-y-3 rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/60">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 rounded-2xl">
            <AvatarImage alt={user.fullName ?? user.email} />
            <AvatarFallback className="rounded-2xl">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {user.fullName ?? "Pengguna Courtease"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {user.email}
            </p>
          </div>
        </div>
        <div className="grid gap-2">
          <Button asChild className="w-full rounded-full">
            <Link
              href={getDashboardUrl(user?.role ?? null)}
              onClick={() => {
                actionRef.current?.();
              }}
            >
              Buka Dashboard
              <LayoutDashboard className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="outline"
            className="w-full rounded-full border-red-200 text-red-600 hover:border-red-300 hover:bg-red-100 dark:border-red-500/40 dark:text-red-200 dark:hover:bg-red-500/10"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            {signingOut ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sedang
                keluar...
              </>
            ) : (
              <>
                <LogOut className="mr-2 h-4 w-4" /> Keluar
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="group flex items-center gap-3 rounded-full px-3 py-2 text-sm font-medium text-slate-600 hover:text-brand-strong dark:text-slate-300"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage alt={user.fullName ?? user.email} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="hidden text-left sm:block">
            <span className="block text-sm font-semibold text-slate-900 dark:text-white">
              {user.fullName ?? "Pengguna Courtease"}
            </span>
            <span className="block text-xs text-slate-500 dark:text-slate-400">
              {user.email}
            </span>
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 z-501">
        <DropdownMenuLabel className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
          Akun kamu
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href={getDashboardUrl(user?.role ?? null)}
            className="flex items-center gap-2"
          >
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/profile" className="flex items-center gap-2">
            <UserRound className="h-4 w-4" /> Profil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600 dark:text-red-400"
          onSelect={(event) => {
            event.preventDefault();
            void handleSignOut();
          }}
          disabled={signingOut}
        >
          {signingOut ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Keluar...
            </>
          ) : (
            <>
              <LogOut className="mr-2 h-4 w-4" /> Keluar
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
