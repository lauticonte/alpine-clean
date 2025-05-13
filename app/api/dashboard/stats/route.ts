import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET - Obtener estadísticas para el dashboard
export async function GET() {
  try {
    const supabase = createServerSupabaseClient()
    const hoy = new Date()
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
    const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)

    // 1. Obtener conteo de baños por estado
    const { data: banos, error: errorBanos } = await supabase.from("banos").select("estado")

    if (errorBanos) throw errorBanos

    const totalBanos = banos?.length || 0
    const banosDisponibles = banos?.filter((bano) => bano.estado === "Disponible").length || 0
    const banosAlquilados = banos?.filter((bano) => bano.estado === "Alquilado").length || 0

    // 2. Obtener contratos activos
    const { data: contratos, error: errorContratos } = await supabase
      .from("contratos")
      .select("*")
      .gte("fecha_fin", hoy.toISOString().split("T")[0])

    if (errorContratos) throw errorContratos

    const contratosActivos = contratos?.length || 0

    // 3. Obtener baños vencidos
    const { data: banosVencidos, error: errorVencidos } = await supabase
      .from("banos_contratos")
      .select("*")
      .lt("fecha_fin", hoy.toISOString().split("T")[0])

    if (errorVencidos) throw errorVencidos

    const totalBanosVencidos = banosVencidos?.length || 0

    // 4. Obtener facturación del mes
    const { data: facturas, error: errorFacturas } = await supabase
      .from("facturas")
      .select("monto")
      .gte("fecha", inicioMes.toISOString().split("T")[0])
      .lte("fecha", finMes.toISOString().split("T")[0])

    if (errorFacturas) throw errorFacturas

    const facturacionMensual = facturas?.reduce((total, factura) => total + factura.monto, 0) || 0

    // 5. Obtener pagos del mes
    const { data: pagos, error: errorPagos } = await supabase
      .from("pagos")
      .select("monto")
      .gte("fecha", inicioMes.toISOString().split("T")[0])
      .lte("fecha", finMes.toISOString().split("T")[0])

    if (errorPagos) throw errorPagos

    const pagosMensual = pagos?.reduce((total, pago) => total + pago.monto, 0) || 0

    // 6. Obtener alertas activas
    const { data: alertas, error: errorAlertas } = await supabase.from("alertas").select("tipo").eq("resuelta", false)

    if (errorAlertas) throw errorAlertas

    const totalAlertas = alertas?.length || 0
    const alertasPago = alertas?.filter((alerta) => alerta.tipo === "pago").length || 0
    const alertasContrato = alertas?.filter((alerta) => alerta.tipo === "contrato").length || 0

    return NextResponse.json({
      success: true,
      data: {
        banos: {
          total: totalBanos,
          disponibles: banosDisponibles,
          alquilados: banosAlquilados,
          vencidos: totalBanosVencidos,
        },
        contratos: {
          activos: contratosActivos,
        },
        facturacion: {
          mensual: facturacionMensual,
        },
        pagos: {
          mensual: pagosMensual,
        },
        alertas: {
          total: totalAlertas,
          pagos: alertasPago,
          contratos: alertasContrato,
        },
      },
    })
  } catch (error) {
    console.error("Error al obtener estadísticas:", error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}
