export const ArrowIcon = (props: React.ComponentPropsWithoutRef<"svg">) => {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <polyline points="15 18 9 12 15 6" />
        </svg>
    );
};
