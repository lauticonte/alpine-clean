import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

// Crear un cliente de Supabase para el lado del servidor
export const createServerSupabaseClient = () => {
  const cookieStore = cookies()

  return createClient(
    process.env.SUPABASE_URL as string,
    process.env.SUPABASE_ANON_KEY as string,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    }
  )
}
