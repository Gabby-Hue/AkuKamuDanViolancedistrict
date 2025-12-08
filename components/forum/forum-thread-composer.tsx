"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { ForumCategory, ForumThreadSummary } from "@/lib/queries/types";
import {
  CheckCircle2,
  ChevronDown,
  PenSquare,
  MessageSquarePlus,
  Sparkles,
} from "lucide-react";

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .substring(0, 60);
}

type ForumThreadComposerProps = {
  categories: ForumCategory[];
  onThreadCreated?: (thread: ForumThreadSummary) => void;
};

export function ForumThreadComposer({
  categories,
  onThreadCreated,
}: ForumThreadComposerProps) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<string | "">("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      setIsAuthenticated(Boolean(data.user));
    };

    checkAuth();
  }, []);

  const categoryOptions = useMemo(() => {
    return [...categories].sort((a, b) => a.name.localeCompare(b.name));
  }, [categories]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) {
      toast.info("Judul diperlukan", {
        description: "Tulis judul yang jelas untuk memulai diskusi.",
      });
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.info("Perlu login", {
        description: "Masuk dulu sebelum membuat thread baru.",
      });
      return;
    }
    setShowConfirm(true);
  };

  if (isAuthenticated === null) {
    return (
      <div className="space-y-3">
        <span className="block h-14 w-full animate-pulse rounded-3xl bg-slate-200/80 dark:bg-slate-800/60" />
        <span className="block h-24 w-full animate-pulse rounded-3xl bg-slate-200/70 dark:bg-slate-800/60" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <MessageSquarePlus className="h-12 w-12 text-brand" />
            </div>
            <div>
              <CardTitle className="text-lg">Mulai Diskusi Baru</CardTitle>
              <CardDescription className="mt-2">
                Masuk sebagai member untuk membuat thread baru, menandai
                favorit, dan mengikuti topik komunitas.
              </CardDescription>
            </div>
            <Link href="/auth/login">
              <Button className="rounded-full">Login & Mulai Diskusi</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const guidelinesItems = [
    {
      title: "Mulai dengan konteks jelas",
      description:
        "Tulis satu kalimat pembuka yang menjelaskan situasi tim atau pertanyaan utama kamu.",
    },
    {
      title: "Gunakan kategori & tag",
      description:
        "Pilih kategori paling relevan dan tambahkan 2-3 tag agar diskusi mudah ditemukan.",
    },
    {
      title: "Beri detail actionable",
      description:
        "Ceritakan pengalaman, jadwal latihan, atau hambatan supaya komunitas bisa memberi jawaban spesifik.",
    },
  ];

  const guidelinesPanel = (
    <Card className="border-brand/20 bg-gradient-to-br from-white via-white/90 to-[hsl(var(--brand-soft))]/25">
      <CardHeader>
        <div className="flex items-start gap-3"></div>
      </CardHeader>
      <CardContent className="space-y-4">
        {guidelinesItems.map((item) => (
          <div
            key={item.title}
            className="flex gap-3 rounded-2xl bg-white/70 p-3 shadow-inner shadow-slate-200/40 dark:bg-slate-900/60"
          >
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-brand flex-shrink-0" />
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                {item.title}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {item.description}
              </p>
            </div>
          </div>
        ))}
        <p className="text-xs text-slate-500 dark:text-slate-400 pt-2">
          Setelah dipublikasikan, thread akan dipantau moderator. Revisi bisa
          dilakukan melalui komentar.
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {showConfirm && (
        <PublishConfirmDialog
          title={title}
          body={body}
          tags={tags}
          onCancel={() => setShowConfirm(false)}
          onConfirm={async () => {
            setIsSubmitting(true);
            const supabase = createClient();
            const {
              data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
              toast.info("Sesi habis", {
                description: "Masuk kembali sebelum menerbitkan thread.",
              });
              setIsSubmitting(false);
              setShowConfirm(false);
              setIsAuthenticated(false);
              return;
            }

            const normalizedTags = tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
              .map((tag) => tag.replace(/^#/g, ""));

            const slugBase = slugify(title);
            const slug = `${slugBase}-${Math.random().toString(36).slice(2, 8)}`;
            const trimmedBody = body.trim();
            const excerpt = trimmedBody.slice(0, 160) || null;

            type InsertedThreadRow = {
              id: string;
              slug: string;
              title: string;
              excerpt: string | null;
              created_at: string;
              reply_count: number | null;
              tags: string[] | null;
              category: {
                id: string;
                slug: string;
                name: string;
                created_at: string;
              } | null;
              author: { full_name: string | null } | null;
            };

            const { data, error } = await supabase
              .from("forum_threads")
              .insert({
                slug,
                title: title.trim(),
                body: trimmedBody || null,
                excerpt,
                category_id: categoryId || null,
                author_profile_id: user.id,
                tags: normalizedTags,
              })
              .select(
                `id, slug, title, excerpt, created_at, reply_count, tags,
                 category:forum_categories(id, slug, name, created_at),
                 author:profiles(full_name)`,
              )
              .maybeSingle();

            const threadRow = (data ?? null) as InsertedThreadRow | null;

            if (error || !threadRow) {
              console.error("Failed to create forum thread", error?.message);
              toast.error("Gagal membuat thread", {
                description: error?.message ?? "Terjadi kesalahan tak terduga.",
              });
              setIsSubmitting(false);
              setShowConfirm(false);
              return;
            }

            const newThread: ForumThreadSummary = {
              id: threadRow.id,
              slug: threadRow.slug,
              title: threadRow.title,
              excerpt: threadRow.excerpt ?? null,
              reply_count: Number(threadRow.reply_count ?? 0),
              created_at: threadRow.created_at,
              tags: Array.isArray(threadRow.tags) ? threadRow.tags : [],
category: threadRow.category
  ? {
      id: threadRow.category.id,
      slug: threadRow.category.slug,
      name: threadRow.category.name,
      createdAt: threadRow.category.created_at,
    }
  : null,

              author_name: threadRow.author?.full_name ?? null,
              latestReplyBody: null,
              latestReplyAt: null,
              reviewCourt: null,
            };

            setTitle("");
            setBody("");
            setTags("");
            setCategoryId("");

            onThreadCreated?.(newThread);
            toast.success("Thread baru ditayangkan", {
              description: "Diskusi kamu sudah bisa dilihat komunitas.",
            });
            setIsSubmitting(false);
            setExpanded(false);
            setShowConfirm(false);
            router.push(`/forum/${newThread.slug}`);
          }}
          isLoading={isSubmitting}
        />
      )}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <CardHeader className="px-0 pt-0 pb-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <Badge variant="secondary" className="w-fit text-xs">
                    Mulai Diskusi
                  </Badge>
                  <CardTitle className="text-xl">
                    Bagikan Pertanyaan atau Tips Kamu
                  </CardTitle>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpanded((prev) => !prev)}
                  className="rounded-full"
                >
                  {expanded ? "Sembunyikan Detail" : "Atur Detail Lanjutan"}
                  <Sparkles className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="px-0 pb-0 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Judul Thread
                </label>
                <Input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  onFocus={() => setExpanded(true)}
                  placeholder="Contoh: Strategi conditioning futsal menjelang turnamen"
                  className="text-base"
                />
              </div>

              {expanded && (
                <div className="space-y-6 animate-in slide-in-from-top-2 duration-200">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Kategori
                      </label>
                      <Select value={categoryId} onValueChange={setCategoryId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryOptions.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Tag (pisahkan dengan koma)
                      </label>
                      <Input
                        type="text"
                        value={tags}
                        onChange={(event) => setTags(event.target.value)}
                        placeholder="futsal, conditioning, latihan"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Ceritakan Detailnya
                    </label>
                    <Textarea
                      value={body}
                      onChange={(event) => setBody(event.target.value)}
                      placeholder="Tulis penjelasan lengkap supaya komunitas bisa membantu dengan maksimal..."
                      className="min-h-[140px] resize-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {expanded
                    ? `${body.trim().length} karakter`
                    : "Judul yang jelas membantu diskusi lebih fokus."}
                </span>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full"
                >
                  {isSubmitting ? "Menerbitkan..." : "Terbitkan Thread"}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>

        <div className="hidden lg:block">{guidelinesPanel}</div>
      </div>
      <div className="lg:hidden">
        <details className="group overflow-hidden rounded-3xl border border-brand/20 bg-white/90 shadow-sm transition dark:border-brand/40 dark:bg-slate-900/70">
          <summary className="flex cursor-pointer items-center justify-between gap-3 px-6 py-4 text-sm font-semibold text-slate-700 marker:hidden dark:text-slate-200">
            <span>Panduan menulis thread</span>
            <ChevronDown className="h-4 w-4 text-brand-strong transition group-open:rotate-180" />
          </summary>
          <div className="border-t border-brand/10 px-6 py-5 dark:border-brand/20">
            {guidelinesPanel}
          </div>
        </details>
      </div>
    </div>
  );
}

function PublishConfirmDialog({
  title,
  body,
  tags,
  onConfirm,
  onCancel,
  isLoading,
}: {
  title: string;
  body: string;
  tags: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const previewBody =
    body.trim() ||
    "Bagikan detail lengkapmu agar komunitas dapat merespons dengan tepat.";
  const normalizedTags = tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => tag.replace(/^#/g, ""));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-10">
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={onCancel}
      />
      <Card className="relative w-full max-w-lg border-brand/30 bg-white/95 shadow-2xl dark:bg-slate-950/90">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-strong text-white shadow-lg shadow-brand/30">
              <PenSquare className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Terbitkan Thread Sekarang?</CardTitle>
              <CardDescription>
                Thread yang diterbitkan tidak bisa dihapus, tetapi kamu dapat
                menambahkan klarifikasi lewat balasan.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 rounded-2xl border border-slate-200/60 bg-slate-50/60 p-4 dark:border-slate-700/40 dark:bg-slate-900/60">
            <div>
              <Badge variant="secondary" className="text-xs">
                Judul
              </Badge>
              <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                {title.trim() || "Tanpa Judul"}
              </p>
            </div>
            <div>
              <Badge variant="secondary" className="text-xs">
                Ringkasan
              </Badge>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {previewBody.slice(0, 200)}
              </p>
            </div>
            {normalizedTags.length > 0 && (
              <div>
                <Badge variant="secondary" className="text-xs mb-2">
                  Tag
                </Badge>
                <div className="flex flex-wrap gap-2">
                  {normalizedTags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-full"
          >
            Batal
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-full"
          >
            {isLoading ? "Menerbitkan..." : "Ya, Terbitkan"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
