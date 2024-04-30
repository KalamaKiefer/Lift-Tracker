import Link from "next/link";

export const Button = ({
    children,
    href,
    ...props
}: React.ComponentPropsWithoutRef<"button"> & { href?: string }) => {
    return (
        <>
            {href ? (
                <Link
                    href={href}
                    className="border w-full lg:w-auto text-center rounded-2xl border-black px-16 py-3 font-quicksand font-semibold text-18 hover:bg-gradient-to-r from-teal-400 via-purple-400 to-green-400 bg-clip-border hover:border-transparent animate-text ease-out duration-200 hover:text-white/80"
                >
                    {children}
                </Link>
            ) : (
                <button
                    className="border w-full lg:w-auto rounded-2xl border-black px-16 py-3 font-quicksand font-semibold text-18 hover:bg-gradient-to-r from-teal-400 via-purple-400 to-green-400 bg-clip-border hover:border-transparent animate-text ease-out duration-200 hover:text-white/80"
                    {...props}
                >
                    {children}
                </button>
            )}
        </>
    );
};
