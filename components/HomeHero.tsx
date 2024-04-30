import Link from "next/link";
import { ContentContainer } from "./ContentContainer";
import { Button } from "./Button";

export const HomeHero = () => {
    return (
        <ContentContainer className="flex flex-col items-center justify-center relative h-full">
            <div className="flex flex-col items-center">
                <h1 className="font-ubuntu text-44 md:text-54 lg:text-66">
                    Welcome to
                </h1>
                <span className="bg-gradient-to-r from-teal-400 via-purple-400 to-green-400 bg-clip-text text-transparent animate-text font-ubuntu text-44 md:text-54 lg:text-66 -mt-4">
                    Lift Tracker
                </span>
            </div>

            <div
                className="absolute inset-x-0 top-[5rem] -z-10 transform-gpu overflow-hidden blur-xl lg:blur-3xl lg:top-[-10rem]"
                aria-hidden="true"
            >
                <div
                    className="relative left-1/2 -z-10 aspect-[1155/678] w-[36.125rem] max-w-none -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 lg:left-[calc(50%-40rem)] lg:w-[100.1875rem]"
                    style={{
                        clipPath:
                            "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                    }}
                />
            </div>

            <div className="mt-5 lg:mt-8 flex flex-col items-center lg:flex-row gap-4">
                <Button href="/login">Login</Button>
                <Button href="/signup">Sign Up</Button>
            </div>
        </ContentContainer>
    );
};
