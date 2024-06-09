import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export const WorkoutCallToAction = async () => {
    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    return (
        <div
            className="rounded-md bg-black/80
    w-full h-[350px] aspect-square flex flex-col justify-center text-center px-6"
        >
            <div>
                <h1 className="text-24 sm:text-35 leading-none lg:text-54 font-ubuntu uppercase text-creme">
                    {user
                        ? `Start Now ${user.user_metadata.username}!`
                        : "Start Now!"}
                </h1>
                <p className="text-16 sm:text-18 font-quicksand text-creme max-w-[500px] mx-auto mt-2">
                    Create a workout now so you can save that workout and track
                    your progress!
                </p>
            </div>
            <Link
                href="/workouts"
                className="ml-auto mr-auto inline-flex items-center justify-center rounded-md border border-transparent 
      bg-green-primary py-2 text-base font-medium text-creme shadow-sm hover:brightness-110 transition mt-6 uppercase px-6 duration-500 ease-in-out"
            >
                Create A Workout
            </Link>
        </div>
    );
};
