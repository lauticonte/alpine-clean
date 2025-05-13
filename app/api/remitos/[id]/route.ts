import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// GET - Obtener un remito por ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const id = params.id

    const { data, error } = await supabase
      .from("remitos")
      .select(`
        *,
        clientes(id, nombre, cuit, direccion),
        contratos(id, fecha_inicio, fecha_fin)
      `)
      .eq("id", id)
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error al obtener remito:", error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}

// PUT - Actualizar un remito
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const id = params.id
    const body = await request.json()

    const { data, error } = await supabase.from("remitos").update(body).eq("id", id).select()

    if (error) throw error

    return NextResponse.json({ success: true, data: data[0] })
  } catch (error) {
    console.error("Error al actualizar remito:", error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}

// DELETE - Eliminar un remito
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const id = params.id

    const { error } = await supabase.from("remitos").delete().eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar remito:", error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}
