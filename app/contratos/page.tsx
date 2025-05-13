import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Search, FileText, Eye } from "lucide-react"
import Link from "next/link"
import { createServerSupabaseClient } from "@/lib/supabase/server"

// Función para calcular días entre fechas
const calcularDiasRestantes = (fechaFin: string): number => {
  const hoy = new Date()
  const fin = new Date(fechaFin)

  const diferencia = fin.getTime() - hoy.getTime()
  return Math.ceil(diferencia / (1000 * 3600 * 24))
}

export default async function ContratosPage() {
  const supabase = createServerSupabaseClient()

  // Obtener contratos con información de clientes
  const { data: contratos, error } = await supabase
    .from("contratos")
    .select(`
      *,
      clientes(id, nombre)
    `)
    .order("fecha_inicio", { ascending: false })

  if (error) {
    console.error("Error al obtener contratos:", error)
  }

  // Obtener todos los registros de baños_contratos
  const { data: banosContratosData, error: errorBanos } = await supabase
    .from("banos_contratos")
    .select("contrato_id, bano_id")

  if (errorBanos) {
    console.error("Error al obtener baños por contrato:", errorBanos)
  }

  // Agrupar manualmente los baños por contrato y contar
  const banosPorContrato: Record<string, number> = {}

  if (banosContratosData) {
    banosContratosData.forEach((item) => {
      if (!banosPorContrato[item.contrato_id]) {
        banosPorContrato[item.contrato_id] = 0
      }
      banosPorContrato[item.contrato_id]++
    })
  }

  // Calcular contratos activos, por vencer y valor total
  const contratosActivos =
    contratos?.filter((contrato) => {
      const diasRestantes = calcularDiasRestantes(contrato.fecha_fin)
      return diasRestantes >= 0
    }) || []

  const contratosPorVencer =
    contratos?.filter((contrato) => {
      const diasRestantes = calcularDiasRestantes(contrato.fecha_fin)
      return diasRestantes >= 0 && diasRestantes <= 7
    }) || []

  // Calcular valor total de contratos activos
  const valorTotalActivo = contratosActivos.reduce((total, contrato) => {
    const cantidadBanos = banosPorContrato[contrato.id] || 0
    const diasTotales = Math.ceil(
      (new Date(contrato.fecha_fin).getTime() - new Date(contrato.fecha_inicio).getTime()) / (1000 * 3600 * 24),
    )
    return total + cantidadBanos * contrato.valor_diario * diasTotales
  }, 0)

  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Contratos</h1>
        <Button asChild>
          <Link href="/contratos/nuevo">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo Contrato
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Contratos Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contratosActivos.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Por Vencer (7 días)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{contratosPorVencer.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Activo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${valorTotalActivo.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Buscar por cliente, número de contrato..." className="pl-8" />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nº Contrato</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Valor Diario</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contratos &&
              contratos.map((contrato) => {
                const diasRestantes = calcularDiasRestantes(contrato.fecha_fin)
                const cantidadBanos = banosPorContrato[contrato.id] || 0

                let estado = "Activo"
                if (diasRestantes < 0) {
                  estado = "Finalizado"
                } else if (diasRestantes <= 7) {
                  estado = "Por vencer"
                }

                return (
                  <TableRow key={contrato.id}>
                    <TableCell className="font-medium">{contrato.id}</TableCell>
                    <TableCell>{contrato.clientes?.nombre}</TableCell>
                    <TableCell>
                      {new Date(contrato.fecha_inicio).toLocaleDateString("es-ES")} al{" "}
                      {new Date(contrato.fecha_fin).toLocaleDateString("es-ES")}
                    </TableCell>
                    <TableCell>{cantidadBanos} baños</TableCell>
                    <TableCell>${contrato.valor_diario}</TableCell>
                    <TableCell>
                      <Badge
                        variant={estado === "Activo" ? "default" : estado === "Por vencer" ? "destructive" : "outline"}
                      >
                        {estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/contratos/${contrato.id}`}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Ver contrato</span>
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/contratos/${contrato.id}/pdf`}>
                            <FileText className="h-4 w-4" />
                            <span className="sr-only">PDF</span>
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}

            {(!contratos || contratos.length === 0) && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                  No hay contratos registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
