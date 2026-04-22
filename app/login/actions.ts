"use server";

import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

const emailSchema = z.string().email();
const passwordSchema = z.string().min(8);
const usernameSchema = z.string().min(2).max(30);

export const signIn = async (formData: FormData) => {
    const supabase = await createClient();

    const parseEmail = emailSchema.safeParse(formData.get("email"));
    const parsePassword = passwordSchema.safeParse(formData.get("password"));

    if (!parseEmail.success || !parsePassword.success) {
        return redirect("/error?message=Please provide a valid email and password.");
    }

    const { error } = await supabase.auth.signInWithPassword({
        email: parseEmail.data,
        password: parsePassword.data,
    });

    if (error) {
        return redirect("/error?message=Invalid email or password.");
    }

    return redirect("/home");
};

export const signUp = async (formData: FormData) => {
    const supabase = await createClient();
    const headerStore = await headers();
    const origin = headerStore.get("origin");

    const parseUsername = usernameSchema.safeParse(formData.get("username"));
    const parseEmail = emailSchema.safeParse(formData.get("email"));
    const parsePassword = passwordSchema.safeParse(formData.get("password"));

    if (!parseEmail.success || !parsePassword.success || !parseUsername.success) {
        return redirect("/error?message=Please provide a valid username, email, and password (8+ characters).");
    }

    const { error } = await supabase.auth.signUp({
        email: parseEmail.data,
        password: parsePassword.data,
        options: {
            data: { username: parseUsername.data },
            emailRedirectTo: `${origin}/auth/callback`,
        },
    });

    if (error) {
        return redirect("/error?message=Could not create account. The email may already be in use.");
    }

    return redirect("/home");
};
