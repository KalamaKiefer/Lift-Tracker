"use server";

import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

const emailSchema = z.string();
const passwordSchema = z.string();

export const signIn = async (formData: FormData) => {
    const supabase = createClient();

    const parseEmail = emailSchema.safeParse(formData.get("email"));
    const parsePassword = passwordSchema.safeParse(formData.get("password"));

    if (!parseEmail.success || !parsePassword.success) {
        return redirect(
            "/error?message=Error: Please provide a valid email or password."
        );
    }

    const email = parseEmail.data;
    const password = parsePassword.data;

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return redirect("/error?message=Error: could not authenticate user.");
    }

    return redirect("/protected");
};

export const signUp = async (formData: FormData) => {
    const supabase = createClient();
    const origin = headers().get("origin");

    const parseEmail = emailSchema.safeParse(formData.get("email"));
    const parsePassword = passwordSchema.safeParse(formData.get("password"));

    if (!parseEmail.success || !parsePassword.success) {
        return redirect(
            "/error?message=Error: Please provide a valid email or password."
        );
    }

    const email = parseEmail.data;
    const password = parsePassword.data;

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${origin}/auth/callback`,
        },
    });

    if (error) {
        return redirect("/error?message=Error: could not sign up new user.");
    }

    return redirect("/protected");
};
