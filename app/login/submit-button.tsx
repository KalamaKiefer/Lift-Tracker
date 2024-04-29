"use client";

import { useFormStatus } from "react-dom";
import { type ComponentProps } from "react";

type Props = ComponentProps<"button"> & {
    pendingText?: string;
};

export function SubmitButton({ children, pendingText, ...props }: Props) {
    const { pending, action } = useFormStatus();

    const isPending = pending && action === props.formAction;

    return (
        <button
            {...props}
            type="submit"
            aria-disabled={pending}
            className="border w-full lg:w-auto rounded-2xl border-black px-16 py-3 font-quicksand font-semibold text-18 hover:bg-gradient-to-r from-teal-400 via-purple-400 to-green-400 bg-clip-border hover:border-transparent animate-text ease-out duration-200 hover:text-white/80"
        >
            {isPending ? pendingText : children}
        </button>
    );
}
