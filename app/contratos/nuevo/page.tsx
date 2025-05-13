"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useRouter, useSearchParams } from "next/navigation"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface Cliente {
  id: string
  nombre: string
  cuit: string
  telefono: string
  direccion: string
}

// Función para generar el siguiente número de contrato
const generarSiguienteNumeroContrato = async (supabase: any): Promise<string> => {
  try {
    // Obtener el último contrato
    const { data: ultimoContrato, error } = await supabase
      .from("contratos")
      .select("id")
      .order("id", { ascending: false })
      .limit(1)

    if (error) throw error

    let siguienteNumero = 1
    if (ultimoContrato && ultimoContrato.length > 0) {
      // Extraer el número del último contrato (C-2023-XXX)
      const ultimoNumero = parseInt(ultimoContrato[0].id.split("-")[2])
      siguienteNumero = ultimoNumero + 1
    }

    // Formatear el número con ceros a la izquierda
    return `C-2023-${siguienteNumero.toString().padStart(3, "0")}`
  } catch (error) {
    console.error("Error al generar número de contrato:", error)
    return "C-2023-001" // Valor por defecto en caso de error
  }
}

// Lista de baños disponibles para seleccionar
const banosDisponibles = [
  { id: "B030", estado: "Disponible", ubicacion: "Depósito Central" },
  { id: "B031", estado: "Disponible", ubicacion: "Depósito Central" },
  { id: "B032", estado: "Disponible", ubicacion: "Depósito Central" },
  { id: "B033", estado: "Disponible", ubicacion: "Depósito Central" },
  { id: "B034", estado: "Disponible", ubicacion: "Depósito Central" },
  { id: "B035", estado: "Disponible", ubicacion: "Depósito Central" },
  { id: "B036", estado: "Disponible", ubicacion: "Depósito Central" },
  { id: "B037", estado: "Disponible", ubicacion: "Depósito Central" },
  { id: "B038", estado: "Disponible", ubicacion: "Depósito Central" },
  { id: "B039", estado: "Disponible", ubicacion: "Depósito Central" },
]

