"use client";

import {
  BarbellIcon,
  CalendarIcon,
  FileTextIcon,
  NotebookIcon,
  SignOutIcon,
  XIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { HamburgerButton } from "./HamburgerButton";
import { createClient } from "@/utils/supabase/client";
import clsx from "clsx";

function useSignOut() {
  const router = useRouter();
  return async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };
}

const NAV_LINKS = [
  { href: "/workouts", label: "Workouts", icon: CalendarIcon },
  { href: "/workouts/new", label: "New Workout", icon: BarbellIcon },
  { href: "/", label: "Guides", icon: FileTextIcon },
];

const GreenBlob = ({ className }: { className?: string }) => (
  <div
    className={clsx(
      "absolute inset-x-0 -z-10 transform-gpu overflow-hidden",
      className,
    )}
    aria-hidden="true"
  >
    <div
      className="relative left-1/2 -z-10 aspect-1155/678 w-144.5 max-w-none -translate-x-1/2 rotate-30 bg-linear-to-tr from-green-primary to-green-primary opacity-30"
      style={{
        clipPath:
          "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
      }}
    />
  </div>
);

const MobileHeader = () => {
  const signOut = useSignOut();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <div className="flex items-center justify-between gap-10 py-4 lg:hidden relative">
        <Link href="/home" className="flex items-center gap-3">
          <NotebookIcon className="h-8 w-8 text-green-primary" />
          <span className="text-22 font-semibold font-ubuntu text-green-primary">
            Lift Tracker
          </span>
        </Link>

        <Dialog.Trigger asChild>
          <HamburgerButton className="-mr-2.5 -mt-1" />
        </Dialog.Trigger>
      </div>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm data-[state=open]:animate-overlay-show" />

        <Dialog.Content className="fixed inset-x-0 top-0 z-50 bg-white rounded-b-xl px-5 py-4 shadow-lg data-[state=open]:animate-content-show overflow-hidden">
          <GreenBlob className="-top-20 blur-xl" />

          <Dialog.Title className="sr-only">Navigation Menu</Dialog.Title>
          <Dialog.Description className="sr-only">
            Site navigation links and logout
          </Dialog.Description>

          <div className="flex items-center justify-between border-b border-black pb-3">
            <NotebookIcon className="h-8 w-8 text-green-primary" />
            <Dialog.Close asChild>
              <button className="text-matteBlack p-1" aria-label="Close menu">
                <XIcon className="w-6 h-6" />
              </button>
            </Dialog.Close>
          </div>

          <nav className="flex flex-col gap-5 mt-5">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Dialog.Close asChild key={href}>
                <Link
                  href={href}
                  className={clsx(
                    "font-ubunutu text-xl flex items-center gap-2 transition",
                    pathname === href
                      ? "text-green-primary font-semibold"
                      : "text-green-primary hover:opacity-70",
                  )}
                >
                  <Icon className="h-6 w-6 text-green-primary" />
                  <span>{label}</span>
                </Link>
              </Dialog.Close>
            ))}
          </nav>

          <Dialog.Close asChild>
            <button
              onClick={signOut}
              className="flex items-center gap-2 font-ubuntu text-green-primary text-xl mt-10 mb-4 hover:opacity-70 transition"
            >
              <SignOutIcon className="w-6 h-6" />
              <span>Log Out</span>
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default function Header() {
  const signOut = useSignOut();
  const pathname = usePathname();

  return (
    <header className="mx-auto max-w-7xl px-6 lg:px-14">
      <div className="relative items-center justify-between border-b-2 pb-3 pt-6 hidden lg:flex overflow-hidden gap-8">
        <GreenBlob className="-top-10 blur-xl" />

        <Link href="/home" className="shrink-0">
          <div className="flex flex-row justify-center items-center cursor-pointer duration-500 ease-in-out">
            <NotebookIcon className="h-14 w-14 mr-4 text-green-primary" />
            <h1 className="text-20 -m-2.5 lg:text-30 font-ubuntu text-green-primary">
              Lift Tracker
            </h1>
          </div>
        </Link>

        <nav className="flex items-center gap-20">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-2 font-ubuntu text-16 transition",
                pathname === href
                  ? "text-green-primary font-semibold"
                  : "text-green-primary/70 hover:text-green-primary",
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <button
          onClick={signOut}
          className="flex items-center gap-2 font-ubuntu text-green-primary cursor-pointer group shrink-0"
        >
          <SignOutIcon className="w-5 h-5 group-hover:-translate-x-1.5 transition duration-200" />
          <span className="text-16">Log Out</span>
        </button>
      </div>

      <MobileHeader />
    </header>
  );
}
