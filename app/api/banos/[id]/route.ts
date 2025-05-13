import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// GET - Obtener un baño por ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const id = params.id

    // Obtener información del baño
    const { data: bano, error: errorBano } = await supabase.from("banos").select("*").eq("id", id).single()

    if (errorBano) throw errorBano

    // Obtener historial de contratos del baño
    const { data: contratos, error: errorContratos } = await supabase
      .from("banos_contratos")
      .select(`
        *,
        contratos(
          id,
          fecha_inicio,
          fecha_fin,
          valor_diario,
          clientes(id, nombre)
        )
      `)
      .eq("bano_id", id)
      .order("fecha_inicio", { ascending: false })

    if (errorContratos) throw errorContratos

    return NextResponse.json({
      success: true,
      data: {
        ...bano,
        contratos,
      },
    })
  } catch (error) {
    console.error("Error al obtener baño:", error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}

// PUT - Actualizar un baño
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const id = params.id
    const body = await request.json()

    const { data, error } = await supabase.from("banos").update(body).eq("id", id).select()

    if (error) throw error

    return NextResponse.json({ success: true, data: data[0] })
  } catch (error) {
    console.error("Error al actualizar baño:", error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}

// DELETE - Eliminar un baño
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const id = params.id

    const { error } = await supabase.from("banos").delete().eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar baño:", error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}
