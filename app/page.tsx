import { HomeHero } from "@/components/HomeHero";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Index() {
    const canInitSupabaseClient = () => {
        try {
            createClient();
            return true;
        } catch (e) {
            return false;
        }
    };

    const isSupabaseConnected = canInitSupabaseClient();

    if (!isSupabaseConnected) redirect("/error");

    const supabase = createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (user) return redirect("/home");

    return (
        <div className="h-svh">
            <HomeHero />
        </div>
    );
}
