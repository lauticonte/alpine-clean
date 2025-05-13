import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// GET - Obtener todos los pagos
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const searchParams = request.nextUrl.searchParams
    const clienteId = searchParams.get("cliente_id") || ""
    const facturaId = searchParams.get("factura_id") || ""
    const query = searchParams.get("query") || ""

    let pagosQuery = supabase.from("pagos").select(`
        *,
        clientes(id, nombre),
        facturas(id, monto)
      `)

    // Aplicar filtros si se proporcionan
    if (clienteId) {
      pagosQuery = pagosQuery.eq("cliente_id", clienteId)
    }

    if (facturaId) {
      pagosQuery = pagosQuery.eq("factura_id", facturaId)
    }

    if (query) {
      pagosQuery = pagosQuery.or(`comprobante.ilike.%${query}%,clientes.nombre.ilike.%${query}%`)
    }

    const { data, error } = await pagosQuery.order("fecha", {
      ascending: false,
    })

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error al obtener pagos:", error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}

// POST - Crear un nuevo pago
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()
    const { pago, actualizarFactura } = body

    // 1. Insertar el pago
    const { data, error } = await supabase.from("pagos").insert([pago]).select()

    if (error) throw error

    // 2. Si se debe actualizar el estado de la factura
    if (actualizarFactura && pago.factura_id) {
      const { error: facturaError } = await supabase
        .from("facturas")
        .update({ estado: "Pagada" })
        .eq("id", pago.factura_id)

      if (facturaError) throw facturaError
    }

    return NextResponse.json({ success: true, data: data[0] })
  } catch (error) {
    console.error("Error al crear pago:", error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}