export default function NuevoContratoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const banoPreseleccionado = searchParams.get("bano")

  const [fechaInicio, setFechaInicio] = useState<Date>()
  const [fechaFin, setFechaFin] = useState<Date>()
  const [banoSeleccionado, setBanoSeleccionado] = useState<string[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string>("")
  const [valorDiario, setValorDiario] = useState<string>("")
  const [direccionEntrega, setDireccionEntrega] = useState<string>("")
  const [observaciones, setObservaciones] = useState<string>("")
  const [guardando, setGuardando] = useState(false)
  const [numeroContrato, setNumeroContrato] = useState<string>("")

  // Si hay un baño preseleccionado, agregarlo a la selección
  useEffect(() => {
    if (banoPreseleccionado) {
      setBanoSeleccionado([banoPreseleccionado])
    }
  }, [banoPreseleccionado])

  // Obtener clientes y generar número de contrato
  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClientSupabaseClient()
        
        // Obtener clientes
        const { data: clientesData, error: clientesError } = await supabase
          .from("clientes")
          .select("*")
          .order("nombre")

        if (clientesError) {
          console.error("Error al obtener clientes:", clientesError)
          return
        }

        setClientes(clientesData || [])

        // Generar número de contrato
        const siguienteNumero = await generarSiguienteNumeroContrato(supabase)
        setNumeroContrato(siguienteNumero)
      } catch (error) {
        console.error("Error al inicializar:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleBanoToggle = (id: string) => {
    setBanoSeleccionado((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)

    try {
      if (!fechaInicio || !fechaFin || !clienteSeleccionado || !valorDiario || !direccionEntrega) {
        toast.error("Por favor complete todos los campos requeridos")
        return
      }

      if (banoSeleccionado.length === 0) {
        toast.error("Debe seleccionar al menos un baño")
        return
      }

      const supabase = createClientSupabaseClient()

      // Verificar la conexión a Supabase
      const { data: testData, error: testError } = await supabase
        .from("contratos")
        .select("id")
        .limit(1)

      if (testError) {
        console.error("Error de conexión a Supabase:", {
          error: testError,
          message: testError.message,
          details: testError.details,
          hint: testError.hint,
          code: testError.code
        })
        toast.error("Error de conexión a la base de datos")
        return
      }

      // Preparar los datos del contrato
      const contratoData = {
        id: numeroContrato,
        cliente_id: Number(clienteSeleccionado),
        fecha_inicio: fechaInicio.toISOString().slice(0, 10),
        fecha_fin: fechaFin.toISOString().slice(0, 10),
        valor_diario: parseFloat(valorDiario),
        direccion_entrega: direccionEntrega,
        observaciones: observaciones || null
      }

      console.log("Intentando crear contrato con datos:", contratoData)

      // Verificar que el cliente existe
      const { data: clienteData, error: clienteError } = await supabase
        .from("clientes")
        .select("id")
        .eq("id", clienteSeleccionado)
        .single()

      if (clienteError) {
        console.error("Error al verificar el cliente:", {
          error: clienteError,
          message: clienteError.message,
          details: clienteError.details,
          hint: clienteError.hint,
          code: clienteError.code
        })
        toast.error("Error al verificar el cliente")
        return
      }

      if (!clienteData) {
        console.error("Cliente no encontrado:", clienteSeleccionado)
        toast.error("Cliente no encontrado")
        return
      }

      // 1. Crear el contrato
      const { data: contrato, error: errorContrato } = await supabase
        .from("contratos")
        .insert([contratoData]) // Envolver en un array
        .select()
        .single()

      if (errorContrato) {
        console.error("Error al crear el contrato:", {
          error: errorContrato,
          message: errorContrato.message,
          details: errorContrato.details,
          hint: errorContrato.hint,
          code: errorContrato.code,
          data: contratoData
        })
        toast.error(`Error al crear el contrato: ${errorContrato.message || "Error desconocido"}`)
        return
      }

      if (!contrato) {
        console.error("No se recibió respuesta del servidor al crear el contrato")
        toast.error("Error al crear el contrato: No se recibió respuesta del servidor")
        return
      }

      console.log("Contrato creado exitosamente:", contrato)

      // 2. Asignar los baños al contrato
      const asignaciones = banoSeleccionado.map((banoId) => ({
        contrato_id: contrato.id,
        bano_id: banoId,
        fecha_inicio: contrato.fecha_inicio,
        fecha_fin: contrato.fecha_fin
      }))

      console.log("Intentando asignar baños:", asignaciones)

      const { error: errorAsignaciones } = await supabase
        .from("banos_contratos")
        .insert(asignaciones)

      if (errorAsignaciones) {
        console.error("Error al asignar los baños:", {
          error: errorAsignaciones,
          message: errorAsignaciones.message,
          details: errorAsignaciones.details,
          hint: errorAsignaciones.hint,
          code: errorAsignaciones.code
        })
        toast.error(`Error al asignar los baños: ${errorAsignaciones.message || "Error desconocido"}`)
        return
      }

      // 3. Actualizar el estado de los baños
      console.log("Intentando actualizar estado de baños:", banoSeleccionado)

      const { error: errorBanos } = await supabase
        .from("banos")
        .update({ estado: "Alquilado", ubicacion: "Cliente" })
        .in("id", banoSeleccionado)

      if (errorBanos) {
        console.error("Error al actualizar el estado de los baños:", {
          error: errorBanos,
          message: errorBanos.message,
          details: errorBanos.details,
          hint: errorBanos.hint,
          code: errorBanos.code
        })
        toast.error(`Error al actualizar el estado de los baños: ${errorBanos.message || "Error desconocido"}`)
        return
      }

      toast.success("Contrato creado exitosamente")
      router.push("/contratos")
    } catch (error) {
      console.error("Error inesperado al guardar el contrato:", error)
      toast.error("Error inesperado al guardar el contrato")
    } finally {
      setGuardando(false)
    }
  }

  if (loading) {
    return <div>Cargando...</div>
  }

  return (
    <div className="flex flex-col p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Nuevo Contrato</h1>

      <Card className="max-w-4xl">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Información del Contrato</CardTitle>
            <CardDescription>Complete los datos para generar un nuevo contrato de alquiler.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente</Label>
                <Select required value={clienteSeleccionado} onValueChange={setClienteSeleccionado}>
                  <SelectTrigger id="cliente">
                    <SelectValue placeholder="Seleccionar cliente">
                      {clientes.find((c) => String(c.id) === String(clienteSeleccionado))?.nombre || ""}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.map((cliente) => (
                      <SelectItem key={String(cliente.id)} value={String(cliente.id)}>
                        {cliente.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="numero">Número de Contrato</Label>
                <Input id="numero" value={numeroContrato} readOnly />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Fecha de Inicio</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !fechaInicio && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fechaInicio ? format(fechaInicio, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={fechaInicio} onSelect={setFechaInicio} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Fecha de Fin</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !fechaFin && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fechaFin ? format(fechaFin, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={fechaFin} onSelect={setFechaFin} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="valorDiario">Valor Diario (por unidad)</Label>
                <Input
                  id="valorDiario"
                  type="number"
                  min="0"
                  step="100"
                  required
                  value={valorDiario}
                  onChange={(e) => setValorDiario(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección de Entrega</Label>
                <Input
                  id="direccion"
                  placeholder={clientes.find((c) => String(c.id) === String(clienteSeleccionado))?.direccion || ""}
                  required
                  value={clientes.find((c) => String(c.id) === String(clienteSeleccionado))?.direccion || ""}
                  onChange={(e) => setDireccionEntrega(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Selección de Baños</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Seleccione los baños que desea incluir en este contrato. Actualmente hay {banosDisponibles.length} baños
                disponibles.
              </p>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Seleccionar</TableHead>
                      <TableHead>ID Baño</TableHead>
                      <TableHead>Ubicación</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {banosDisponibles.map((bano) => (
                      <TableRow key={bano.id}>
                        <TableCell>
                          <Checkbox
                            checked={banoSeleccionado.includes(bano.id)}
                            onCheckedChange={() => handleBanoToggle(bano.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{bano.id}</TableCell>
                        <TableCell>{bano.ubicacion}</TableCell>
                        <TableCell>{bano.estado}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-2 text-sm">
                <span className="font-medium">{banoSeleccionado.length}</span> baños seleccionados
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                rows={3}
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push("/contratos")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={guardando}>
              {guardando ? "Guardando..." : "Crear Contrato"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
