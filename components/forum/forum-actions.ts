"use server";

import { revalidatePath } from "next/cache";

export async function refreshForumThread() {
  revalidatePath("/forum/[slug]", "page");
}