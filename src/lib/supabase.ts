import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Standard client for front-end and public operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// You might need a service_role for some administrative 
// operations like bulk vector updates. 
// If it's not present, it will fallback to anonKey.
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
