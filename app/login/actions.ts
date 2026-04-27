"use server";

import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

const emailSchema = z.email();
const passwordSchema = z.string().min(8);
const usernameSchema = z.string().min(2).max(30);

export type ActionState = { error: string } | null;

export const signIn = async (
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const supabase = await createClient();

  const parseEmail = emailSchema.safeParse(formData.get("email"));
  if (!parseEmail.success)
    return { error: "Please enter a valid email address." };

  const parsePassword = passwordSchema.safeParse(formData.get("password"));
  if (!parsePassword.success)
    return { error: "Password must be at least 8 characters." };

  const { error } = await supabase.auth.signInWithPassword({
    email: parseEmail.data,
    password: parsePassword.data,
  });

  if (error) return { error: "Invalid email or password." };

  redirect("/home");
};

export const signUp = async (
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const supabase = await createClient();
  const headerStore = await headers();
  const origin = headerStore.get("origin");

  const parseUsername = usernameSchema.safeParse(formData.get("username"));
  if (!parseUsername.success)
    return { error: "Username must be between 2 and 30 characters." };

  const parseEmail = emailSchema.safeParse(formData.get("email"));
  if (!parseEmail.success)
    return { error: "Please enter a valid email address." };

  const parsePassword = passwordSchema.safeParse(formData.get("password"));
  if (!parsePassword.success)
    return { error: "Password must be at least 8 characters." };

  const { error } = await supabase.auth.signUp({
    email: parseEmail.data,
    password: parsePassword.data,
    options: {
      data: { username: parseUsername.data },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes("already registered"))
      return { error: "An account with this email already exists." };
    return { error: "Could not create account. Please try again." };
  }

  redirect("/home");
};
