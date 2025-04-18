import { createClient } from "@/utils/supabase/server"
 
export default async function getSession() {
    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session;
}
// This function retrieves the current session from Supabase.