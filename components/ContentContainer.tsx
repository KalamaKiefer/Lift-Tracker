import clsx from "clsx";

export interface ContentContainerProps
    extends React.ComponentPropsWithoutRef<"section"> {}

export const ContentContainer = ({
    className,
    children,
    ...props
}: ContentContainerProps) => {
    return (
        <div className="w-full mx-auto max-w-7xl h-full">
            <section
                className={clsx(
                    "py-10 px-6 lg:py-[80px] lg:px-14 xl:py-20",
                    className
                )}
                {...props}
            >
                {children}
            </section>
        </div>
    );
};
