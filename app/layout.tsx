import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

export const metadata = {
    metadataBase: new URL(defaultUrl),
    title: "Lift Tracker",
    description:
        "Web app that allows user to track lifts, see other users progress, create posts and comment on others posts.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html>
            <body className="min-h-screen flex flex-col items-center">
                {children}
            </body>
        </html>
    );
}
