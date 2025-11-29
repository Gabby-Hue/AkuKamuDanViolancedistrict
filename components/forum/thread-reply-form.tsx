"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { ForumReply } from "@/lib/supabase/queries/forum";

const textareaClassName =
  "min-h-[120px] w-full rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 text-sm text-slate-700 shadow-sm transition focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/40 dark:border-slate-700/80 dark:bg-slate-900/70 dark:text-slate-100";

type ThreadReplyFormProps = {
  threadId: string;
  onReplyCreated?: (reply: ForumReply) => void;
};

export function ThreadReplyForm({
  threadId,
  onReplyCreated,
}: ThreadReplyFormProps) {
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsAuthenticated(Boolean(user));
    };

    fetchSession();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!body.trim()) {
      toast.info("Balasan kosong", {
        description: "Tulis pesan sebelum mengirim balasan.",
      });
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.info("Perlu login", {
        description: "Masuk dulu untuk ikut berdiskusi.",
      });
      setIsSubmitting(false);
      return;
    }

    type ReplyRow = {
      id: string;
      body: string;
      created_at: string;
      author: { full_name: string | null } | null;
    };

    const { data, error } = await supabase
      .from("forum_replies")
      .insert({
        thread_id: threadId,
        author_profile_id: user.id,
        body: body.trim(),
      })
      .select("id, body, created_at, author:profiles(full_name)")
      .maybeSingle();

    const replyRow = (data ?? null) as ReplyRow | null;

    if (error || !replyRow) {
      const errorMessage = error?.message ?? "Terjadi kesalahan tak terduga.";
      console.error("Failed to create reply", errorMessage);
      toast.error("Gagal mengirim balasan", {
        description: errorMessage,
      });
      setIsSubmitting(false);
      return;
    }

    const mappedReply: ForumReply = {
      id: replyRow.id,
      body: replyRow.body,
      created_at: replyRow.created_at,
      author_name: replyRow.author?.full_name ?? null,
    };

    setBody("");
    toast.success("Balasan terkirim", {
      description: "Diskusi kamu sudah tayang.",
    });
    setIsSubmitting(false);
    onReplyCreated?.(mappedReply);
  };

  if (isAuthenticated === null) {
    return (
      <div className="space-y-3">
        <span
          className="block h-24 w-full animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-800/60"
          aria-hidden="true"
        />
        <span
          className="block h-10 w-40 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-800/60"
          aria-hidden="true"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200/80 bg-white/80 p-6 text-sm text-slate-600 dark:border-slate-700/80 dark:bg-slate-900/60 dark:text-slate-300">
        <p className="font-semibold text-slate-800 dark:text-slate-100">
          Ingin ikut nimbrung?
        </p>
        <p className="mt-1">
          Masuk terlebih dahulu untuk menambahkan balasan ke thread ini.
        </p>
        <Link
          href="/auth/login"
          className="mt-4 inline-flex items-center rounded-full bg-brand px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-brand"
        >
          Login sekarang
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-slate-700/80 dark:bg-slate-900/70"
    >
      <div className="space-y-2">
        <label
          htmlFor="reply"
          className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400"
        >
          Balas thread ini
        </label>
        <textarea
          id="reply"
          name="reply"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Bagikan pengalaman atau pertanyaanmu di sini..."
          className={textareaClassName}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>{body.trim().length} karakter</span>
        <Button
          type="submit"
          className="bg-brand text-white transition hover:bg-brand"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Mengirim..." : "Kirim balasan"}
        </Button>
      </div>
    </form>
  );
}
