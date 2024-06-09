import { Ubuntu, Quicksand } from "next/font/google";
import { Footer } from "@/components/Footer";
import clsx from "clsx";
import Header from "@/components/Header";

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
        <div className={clsx(ubuntu.variable, quicksand.variable, "w-full")}>
            <Header />
            <main className="min-h-screen flex flex-col items-center">
                {children}
            </main>
            <Footer />
        </div>
    );
}
