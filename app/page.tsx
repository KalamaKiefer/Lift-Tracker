import { HomeHero } from "@/components/HomeHero";
import { createClient } from "@/utils/supabase/server";

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

    return (
        <div className="h-svh">
            <HomeHero />
        </div>
    );
}
