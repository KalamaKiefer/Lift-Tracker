import { Ubuntu, Quicksand } from "next/font/google";
import "./globals.css";
import clsx from "clsx";

const defaultUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

export const metadata = {
    metadataBase: new URL(defaultUrl),
    title: "Lift Tracker",
    description:
        "Web app that allows user to track lifts, see other users progress, create posts and comment on others posts.",
};

const ubuntu = Ubuntu({
    variable: "--font-ubuntu",
    subsets: ["latin"],
    display: "swap",
    weight: ["300", "400", "700"],
    style: ["italic", "normal"],
});

const quicksand = Quicksand({
    variable: "--font-quicksand",
    subsets: ["latin"],
    display: "swap",
    weight: "variable",
    style: ["normal"],
});

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={clsx(ubuntu.variable, quicksand.variable)}>
            <body>
                <main className="min-h-screen flex flex-col items-center">
                    {children}
                </main>
            </body>
        </html>
    );
}
