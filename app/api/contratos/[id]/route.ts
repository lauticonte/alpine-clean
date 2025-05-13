import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// GET - Obtener un contrato por ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const id = params.id

    // Obtener información del contrato
    const { data: contrato, error: errorContrato } = await supabase
      .from("contratos")
      .select(`
        *,
        clientes(id, nombre, cuit, telefono, direccion)
      `)
      .eq("id", id)
      .single()

    if (errorContrato) throw errorContrato

    // Obtener baños asignados al contrato
    const { data: banos, error: errorBanos } = await supabase
      .from("banos_contratos")
      .select(`
        *,
        banos(id, estado, ubicacion)
      `)
      .eq("contrato_id", id)

    if (errorBanos) throw errorBanos

    // Obtener facturas asociadas al contrato
    const { data: facturas, error: errorFacturas } = await supabase
      .from("facturas")
      .select("*")
      .eq("contrato_id", id)
      .order("fecha", { ascending: false })

    if (errorFacturas) throw errorFacturas

    // Obtener remitos asociados al contrato
    const { data: remitos, error: errorRemitos } = await supabase
      .from("remitos")
      .select("*")
      .eq("contrato_id", id)
      .order("fecha", { ascending: false })

    if (errorRemitos) throw errorRemitos

    return NextResponse.json({
      success: true,
      data: {
        ...contrato,
        banos,
        facturas,
        remitos,
      },
    })
  } catch (error) {
    console.error("Error al obtener contrato:", error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}

// PUT - Actualizar un contrato
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const id = params.id
    const body = await request.json()
    const { contrato, banos, banosEliminar } = body

    // 1. Actualizar el contrato
    const { data: contratoData, error: contratoError } = await supabase
      .from("contratos")
      .update(contrato)
      .eq("id", id)
      .select()

    if (contratoError) throw contratoError

    // 2. Si hay baños nuevos para agregar
    if (banos && banos.length > 0) {
      const banosContratos = banos.map((banoId: string) => ({
        bano_id: banoId,
        contrato_id: id,
        fecha_inicio: contrato.fecha_inicio,
        fecha_fin: contrato.fecha_fin,
      }))

      const { error: banosError } = await supabase.from("banos_contratos").insert(banosContratos)

      if (banosError) throw banosError

      // Actualizar el estado de los baños nuevos a "Alquilado"
      const { error: updateError } = await supabase
        .from("banos")
        .update({ estado: "Alquilado", ubicacion: "Cliente" })
        .in("id", banos)

      if (updateError) throw updateError
    }

    // 3. Si hay baños para eliminar del contrato
    if (banosEliminar && banosEliminar.length > 0) {
      // Eliminar las asignaciones
      const { error: deleteError } = await supabase
        .from("banos_contratos")
        .delete()
        .eq("contrato_id", id)
        .in("bano_id", banosEliminar)

      if (deleteError) throw deleteError

      // Actualizar el estado de los baños eliminados a "Disponible"
      const { error: updateError } = await supabase
        .from("banos")
        .update({ estado: "Disponible", ubicacion: "Depósito Central" })
        .in("id", banosEliminar)

      if (updateError) throw updateError
    }

    return NextResponse.json({
      success: true,
      data: contratoData[0],
    })
  } catch (error) {
    console.error("Error al actualizar contrato:", error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}

// DELETE - Eliminar un contrato
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerSupabaseClient()
    const id = params.id

    // 1. Obtener los baños asociados al contrato
    const { data: banos, error: banosError } = await supabase
      .from("banos_contratos")
      .select("bano_id")
      .eq("contrato_id", id)

    if (banosError) throw banosError

    // 2. Eliminar el contrato (esto eliminará automáticamente las entradas en banos_contratos por la restricción ON DELETE CASCADE)
    const { error: deleteError } = await supabase.from("contratos").delete().eq("id", id)

    if (deleteError) throw deleteError

    // 3. Actualizar el estado de los baños a "Disponible"
    if (banos && banos.length > 0) {
      const banosIds = banos.map((b) => b.bano_id)
      const { error: updateError } = await supabase
        .from("banos")
        .update({ estado: "Disponible", ubicacion: "Depósito Central" })
        .in("id", banosIds)

      if (updateError) throw updateError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar contrato:", error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}
