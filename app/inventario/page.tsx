import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { PlusCircle, Search, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { createServerSupabaseClient } from "@/lib/supabase/server"

// Función para calcular días entre fechas
const calcularDiasRestantes = (fechaFin: string): number => {
  const hoy = new Date()
  const fin = new Date(fechaFin)

  const diferencia = fin.getTime() - hoy.getTime()
  return Math.ceil(diferencia / (1000 * 3600 * 24))
}

interface Cliente {
  id: string
  nombre: string
}

interface Contrato {
  id: string
  valor_diario: number
  cliente_id: string
  clientes: Cliente
}

interface Bano {
  id: string
  estado: string
  ubicacion: string
}

interface BanoContrato {
  bano_id: string
  fecha_inicio: string
  fecha_fin: string
  banos: Bano
  contratos: Contrato
}

interface BanoAsignado {
  id: string
  fechaInicio: string
  fechaFin: string
  fechaFinRaw: string
  contrato: string
  estado: string
  cobro: string
}

interface ClienteData {
  cliente: string
  banosAsignados: BanoAsignado[]
}

export default async function InventarioPage() {
  const supabase = createServerSupabaseClient()

  // Obtener baños disponibles
  const { data: banosDisponibles, error: errorDisponibles } = await supabase
    .from("banos")
    .select("*")
    .eq("estado", "Disponible")

  // Obtener baños alquilados con información de contratos y clientes
  const { data: banosAlquilados, error: errorAlquilados } = await supabase
    .from("banos_contratos")
    .select(`
      bano_id,
      fecha_inicio,
      fecha_fin,
      banos!inner(id, estado, ubicacion),
      contratos!inner(
        id,
        valor_diario,
        clientes!inner(id, nombre)
      )
    `)
    .eq("banos.estado", "Alquilado")

  if (errorDisponibles) {
    console.error("Error al obtener baños disponibles:", errorDisponibles)
  }

  if (errorAlquilados) {
    console.error("Error al obtener baños alquilados:", errorAlquilados)
  }

  // Agrupar baños por cliente
  const banosPorCliente: Record<string, ClienteData> = {}

  banosAlquilados?.forEach((bano: any) => {
    const clienteId = bano.contratos.clientes.id
    const clienteNombre = bano.contratos.clientes.nombre

    if (!banosPorCliente[clienteId]) {
      banosPorCliente[clienteId] = {
        cliente: clienteNombre,
        banosAsignados: [],
      }
    }

    banosPorCliente[clienteId].banosAsignados.push({
      id: bano.bano_id,
      fechaInicio: new Date(bano.fecha_inicio).toLocaleDateString("es-ES"),
      fechaFin: new Date(bano.fecha_fin).toLocaleDateString("es-ES"),
      fechaFinRaw: bano.fecha_fin,
      contrato: bano.contratos.id,
      estado: bano.banos.estado,
      cobro: `$${bano.contratos.valor_diario}/día`,
    })
  })

  // Calcular totales para las estadísticas
  const totalBanos = (banosDisponibles?.length || 0) + (banosAlquilados?.length || 0)
  const totalAlquilados = banosAlquilados?.length || 0

  const porcentajeDisponibles = Math.round(((banosDisponibles?.length || 0) / totalBanos) * 100) || 0
  const porcentajeAlquilados = Math.round((totalAlquilados / totalBanos) * 100) || 0

  // Calcular baños vencidos y por vencer
  const banosVencidos =
    banosAlquilados?.filter((bano) => {
      const diasRestantes = calcularDiasRestantes(bano.fecha_fin)
      return diasRestantes < 0
    }).length || 0

  const banosPorVencer =
    banosAlquilados?.filter((bano) => {
      const diasRestantes = calcularDiasRestantes(bano.fecha_fin)
      return diasRestantes >= 0 && diasRestantes <= 7
    }).length || 0

  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Inventario de Baños</h1>
        <Button asChild>
          <Link href="/inventario/nuevo">
            <PlusCircle className="mr-2 h-4 w-4" />
            Agregar Baño
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Baños</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBanos}</div>
            <div className="text-xs text-muted-foreground">
              {banosDisponibles?.length || 0} disponibles, {totalAlquilados} alquilados
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Baños Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{banosDisponibles?.length || 0}</div>
            <div className="text-xs text-muted-foreground">{porcentajeDisponibles}% del total</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Baños Vencidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{banosVencidos}</div>
            <div className="text-xs text-muted-foreground">Pendientes de retiro</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Por Vencer (7 días)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{banosPorVencer}</div>
            <div className="text-xs text-muted-foreground">Próximos a vencer</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Buscar por ID, cliente, contrato..." className="pl-8" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Baños Alquilados</CardTitle>
          <CardDescription>Agrupados por cliente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.values(banosPorCliente).map((clienteData: ClienteData) => (
              <div key={clienteData.cliente} className="space-y-2">
                <h3 className="text-lg font-semibold">{clienteData.cliente}</h3>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID Baño</TableHead>
                        <TableHead>Fecha Inicio</TableHead>
                        <TableHead>Fecha Fin</TableHead>
                        <TableHead>Días Restantes</TableHead>
                        <TableHead>Contrato</TableHead>
                        <TableHead>Cobro Diario</TableHead>
                        <TableHead>Cargo Adicional</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clienteData.banosAsignados.map((bano: BanoAsignado) => {
                        const diasRestantes = calcularDiasRestantes(bano.fechaFinRaw)
                        const valorDiario = Number.parseInt(bano.cobro.replace("$", "").replace("/día", ""))
                        const cargoAdicional = diasRestantes < 0 ? Math.abs(diasRestantes) * valorDiario : 0

                        return (
                          <TableRow key={bano.id}>
                            <TableCell className="font-medium">{bano.id}</TableCell>
                            <TableCell>{bano.fechaInicio}</TableCell>
                            <TableCell>{bano.fechaFin}</TableCell>
                            <TableCell>
                              {diasRestantes >= 0 ? (
                                <span className={diasRestantes <= 7 ? "text-amber-500 font-medium" : ""}>
                                  {diasRestantes} días
                                </span>
                              ) : (
                                <span className="text-destructive font-medium flex items-center">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  {Math.abs(diasRestantes)} días de retraso
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Link href={`/contratos/${bano.contrato}`} className="hover:underline">
                                {bano.contrato}
                              </Link>
                            </TableCell>
                            <TableCell>{bano.cobro}</TableCell>
                            <TableCell>
                              {cargoAdicional > 0 ? (
                                <span className="text-destructive font-medium">${cargoAdicional.toLocaleString()}</span>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={diasRestantes < 0 ? "destructive" : diasRestantes <= 7 ? "outline" : "default"}
                              >
                                {diasRestantes < 0 ? "Vencido" : diasRestantes <= 7 ? "Por vencer" : "Alquilado"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}

            {Object.keys(banosPorCliente).length === 0 && (
              <div className="text-center py-4 text-muted-foreground">No hay baños alquilados actualmente</div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Baños Disponibles</CardTitle>
          <CardDescription>Baños no asignados a clientes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Baño</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banosDisponibles &&
                  banosDisponibles.map((bano) => (
                    <TableRow key={bano.id}>
                      <TableCell className="font-medium">{bano.id}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50">
                          {bano.estado}
                        </Badge>
                      </TableCell>
                      <TableCell>{bano.ubicacion}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/contratos/nuevo?bano=${bano.id}`}>Asignar a Contrato</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}

                {(!banosDisponibles || banosDisponibles.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                      No hay baños disponibles
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
