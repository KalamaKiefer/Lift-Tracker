"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { SubmitButton } from "../../components/SubmitButton";
import { ArrowIcon } from "@/components/icons/Arrow";
import { Button } from "@/components/Button";
import { signIn } from "./actions";

export default function Login() {
  const [state, action] = useActionState(signIn, null);

  useEffect(() => {
    if (state?.error) toast.error(state.error);
  }, [state]);

  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">
      <Link
        href="/"
        className="absolute left-8 top-8 py-2 px-4 rounded-md no-underline text-foreground bg-btn-background hover:bg-btn-background-hover flex items-center group text-sm"
      >
        <ArrowIcon className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back
      </Link>

      <h1 className="font-ubuntu text-37 lg:text-62 text-center absolute left-1/2 -translate-x-1/2 top-48 lg:top-40 text-matteBlack">
        Lift Tracker
      </h1>

      <div className="relative w-full">
        <div
          className="absolute inset-x-0 top-20 -z-10 transform-gpu overflow-hidden blur-xl lg:blur-3xl lg:-top-120"
          aria-hidden="true"
        >
          <div
            className="relative left-1/2 -z-10 aspect-1155/678 w-144.5 max-w-none -translate-x-1/2 rotate-30 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 lg:left-[50%] lg:w-400.75"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>

        <form
          action={action}
          className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-shadow-matteBlack"
        >
          <label
            className="text-md font-quicksand font-semibold"
            htmlFor="email"
          >
            Email
          </label>

          <input
            className="rounded-md px-4 py-2 bg-inherit border-2 border-gray-200 mb-6 input-rainbow-focus transition ease-in-out duration-700"
            name="email"
            placeholder="you@example.com"
            type="email"
            required
          />

          <label
            className="text-md font-quicksand font-semibold"
            htmlFor="password"
          >
            Password
          </label>
          <input
            className="rounded-md px-4 py-2 bg-inherit border-2 border-gray-200 mb-6 input-rainbow-focus transition ease-in-out duration-700"
            type="password"
            name="password"
            placeholder="••••••••"
            required
          />

          <SubmitButton className="mt-3">Log In</SubmitButton>
          <Button href="/signup">Sign Up</Button>
        </form>
      </div>
    </div>
  );
}
