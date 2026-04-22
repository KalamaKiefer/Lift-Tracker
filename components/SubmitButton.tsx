"use client";

import { useFormStatus } from "react-dom";
import { type ComponentProps } from "react";
import { Spinner } from "@/components/icons/Spinner";

export function SubmitButton({ children, ...props }: ComponentProps<"button">) {
  const { pending } = useFormStatus();

  return (
    <button
      {...props}
      type="submit"
      aria-disabled={pending}
      className="border w-full cursor-pointer lg:w-auto rounded-2xl border-matteBlack px-16 py-3 font-quicksand font-semibold text-18 hover:bg-linear-to-r from-teal-400 via-purple-400 to-green-400 bg-clip-border hover:border-transparent animate-text ease-out duration-200 hover:text-white/80"
    >
      {pending ? <Spinner className="text-black w-6 mx-auto" /> : children}
    </button>
  );
}
