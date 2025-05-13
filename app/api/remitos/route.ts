import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// GET - Obtener todos los remitos
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const searchParams = request.nextUrl.searchParams
    const clienteId = searchParams.get("cliente_id") || ""
    const contratoId = searchParams.get("contrato_id") || ""
    const tipo = searchParams.get("tipo") || ""
    const query = searchParams.get("query") || ""

    let remitosQuery = supabase.from("remitos").select(`
        *,
        clientes(id, nombre),
        contratos(id)
      `)

    // Aplicar filtros si se proporcionan
    if (clienteId) {
      remitosQuery = remitosQuery.eq("cliente_id", clienteId)
    }

    if (contratoId) {
      remitosQuery = remitosQuery.eq("contrato_id", contratoId)
    }

    if (tipo) {
      remitosQuery = remitosQuery.eq("tipo", tipo)
    }

    if (query) {
      remitosQuery = remitosQuery.or(`id.ilike.%${query}%,clientes.nombre.ilike.%${query}%`)
    }

    const { data, error } = await remitosQuery.order("fecha", {
      ascending: false,
    })

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error al obtener remitos:", error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}

// POST - Crear un nuevo remito
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()

    const { data, error } = await supabase.from("remitos").insert([body]).select()

    if (error) throw error

    return NextResponse.json({ success: true, data: data[0] })
  } catch (error) {
    console.error("Error al crear remito:", error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}
