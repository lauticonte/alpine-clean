import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// POST - Generar alertas automáticas
export async function POST() {
  try {
    const supabase = createServerSupabaseClient()
    const hoy = new Date()
    const alertasGeneradas = []

    // 1. Generar alertas para contratos por vencer (próximos 7 días)
    const { data: contratosPorVencer, error: errorContratos } = await supabase
      .from("contratos")
      .select(`
        id,
        cliente_id,
        fecha_fin,
        clientes(nombre)
      `)
      .gte("fecha_fin", hoy.toISOString().split("T")[0])
      .lte("fecha_fin", new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0])

    if (errorContratos) throw errorContratos

    // Crear alertas para contratos por vencer
    for (const contrato of contratosPorVencer || []) {
      const fechaFin = new Date(contrato.fecha_fin)
      const diasRestantes = Math.ceil((fechaFin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))

      // Verificar si ya existe una alerta para este contrato
      const { data: alertaExistente, error: errorAlerta } = await supabase
        .from("alertas")
        .select("id")
        .eq("contrato_id", contrato.id)
        .eq("tipo", "contrato")
        .eq("resuelta", false)

      if (errorAlerta) throw errorAlerta

      // Si no existe alerta, crear una nueva
      if (!alertaExistente || alertaExistente.length === 0) {
        const nuevaAlerta = {
          tipo: "contrato",
          cliente_id: contrato.cliente_id,
          contrato_id: contrato.id,
          mensaje: `Contrato vence en ${diasRestantes} días`,
          fecha: hoy.toISOString().split("T")[0],
          prioridad: diasRestantes <= 3 ? "alta" : "media",
          resuelta: false,
        }

        const { data, error } = await supabase.from("alertas").insert([nuevaAlerta]).select()

        if (error) throw error

        alertasGeneradas.push(data[0])
      }
    }

    // 2. Generar alertas para facturas vencidas (más de 30 días sin pagar)
    const { data: facturasVencidas, error: errorFacturas } = await supabase
      .from("facturas")
      .select(`
        id,
        cliente_id,
        fecha,
        monto,
        clientes(nombre)
      `)
      .eq("estado", "Pendiente")
      .lt("fecha", new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0])

    if (errorFacturas) throw errorFacturas

    // Crear alertas para facturas vencidas
    for (const factura of facturasVencidas || []) {
      // Verificar si ya existe una alerta para esta factura
      const { data: alertaExistente, error: errorAlerta } = await supabase
        .from("alertas")
        .select("id")
        .eq("tipo", "pago")
        .eq("cliente_id", factura.cliente_id)
        .ilike("mensaje", `%${factura.id}%`)
        .eq("resuelta", false)

      if (errorAlerta) throw errorAlerta

      // Si no existe alerta, crear una nueva
      if (!alertaExistente || alertaExistente.length === 0) {
        const nuevaAlerta = {
          tipo: "pago",
          cliente_id: factura.cliente_id,
          mensaje: `Factura ${factura.id} vencida por $${factura.monto}`,
          fecha: hoy.toISOString().split("T")[0],
          prioridad: "alta",
          resuelta: false,
        }

        const { data, error } = await supabase.from("alertas").insert([nuevaAlerta]).select()

        if (error) throw error

        alertasGeneradas.push(data[0])
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        alertasGeneradas,
        total: alertasGeneradas.length,
      },
    })
  } catch (error) {
    console.error("Error al generar alertas:", error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}
