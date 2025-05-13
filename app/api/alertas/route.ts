import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// GET - Obtener todas las alertas
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const searchParams = request.nextUrl.searchParams
    const tipo = searchParams.get("tipo") || ""
    const resuelta = searchParams.get("resuelta") || "false"
    const prioridad = searchParams.get("prioridad") || ""

    let alertasQuery = supabase.from("alertas").select(`
        *,
        clientes(id, nombre),
        contratos(id)
      `)

    // Aplicar filtros si se proporcionan
    if (tipo) {
      alertasQuery = alertasQuery.eq("tipo", tipo)
    }

    if (resuelta) {
      alertasQuery = alertasQuery.eq("resuelta", resuelta === "true")
    }

    if (prioridad) {
      alertasQuery = alertasQuery.eq("prioridad", prioridad)
    }

    const { data, error } = await alertasQuery.order("fecha", {
      ascending: false,
    })

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error al obtener alertas:", error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}

// POST - Crear una nueva alerta
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()

    const { data, error } = await supabase.from("alertas").insert([body]).select()

    if (error) throw error

    return NextResponse.json({ success: true, data: data[0] })
  } catch (error) {
    console.error("Error al crear alerta:", error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}
