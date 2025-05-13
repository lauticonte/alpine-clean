import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// GET - Obtener todos los baños
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const searchParams = request.nextUrl.searchParams
    const estado = searchParams.get("estado") || ""
    const query = searchParams.get("query") || ""

    let banosQuery = supabase.from("banos").select("*")

    // Filtrar por estado si se proporciona
    if (estado) {
      banosQuery = banosQuery.eq("estado", estado)
    }

    // Filtrar por ID si hay un término de búsqueda
    if (query) {
      banosQuery = banosQuery.ilike("id", `%${query}%`)
    }

    const { data, error } = await banosQuery.order("id")

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error al obtener baños:", error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}

// POST - Crear un nuevo baño
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()

    const { data, error } = await supabase.from("banos").insert([body]).select()

    if (error) throw error

    return NextResponse.json({ success: true, data: data[0] })
  } catch (error) {
    console.error("Error al crear baño:", error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}
