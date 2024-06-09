import clsx from "clsx";

export const HamburgerButton = ({
    className,
    ...props
}: React.ComponentPropsWithoutRef<"button">) => {
    return (
        <button
            className={clsx(
                "flex h-10 w-10 flex-col items-center justify-center gap-y-2 group",
                className
            )}
            {...props}
        >
            <span className="sr-only">Toggle Menu</span>
            <div className="transition duration-150 ease-linear group-data-[state=open]:translate-y-[5px] group-data-[state=closed]:delay-150">
                <div className="h-0.5 w-5 rounded-full bg-matteBlack delay-150 duration-150 ease-linear group-data-[state=open]:rotate-45 group-data-[state=closed]:delay-0 md:w-6" />
            </div>

            <div className="transition duration-150 ease-linear group-data-[state=open]:-translate-y-[5px] group-data-[state=closed]:delay-150">
                <div className="h-0.5 w-5 rounded-full bg-matteBlack delay-150 duration-150 ease-linear group-data-[state=open]:-rotate-45 group-data-[state=closed]:delay-0 md:w-6" />
            </div>
        </button>
    );
};
