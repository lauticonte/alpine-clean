import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// GET - Obtener un pago por ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const id = params.id

    const { data, error } = await supabase
      .from("pagos")
      .select(`
        *,
        clientes(id, nombre, cuit),
        facturas(id, fecha, monto, estado),
        remitos(id, fecha, tipo)
      `)
      .eq("id", id)
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error al obtener pago:", error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}

// PUT - Actualizar un pago
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const id = params.id
    const body = await request.json()

    const { data, error } = await supabase.from("pagos").update(body).eq("id", id).select()

    if (error) throw error

    return NextResponse.json({ success: true, data: data[0] })
  } catch (error) {
    console.error("Error al actualizar pago:", error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}

// DELETE - Eliminar un pago
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const id = params.id

    // 1. Obtener información del pago para saber si está asociado a una factura
    const { data: pago, error: pagoError } = await supabase.from("pagos").select("factura_id").eq("id", id).single()

    if (pagoError) throw pagoError

    // 2. Eliminar el pago
    const { error } = await supabase.from("pagos").delete().eq("id", id)

    if (error) throw error

    // 3. Si el pago estaba asociado a una factura, actualizar su estado a "Pendiente"
    if (pago.factura_id) {
      const { error: facturaError } = await supabase
        .from("facturas")
        .update({ estado: "Pendiente" })
        .eq("id", pago.factura_id)

      if (facturaError) throw facturaError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar pago:", error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}
