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

    // Insertar clientes de ejemplo
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
      ])
      .select()

    if (clientesError) throw clientesError

    // Insertar baños de ejemplo
    const banosIds = ["B001", "B002", "B003", "B010", "B011", "B020", "B021", "B022", "B023", "B024"]
    const banosDisponiblesIds = ["B030", "B031", "B032", "B033", "B034", "B035", "B036", "B037", "B038", "B039"]

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

    // Crear contratos de ejemplo
    const contratos = [
      {
        id: "C-2023-097",
        cliente_id: clientesData.find((c) => c.nombre === "Constructora ABC")?.id,
        fecha_inicio: "2023-05-01",
        fecha_fin: "2023-06-30",
        valor_diario: 1450,
        direccion_entrega: "Av. Rivadavia 1234, CABA",
        observaciones: "Contrato para obra en construcción",
      },
      {
        id: "C-2023-102",
        cliente_id: clientesData.find((c) => c.nombre === "Eventos XYZ")?.id,
        fecha_inicio: "2023-04-15",
        fecha_fin: "2023-05-15",
        valor_diario: 1600,
        direccion_entrega: "Calle San Martín 567, San Isidro",
        observaciones: "Evento corporativo",
      },
      {
        id: "C-2023-103",
        cliente_id: clientesData.find((c) => c.nombre === "Municipalidad de San Martín")?.id,
        fecha_inicio: "2023-05-10",
        fecha_fin: "2023-08-10",
        valor_diario: 1500,
        direccion_entrega: "Belgrano 3200, San Martín",
        observaciones: "Evento municipal",
      },
    ]

    const { error: contratosError } = await supabase.from("contratos").insert(contratos)

    if (contratosError) throw contratosError

    // Asignar baños a contratos
    const banosContratos = [
      // Constructora ABC - 3 baños
      { bano_id: "B001", contrato_id: "C-2023-097", fecha_inicio: "2023-05-01", fecha_fin: "2023-06-30" },
      { bano_id: "B002", contrato_id: "C-2023-097", fecha_inicio: "2023-05-01", fecha_fin: "2023-06-30" },
      { bano_id: "B003", contrato_id: "C-2023-097", fecha_inicio: "2023-05-01", fecha_fin: "2023-05-10" },

      // Eventos XYZ - 2 baños
      { bano_id: "B010", contrato_id: "C-2023-102", fecha_inicio: "2023-04-15", fecha_fin: "2023-05-15" },
      { bano_id: "B011", contrato_id: "C-2023-102", fecha_inicio: "2023-04-15", fecha_fin: "2023-05-15" },

      // Municipalidad - 5 baños
      { bano_id: "B020", contrato_id: "C-2023-103", fecha_inicio: "2023-05-10", fecha_fin: "2023-08-10" },
      { bano_id: "B021", contrato_id: "C-2023-103", fecha_inicio: "2023-05-10", fecha_fin: "2023-08-10" },
      { bano_id: "B022", contrato_id: "C-2023-103", fecha_inicio: "2023-05-10", fecha_fin: "2023-08-10" },
      { bano_id: "B023", contrato_id: "C-2023-103", fecha_inicio: "2023-05-10", fecha_fin: "2023-08-10" },
      { bano_id: "B024", contrato_id: "C-2023-103", fecha_inicio: "2023-05-10", fecha_fin: "2023-08-10" },
    ]

    const { error: banosContratosError } = await supabase.from("banos_contratos").insert(banosContratos)

    if (banosContratosError) throw banosContratosError

    // Crear facturas de ejemplo
    const facturas = [
      {
        id: "F-2023-042",
        cliente_id: clientesData.find((c) => c.nombre === "Constructora ABC")?.id,
        contrato_id: "C-2023-097",
        fecha: "2023-05-10",
        monto: 45000,
        estado: "Pendiente",
      },
      {
        id: "F-2023-041",
        cliente_id: clientesData.find((c) => c.nombre === "Constructora ABC")?.id,
        contrato_id: "C-2023-097",
        fecha: "2023-05-05",
        monto: 87000,
        estado: "Pendiente",
      },
      {
        id: "F-2023-040",
        cliente_id: clientesData.find((c) => c.nombre === "Eventos XYZ")?.id,
        contrato_id: "C-2023-102",
        fecha: "2023-05-01",
        monto: 64000,
        estado: "Pagada",
      },
    ]

    const { error: facturasError } = await supabase.from("facturas").insert(facturas)

    if (facturasError) throw facturasError

    // Crear remitos de ejemplo
    const remitos = [
      {
        id: "R-2023-056",
        cliente_id: clientesData.find((c) => c.nombre === "Constructora ABC")?.id,
        contrato_id: "C-2023-097",
        fecha: "2023-05-10",
        tipo: "Entrega",
        cantidad: 5,
      },
      {
        id: "R-2023-055",
        cliente_id: clientesData.find((c) => c.nombre === "Constructora ABC")?.id,
        contrato_id: "C-2023-097",
        fecha: "2023-05-05",
        tipo: "Retiro",
        cantidad: 8,
      },
      {
        id: "R-2023-054",
        cliente_id: clientesData.find((c) => c.nombre === "Eventos XYZ")?.id,
        contrato_id: "C-2023-102",
        fecha: "2023-05-01",
        tipo: "Entrega",
        cantidad: 12,
      },
    ]

    const { error: remitosError } = await supabase.from("remitos").insert(remitos)

    if (remitosError) throw remitosError

    // Crear alertas de ejemplo
    const alertas = [
      {
        tipo: "pago",
        cliente_id: clientesData.find((c) => c.nombre === "Constructora ABC")?.id,
        mensaje: "Pago vencido por $45,000",
        fecha: "2023-05-12",
        prioridad: "alta",
      },
      {
        tipo: "contrato",
        cliente_id: clientesData.find((c) => c.nombre === "Eventos XYZ")?.id,
        contrato_id: "C-2023-102",
        mensaje: "Contrato vence en 5 días",
        fecha: "2023-05-10",
        prioridad: "media",
      },
      {
        tipo: "pago",
        cliente_id: clientesData.find((c) => c.nombre === "Municipalidad de San Martín")?.id,
        mensaje: "Pago pendiente por $28,500",
        fecha: "2023-05-14",
        prioridad: "alta",
      },
    ]

    const { error: alertasError } = await supabase.from("alertas").insert(alertas)

    if (alertasError) throw alertasError

    return NextResponse.json({ success: true, message: "Datos de ejemplo creados correctamente" })
  } catch (error) {
    console.error("Error al crear datos de ejemplo:", error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}
