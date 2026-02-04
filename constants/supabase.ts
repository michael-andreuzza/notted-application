// Supabase configuration for Notted app
// These are safe to expose in the app (anon key + RLS protects data)

export const SUPABASE_URL = "https://tehncfbvkbnjhpkxgfjq.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_jIcKKJQjwJUJJ48dcglutg_J1rqT3tZ";

// Edge function endpoints
export const RESTORE_ENDPOINT = `${SUPABASE_URL}/functions/v1/restore`;
