import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// GET - Obtener todas las facturas
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const searchParams = request.nextUrl.searchParams
    const clienteId = searchParams.get("cliente_id") || ""
    const contratoId = searchParams.get("contrato_id") || ""
    const estado = searchParams.get("estado") || ""
    const query = searchParams.get("query") || ""

    let facturasQuery = supabase.from("facturas").select(`
        *,
        clientes(id, nombre),
        contratos(id)
      `)

    // Aplicar filtros si se proporcionan
    if (clienteId) {
      facturasQuery = facturasQuery.eq("cliente_id", clienteId)
    }

    if (contratoId) {
      facturasQuery = facturasQuery.eq("contrato_id", contratoId)
    }

    if (estado) {
      facturasQuery = facturasQuery.eq("estado", estado)
    }

    if (query) {
      facturasQuery = facturasQuery.or(`id.ilike.%${query}%,clientes.nombre.ilike.%${query}%`)
    }

    const { data, error } = await facturasQuery.order("fecha", {
      ascending: false,
    })

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error al obtener facturas:", error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}

// POST - Crear una nueva factura
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()

    const { data, error } = await supabase.from("facturas").insert([body]).select()

    if (error) throw error

    return NextResponse.json({ success: true, data: data[0] })
  } catch (error) {
    console.error("Error al crear factura:", error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}
