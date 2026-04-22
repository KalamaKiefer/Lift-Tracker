import "./globals.css";
import type { ReactNode } from "react";
import { Toaster } from "sonner";

const defaultUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";

export const metadata = {
    metadataBase: new URL(defaultUrl),
    title: "Lift Tracker",
    description:
        "Web app that allows user to track lifts, see other users progress, create posts and comment on others posts.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <body className="min-h-screen flex flex-col items-center">
                {children}
                <Toaster richColors position="top-center" />
            </body>
        </html>
    );
}
