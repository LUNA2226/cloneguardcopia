import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// Ensure your environment variables are set in Vercel
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL")
}
if (!supabaseServiceRoleKey) {
  throw new Error("Missing env.SUPABASE_SERVICE_ROLE_KEY")
}

// Note: this is a server-side client, so it's okay to use the service role key.
// For client-side, you'd use the anon key.
const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    // autoRefreshToken: false, // Optional: configure as needed
    // persistSession: false, // Optional: configure as needed
  },
})

export default supabaseAdmin
