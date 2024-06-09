type FooterProps = {
    href: string;
    title: string;
};

const FooterNavItem = ({ href, title }: FooterProps) => {
    return (
        <div className="px-5 py-2">
            <a
                href={href}
                className="text-base text-creme hover:text-gray-900 duration-300 ease-in-out"
            >
                {title}
            </a>
        </div>
    );
};

export const Footer = () => {
    return (
        <footer className="bg-matteBlack mt-auto">
            <div className="mx-auto max-w-7xl overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
                <nav
                    className="-mx-5 -my-2 flex flex-wrap justify-center"
                    aria-label="Footer"
                >
                    <FooterNavItem href="/calendar" title="Calendar" />
                    <FooterNavItem href="/guides" title="Guides" />
                    <FooterNavItem href="/workouts" title="Workouts" />
                </nav>
                <div className="mt-8 flex justify-center space-x-6">
                    <a
                        href={"github.com"}
                        className="text-creme hover:text-gray-500 duration-500 ease-in-out"
                    >
                        <span className="sr-only">github</span>
                    </a>
                    <a
                        href={"github.com"}
                        className="text-creme hover:text-gray-500 duration-500 ease-in-out"
                    >
                        <span className="sr-only">Instagram</span>
                    </a>
                    <a
                        href={"github.com"}
                        className="text-creme hover:text-gray-500 duration-500 ease-in-out"
                    >
                        <span className="sr-only">Linkdin</span>
                    </a>
                </div>
                <p className="mt-8 text-center text-base text-creme">
                    &copy; 2022 Kiefer Inc. All rights reserved.
                </p>
            </div>
        </footer>
    );
};
