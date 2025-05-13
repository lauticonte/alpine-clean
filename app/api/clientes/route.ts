import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// GET - Obtener todos los clientes
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get("query") || ""

    let clientesQuery = supabase.from("clientes").select("*")

    // Si hay un término de búsqueda, filtrar por nombre o CUIT
    if (query) {
      clientesQuery = clientesQuery.or(`nombre.ilike.%${query}%,cuit.ilike.%${query}%,direccion.ilike.%${query}%`)
    }

    const { data, error } = await clientesQuery.order("nombre")

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error al obtener clientes:", error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}

// POST - Crear un nuevo cliente
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()

    const { data, error } = await supabase.from("clientes").insert([body]).select()

    if (error) throw error

    return NextResponse.json({ success: true, data: data[0] })
  } catch (error) {
    console.error("Error al crear cliente:", error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}
