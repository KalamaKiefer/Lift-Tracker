import { Button } from "@/components/Button";

export default function ErrorPage({
    searchParams,
}: {
    searchParams: { message: string };
}) {
    return (
        <div className="flex flex-col gap-6 h-screen items-center justify-center">
            <div>
                <h1 className="font-ubuntu font-bold text-44 text-center">
                    Sorry!
                </h1>
                <p className="text-center text-18 font-quicksand">
                    {searchParams?.message
                        ? searchParams.message
                        : "Something went wrong on our end"}
                </p>
            </div>
            <Button href="/login">Try Again</Button>
        </div>
    );
}
