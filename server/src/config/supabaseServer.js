import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
  throw new Error(
    "SUPABASE_URL or SUPABASE_SECRET_KEY is missing from server/.env",
  );
}

// Admin client: bypasses RLS, so only use it on the server.
// Session options are off because the server has no user session of its own.
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

export default supabaseAdmin;
