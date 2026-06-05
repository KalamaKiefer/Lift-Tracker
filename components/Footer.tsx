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
        <span className="sr-only">{title}</span>
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

        <p className="mt-12 text-center text-base text-creme">
          &copy; 2026 Kiefer Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
