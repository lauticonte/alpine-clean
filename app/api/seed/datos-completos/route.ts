import { createServerSupabaseClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = createServerSupabaseClient()

    // Primero, limpiamos las tablas existentes para evitar duplicados
    // Nota: El orden es importante debido a las restricciones de clave foránea
    await supabase.from("alertas").delete().neq("id", 0)
    await supabase.from("pagos").delete().neq("id", 0)
    await supabase.from("remitos").delete().neq("id", 0)
    await supabase.from("facturas").delete().neq("id", 0)
    await supabase.from("banos_contratos").delete().neq("id", 0)
    await supabase.from("contratos").delete().neq("id", 0)
    await supabase.from("banos").delete().neq("id", 0)
    await supabase.from("clientes").delete().neq("id", 0)

    // Insertar clientes de ejemplo (más cantidad)
    const { data: clientesData, error: clientesError } = await supabase
      .from("clientes")
      .insert([
        {
          nombre: "Constructora ABC",
          cuit: "30-12345678-9",
          telefono: "11-2345-6789",
          direccion: "Av. Rivadavia 1234, CABA",
        },
        {
          nombre: "Eventos XYZ",
          cuit: "30-87654321-0",
          telefono: "11-8765-4321",
          direccion: "Calle San Martín 567, San Isidro",
        },
        {
          nombre: "Municipalidad de San Martín",
          cuit: "30-99887766-5",
          telefono: "11-5555-5555",
          direccion: "Belgrano 3200, San Martín",
        },
        {
          nombre: "Empresa de Construcción DEF",
          cuit: "30-55443322-1",
          telefono: "11-4444-3333",
          direccion: "Corrientes 2500, CABA",
        },
        {
          nombre: "Productora de Eventos MNO",
          cuit: "30-11223344-5",
          telefono: "11-7777-8888",
          direccion: "Libertador 5400, Vicente López",
        },
        {
          nombre: "Constructora Edificios SA",
          cuit: "30-22334455-6",
          telefono: "11-6666-7777",
          direccion: "Av. Cabildo 2500, CABA",
        },
        {
          nombre: "Eventos Corporativos SRL",
          cuit: "30-33445566-7",
          telefono: "11-3333-2222",
          direccion: "Av. del Libertador 3300, Vicente López",
        },
        {
          nombre: "Municipalidad de Tigre",
          cuit: "30-44556677-8",
          telefono: "11-2222-1111",
          direccion: "Av. Cazón 1500, Tigre",
        },
      ])
      .select()

    if (clientesError) throw clientesError

    // Insertar baños de ejemplo (más cantidad)
    const banosIds = []
    for (let i = 1; i <= 50; i++) {
      banosIds.push(`B${i.toString().padStart(3, "0")}`)
    }

    const banosDisponiblesIds = []
    for (let i = 51; i <= 100; i++) {
      banosDisponiblesIds.push(`B${i.toString().padStart(3, "0")}`)
    }

    const banosData = [
      ...banosIds.map((id) => ({
        id,
        estado: "Alquilado",
        ubicacion: "Cliente",
      })),
      ...banosDisponiblesIds.map((id) => ({
        id,
        estado: "Disponible",
        ubicacion: "Depósito Central",
      })),
    ]

    const { error: banosError } = await supabase.from("banos").insert(banosData)

    if (banosError) throw banosError

    // Fechas para contratos (algunos activos, algunos vencidos, algunos por vencer)
    const hoy = new Date()
    const fechaHace3Meses = new Date(hoy.getFullYear(), hoy.getMonth() - 3, hoy.getDate())
    const fechaHace2Meses = new Date(hoy.getFullYear(), hoy.getMonth() - 2, hoy.getDate())
    const fechaHace1Mes = new Date(hoy.getFullYear(), hoy.getMonth() - 1, hoy.getDate())
    const fechaEn1Mes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, hoy.getDate())
    const fechaEn2Meses = new Date(hoy.getFullYear(), hoy.getMonth() + 2, hoy.getDate())
    const fechaEn3Meses = new Date(hoy.getFullYear(), hoy.getMonth() + 3, hoy.getDate())
    const fechaEn5Dias = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 5)
    const fechaEn10Dias = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 10)

    // Crear contratos de ejemplo (más cantidad y variedad)
    const contratos = [
      {
        id: "C-2025-001",
        cliente_id: clientesData.find((c) => c.nombre === "Constructora ABC")?.id,
        fecha_inicio: fechaHace3Meses.toISOString().split("T")[0],
        fecha_fin: fechaEn1Mes.toISOString().split("T")[0],
        valor_diario: 1450,
        direccion_entrega: "Av. Rivadavia 1234, CABA",
        observaciones: "Contrato para obra en construcción",
      },
      {
        id: "C-2025-002",
        cliente_id: clientesData.find((c) => c.nombre === "Eventos XYZ")?.id,
        fecha_inicio: fechaHace2Meses.toISOString().split("T")[0],
        fecha_fin: fechaEn5Dias.toISOString().split("T")[0],
        valor_diario: 1600,
        direccion_entrega: "Calle San Martín 567, San Isidro",
        observaciones: "Evento corporativo",
      },
      {
        id: "C-2025-003",
        cliente_id: clientesData.find((c) => c.nombre === "Municipalidad de San Martín")?.id,
        fecha_inicio: fechaHace1Mes.toISOString().split("T")[0],
        fecha_fin: fechaEn3Meses.toISOString().split("T")[0],
        valor_diario: 1500,
        direccion_entrega: "Belgrano 3200, San Martín",
        observaciones: "Evento municipal",
      },
      {
        id: "C-2025-004",
        cliente_id: clientesData.find((c) => c.nombre === "Empresa de Construcción DEF")?.id,
        fecha_inicio: fechaHace3Meses.toISOString().split("T")[0],
        fecha_fin: fechaHace1Mes.toISOString().split("T")[0], // Contrato vencido
        valor_diario: 1550,
        direccion_entrega: "Corrientes 2500, CABA",
        observaciones: "Obra finalizada",
      },
      {
        id: "C-2025-005",
        cliente_id: clientesData.find((c) => c.nombre === "Productora de Eventos MNO")?.id,
        fecha_inicio: fechaHace2Meses.toISOString().split("T")[0],
        fecha_fin: fechaEn10Dias.toISOString().split("T")[0],
        valor_diario: 1650,
        direccion_entrega: "Libertador 5400, Vicente López",
        observaciones: "Festival de música",
      },
      {
        id: "C-2025-006",
        cliente_id: clientesData.find((c) => c.nombre === "Constructora Edificios SA")?.id,
        fecha_inicio: fechaHace1Mes.toISOString().split("T")[0],
        fecha_fin: fechaEn2Meses.toISOString().split("T")[0],
        valor_diario: 1400,
        direccion_entrega: "Av. Cabildo 2500, CABA",
        observaciones: "Edificio residencial",
      },
      {
        id: "C-2025-007",
        cliente_id: clientesData.find((c) => c.nombre === "Eventos Corporativos SRL")?.id,
        fecha_inicio: fechaHace3Meses.toISOString().split("T")[0],
        fecha_fin: fechaEn1Mes.toISOString().split("T")[0],
        valor_diario: 1700,
        direccion_entrega: "Av. del Libertador 3300, Vicente López",
        observaciones: "Congreso internacional",
      },
      {
        id: "C-2025-008",
        cliente_id: clientesData.find((c) => c.nombre === "Municipalidad de Tigre")?.id,
        fecha_inicio: fechaHace2Meses.toISOString().split("T")[0],
        fecha_fin: fechaEn3Meses.toISOString().split("T")[0],
        valor_diario: 1550,
        direccion_entrega: "Av. Cazón 1500, Tigre",
        observaciones: "Evento cultural",
      },
    ]

    const { error: contratosError } = await supabase.from("contratos").insert(contratos)

    if (contratosError) throw contratosError

    // Asignar baños a contratos (distribución variada)
    const banosContratos = []

    // Contrato 1: 10 baños
    for (let i = 0; i < 10; i++) {
      banosContratos.push({
        bano_id: banosIds[i],
        contrato_id: "C-2025-001",
        fecha_inicio: contratos[0].fecha_inicio,
        fecha_fin: contratos[0].fecha_fin,
      })
    }

    // Contrato 2: 8 baños
    for (let i = 10; i < 18; i++) {
      banosContratos.push({
        bano_id: banosIds[i],
        contrato_id: "C-2025-002",
        fecha_inicio: contratos[1].fecha_inicio,
        fecha_fin: contratos[1].fecha_fin,
      })
    }

    // Contrato 3: 12 baños
    for (let i = 18; i < 30; i++) {
      banosContratos.push({
        bano_id: banosIds[i],
        contrato_id: "C-2025-003",
        fecha_inicio: contratos[2].fecha_inicio,
        fecha_fin: contratos[2].fecha_fin,
      })
    }

    // Contrato 4: 5 baños (vencido)
    for (let i = 30; i < 35; i++) {
      banosContratos.push({
        bano_id: banosIds[i],
        contrato_id: "C-2025-004",
        fecha_inicio: contratos[3].fecha_inicio,
        fecha_fin: contratos[3].fecha_fin,
      })
    }

    // Contrato 5: 6 baños
    for (let i = 35; i < 41; i++) {
      banosContratos.push({
        bano_id: banosIds[i],
        contrato_id: "C-2025-005",
        fecha_inicio: contratos[4].fecha_inicio,
        fecha_fin: contratos[4].fecha_fin,
      })
    }

    // Contrato 6: 3 baños
    for (let i = 41; i < 44; i++) {
      banosContratos.push({
        bano_id: banosIds[i],
        contrato_id: "C-2025-006",
        fecha_inicio: contratos[5].fecha_inicio,
        fecha_fin: contratos[5].fecha_fin,
      })
    }

    // Contrato 7: 4 baños
    for (let i = 44; i < 48; i++) {
      banosContratos.push({
        bano_id: banosIds[i],
        contrato_id: "C-2025-007",
        fecha_inicio: contratos[6].fecha_inicio,
        fecha_fin: contratos[6].fecha_fin,
      })
    }

    // Contrato 8: 2 baños
    for (let i = 48; i < 50; i++) {
      banosContratos.push({
        bano_id: banosIds[i],
        contrato_id: "C-2025-008",
        fecha_inicio: contratos[7].fecha_inicio,
        fecha_fin: contratos[7].fecha_fin,
      })
    }

    const { error: banosContratosError } = await supabase.from("banos_contratos").insert(banosContratos)

    if (banosContratosError) throw banosContratosError

    // Crear facturas de ejemplo (más cantidad y variedad)
    const facturas = [
      {
        id: "F-2025-001",
        cliente_id: clientesData.find((c) => c.nombre === "Constructora ABC")?.id,
        contrato_id: "C-2025-001",
        fecha: fechaHace2Meses.toISOString().split("T")[0],
        monto: 45000,
        estado: "Pagada",
      },
      {
        id: "F-2025-002",
        cliente_id: clientesData.find((c) => c.nombre === "Constructora ABC")?.id,
        contrato_id: "C-2025-001",
        fecha: fechaHace1Mes.toISOString().split("T")[0],
        monto: 45000,
        estado: "Pagada",
      },
      {
        id: "F-2025-003",
        cliente_id: clientesData.find((c) => c.nombre === "Constructora ABC")?.id,
        contrato_id: "C-2025-001",
        fecha: hoy.toISOString().split("T")[0],
        monto: 45000,
        estado: "Pendiente",
      },
      {
        id: "F-2025-004",
        cliente_id: clientesData.find((c) => c.nombre === "Eventos XYZ")?.id,
        contrato_id: "C-2025-002",
        fecha: fechaHace1Mes.toISOString().split("T")[0],
        monto: 38400,
        estado: "Pagada",
      },
      {
        id: "F-2025-005",
        cliente_id: clientesData.find((c) => c.nombre === "Eventos XYZ")?.id,
        contrato_id: "C-2025-002",
        fecha: hoy.toISOString().split("T")[0],
        monto: 38400,
        estado: "Pendiente",
      },
      {
        id: "F-2025-006",
        cliente_id: clientesData.find((c) => c.nombre === "Municipalidad de San Martín")?.id,
        contrato_id: "C-2025-003",
        fecha: fechaHace1Mes.toISOString().split("T")[0],
        monto: 54000,
        estado: "Pagada",
      },
      {
        id: "F-2025-007",
        cliente_id: clientesData.find((c) => c.nombre === "Empresa de Construcción DEF")?.id,
        contrato_id: "C-2025-004",
        fecha: fechaHace2Meses.toISOString().split("T")[0],
        monto: 23250,
        estado: "Pagada",
      },
      {
        id: "F-2025-008",
        cliente_id: clientesData.find((c) => c.nombre === "Productora de Eventos MNO")?.id,
        contrato_id: "C-2025-005",
        fecha: fechaHace1Mes.toISOString().split("T")[0],
        monto: 29700,
        estado: "Pendiente",
      },
      {
        id: "F-2025-009",
        cliente_id: clientesData.find((c) => c.nombre === "Constructora Edificios SA")?.id,
        contrato_id: "C-2025-006",
        fecha: hoy.toISOString().split("T")[0],
        monto: 12600,
        estado: "Pendiente",
      },
      {
        id: "F-2025-010",
        cliente_id: clientesData.find((c) => c.nombre === "Eventos Corporativos SRL")?.id,
        contrato_id: "C-2025-007",
        fecha: fechaHace1Mes.toISOString().split("T")[0],
        monto: 20400,
        estado: "Pagada",
      },
    ]

    const { error: facturasError } = await supabase.from("facturas").insert(facturas)

    if (facturasError) throw facturasError

    // Crear remitos de ejemplo
    const remitos = [
      {
        id: "R-2025-001",
        cliente_id: clientesData.find((c) => c.nombre === "Constructora ABC")?.id,
        contrato_id: "C-2025-001",
        fecha: fechaHace3Meses.toISOString().split("T")[0],
        tipo: "Entrega",
        cantidad: 10,
      },
      {
        id: "R-2025-002",
        cliente_id: clientesData.find((c) => c.nombre === "Eventos XYZ")?.id,
        contrato_id: "C-2025-002",
        fecha: fechaHace2Meses.toISOString().split("T")[0],
        tipo: "Entrega",
        cantidad: 8,
      },
      {
        id: "R-2025-003",
        cliente_id: clientesData.find((c) => c.nombre === "Municipalidad de San Martín")?.id,
        contrato_id: "C-2025-003",
        fecha: fechaHace1Mes.toISOString().split("T")[0],
        tipo: "Entrega",
        cantidad: 12,
      },
      {
        id: "R-2025-004",
        cliente_id: clientesData.find((c) => c.nombre === "Empresa de Construcción DEF")?.id,
        contrato_id: "C-2025-004",
        fecha: fechaHace3Meses.toISOString().split("T")[0],
        tipo: "Entrega",
        cantidad: 5,
      },
      {
        id: "R-2025-005",
        cliente_id: clientesData.find((c) => c.nombre === "Empresa de Construcción DEF")?.id,
        contrato_id: "C-2025-004",
        fecha: fechaHace1Mes.toISOString().split("T")[0],
        tipo: "Retiro",
        cantidad: 5,
      },
      {
        id: "R-2025-006",
        cliente_id: clientesData.find((c) => c.nombre === "Productora de Eventos MNO")?.id,
        contrato_id: "C-2025-005",
        fecha: fechaHace2Meses.toISOString().split("T")[0],
        tipo: "Entrega",
        cantidad: 6,
      },
      {
        id: "R-2025-007",
        cliente_id: clientesData.find((c) => c.nombre === "Constructora Edificios SA")?.id,
        contrato_id: "C-2025-006",
        fecha: fechaHace1Mes.toISOString().split("T")[0],
        tipo: "Entrega",
        cantidad: 3,
      },
      {
        id: "R-2025-008",
        cliente_id: clientesData.find((c) => c.nombre === "Eventos Corporativos SRL")?.id,
        contrato_id: "C-2025-007",
        fecha: fechaHace3Meses.toISOString().split("T")[0],
        tipo: "Entrega",
        cantidad: 4,
      },
      {
        id: "R-2025-009",
        cliente_id: clientesData.find((c) => c.nombre === "Municipalidad de Tigre")?.id,
        contrato_id: "C-2025-008",
        fecha: fechaHace2Meses.toISOString().split("T")[0],
        tipo: "Entrega",
        cantidad: 2,
      },
    ]

    const { error: remitosError } = await supabase.from("remitos").insert(remitos)

    if (remitosError) throw remitosError

    // Crear pagos de ejemplo
    const pagos = [
      {
        cliente_id: clientesData.find((c) => c.nombre === "Constructora ABC")?.id,
        fecha: fechaHace2Meses.toISOString().split("T")[0],
        monto: 45000,
        metodo_pago: "Transferencia",
        comprobante: "TR-2025-001",
        factura_id: "F-2025-001",
        observaciones: "Pago primera factura",
      },
      {
        cliente_id: clientesData.find((c) => c.nombre === "Constructora ABC")?.id,
        fecha: fechaHace1Mes.toISOString().split("T")[0],
        monto: 45000,
        metodo_pago: "Transferencia",
        comprobante: "TR-2025-002",
        factura_id: "F-2025-002",
        observaciones: "Pago segunda factura",
      },
      {
        cliente_id: clientesData.find((c) => c.nombre === "Eventos XYZ")?.id,
        fecha: fechaHace1Mes.toISOString().split("T")[0],
        monto: 38400,
        metodo_pago: "Cheque",
        comprobante: "CH-2025-001",
        factura_id: "F-2025-004",
        observaciones: "Pago primera factura",
      },
      {
        cliente_id: clientesData.find((c) => c.nombre === "Municipalidad de San Martín")?.id,
        fecha: fechaHace1Mes.toISOString().split("T")[0],
        monto: 54000,
        metodo_pago: "Transferencia",
        comprobante: "TR-2025-003",
        factura_id: "F-2025-006",
        observaciones: "Pago primera factura",
      },
      {
        cliente_id: clientesData.find((c) => c.nombre === "Empresa de Construcción DEF")?.id,
        fecha: fechaHace2Meses.toISOString().split("T")[0],
        monto: 23250,
        metodo_pago: "Efectivo",
        comprobante: "EF-2025-001",
        factura_id: "F-2025-007",
        observaciones: "Pago única factura",
      },
      {
        cliente_id: clientesData.find((c) => c.nombre === "Eventos Corporativos SRL")?.id,
        fecha: fechaHace1Mes.toISOString().split("T")[0],
        monto: 20400,
        metodo_pago: "Transferencia",
        comprobante: "TR-2025-004",
        factura_id: "F-2025-010",
        observaciones: "Pago primera factura",
      },
    ]

    const { error: pagosError } = await supabase.from("pagos").insert(pagos)

    if (pagosError) throw pagosError

    // Crear alertas de ejemplo
    const alertas = [
      {
        tipo: "pago",
        cliente_id: clientesData.find((c) => c.nombre === "Constructora ABC")?.id,
        mensaje: "Factura F-2025-003 pendiente de pago por $45,000",
        fecha: hoy.toISOString().split("T")[0],
        prioridad: "alta",
        resuelta: false,
      },
      {
        tipo: "contrato",
        cliente_id: clientesData.find((c) => c.nombre === "Eventos XYZ")?.id,
        contrato_id: "C-2025-002",
        mensaje: "Contrato vence en 5 días",
        fecha: hoy.toISOString().split("T")[0],
        prioridad: "media",
        resuelta: false,
      },
      {
        tipo: "pago",
        cliente_id: clientesData.find((c) => c.nombre === "Eventos XYZ")?.id,
        mensaje: "Factura F-2025-005 pendiente de pago por $38,400",
        fecha: hoy.toISOString().split("T")[0],
        prioridad: "media",
        resuelta: false,
      },
      {
        tipo: "pago",
        cliente_id: clientesData.find((c) => c.nombre === "Productora de Eventos MNO")?.id,
        mensaje: "Factura F-2025-008 vencida por $29,700",
        fecha: hoy.toISOString().split("T")[0],
        prioridad: "alta",
        resuelta: false,
      },
      {
        tipo: "contrato",
        cliente_id: clientesData.find((c) => c.nombre === "Productora de Eventos MNO")?.id,
        contrato_id: "C-2025-005",
        mensaje: "Contrato vence en 10 días",
        fecha: hoy.toISOString().split("T")[0],
        prioridad: "baja",
        resuelta: false,
      },
      {
        tipo: "pago",
        cliente_id: clientesData.find((c) => c.nombre === "Constructora Edificios SA")?.id,
        mensaje: "Factura F-2025-009 pendiente de pago por $12,600",
        fecha: hoy.toISOString().split("T")[0],
        prioridad: "media",
        resuelta: false,
      },
    ]

    const { error: alertasError } = await supabase.from("alertas").insert(alertas)

    if (alertasError) throw alertasError

    return NextResponse.json({
      success: true,
      message: "Datos de ejemplo completos creados correctamente",
    })
  } catch (error) {
    console.error("Error al crear datos de ejemplo completos:", error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}
