"use client";

import { Barbell, Calendar, FileText, Notebook } from "@phosphor-icons/react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { HamburgerButton } from "./HamburgerButton";

const MobileHeader = () => {
    return (
        <Dialog.Root>
            <div className="flex items-center justify-between gap-10 py-4 lg:hidden relative">
                <Link href={"/home"} className="flex items-center gap-3">
                    <Notebook className="h-8 w-8 text-green-primary" />
                    <span className="text-22 font-semibold font-ubuntu text-green-primary">
                        Lift Tracker
                    </span>
                </Link>

                <Dialog.Trigger className="lg:hidden" asChild>
                    <HamburgerButton className="z-30 -mr-2.5 -mt-1 lg:hidden pointer-events-auto" />
                </Dialog.Trigger>
            </div>

            <Dialog.Overlay className="fixed inset-0 z-10 bg-black/50 backdrop-blur-sm data-[state=open]:animate-overlay-show" />

            <Dialog.Content className="fixed inset-y-0 bg-white h-[400px] right-0 z-10 w-full px-5 py-4 sm:ring-1 sm:ring-gray-900/10 data-[state=open]:animate-content-show rounded-b-xl">
                <div
                    className="absolute inset-x-0 top-[-5rem] -z-10 transform-gpu overflow-hidden blur-xl sm:hidden"
                    aria-hidden="true"
                >
                    <div
                        className="relative left-1/2 -z-10 aspect-[1155/678] w-[36.125rem] max-w-none -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#606c38] to-[#606c38] opacity-50 sm:left-[calc(50%-40rem)] sm:w-[72.1875rem]"
                        style={{
                            clipPath:
                                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                        }}
                    />
                </div>
                <div className="border-b-black border-b pb-2">
                    <Notebook className="h-8 w-8 text-green-primary" />
                </div>
                <nav className="flex flex-col gap-5 mt-5">
                    <Link
                        href="/"
                        className="scroll-smooth font-ubuntu text-green-primary text-xl"
                    >
                        <Calendar className="h-6 w-6 text-green-primary" />
                        <span>Calendar</span>
                    </Link>

                    <Link
                        href="/"
                        className="font-ubuntu text-green-primary text-xl"
                    >
                        <Barbell className="w-6 h-6 text-green-primary" />
                        <span>Create a New Workout</span>
                    </Link>
                    <Link
                        href="/"
                        className="scroll-smooth font-ubuntu text-green-primary text-xl"
                    >
                        <FileText className="w-6 h-6 text-green-primary" />
                        <span>Guides</span>
                    </Link>
                </nav>

                <button className="h-10 w-10 bg-black rounded-full absolute bottom-10 left-10"></button>
            </Dialog.Content>
        </Dialog.Root>
    );
};

export default function Header() {
    return (
        <header className="mx-auto max-w-7xl px-6 lg:px-14">
            <div className="items-center justify-between border-b-2 pb-3 pt-6 md:justify-start md:space-x-10 hidden lg:flex">
                <div className="flex justify-start lg:w-0 lg:flex-1">
                    <Link href="/home">
                        <div className="flex flex-row justify-center items-center hover:text-blue-60 cursor-grab duration-500 ease-in-out">
                            <Notebook className="h-14 w-14 mr-4 text-green-primary" />
                            <h1 className="text-20 -m-2.5 lg:text-30 font-ubuntu text-green-primary">
                                Lift Tracker
                            </h1>
                        </div>
                    </Link>
                </div>
            </div>

            <MobileHeader />
        </header>
    );
}
