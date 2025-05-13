import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// GET - Obtener todos los contratos
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const searchParams = request.nextUrl.searchParams
    const clienteId = searchParams.get("cliente_id") || ""
    const query = searchParams.get("query") || ""

    let contratosQuery = supabase.from("contratos").select(`
        *,
        clientes(id, nombre)
      `)

    // Filtrar por cliente si se proporciona
    if (clienteId) {
      contratosQuery = contratosQuery.eq("cliente_id", clienteId)
    }

    // Filtrar por ID si hay un término de búsqueda
    if (query) {
      contratosQuery = contratosQuery.or(`id.ilike.%${query}%,clientes.nombre.ilike.%${query}%`)
    }

    const { data, error } = await contratosQuery.order("fecha_inicio", {
      ascending: false,
    })

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error al obtener contratos:", error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}

// POST - Crear un nuevo contrato
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()
    const { contrato, banos } = body

    // Iniciar una transacción
    // Nota: Supabase JS no soporta transacciones directamente, así que hacemos operaciones secuenciales

    // 1. Insertar el contrato
    const { data: contratoData, error: contratoError } = await supabase.from("contratos").insert([contrato]).select()

    if (contratoError) throw contratoError

    const contratoId = contratoData[0].id

    // 2. Insertar las asignaciones de baños
    const banosContratos = banos.map((banoId: string) => ({
      bano_id: banoId,
      contrato_id: contratoId,
      fecha_inicio: contrato.fecha_inicio,
      fecha_fin: contrato.fecha_fin,
    }))

    const { error: banosError } = await supabase.from("banos_contratos").insert(banosContratos)

    if (banosError) throw banosError

    // 3. Actualizar el estado de los baños a "Alquilado"
    const { error: updateError } = await supabase
      .from("banos")
      .update({ estado: "Alquilado", ubicacion: "Cliente" })
      .in("id", banos)

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      data: { contrato: contratoData[0], banos },
    })
  } catch (error) {
    console.error("Error al crear contrato:", error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}
