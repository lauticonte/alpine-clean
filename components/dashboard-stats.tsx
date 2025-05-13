import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Warehouse, FileText, AlertTriangle, TrendingUp } from "lucide-react"
import { createServerSupabaseClient } from "@/lib/supabase/server"

// Función para calcular días entre fechas
const calcularDiasRestantes = (fechaFin: string): number => {
  const hoy = new Date()
  const fin = new Date(fechaFin)

  const diferencia = fin.getTime() - hoy.getTime()
  return Math.ceil(diferencia / (1000 * 3600 * 24))
}

export async function DashboardStats() {
  const supabase = createServerSupabaseClient()

  // Obtener baños
  const { data: banos, error: errorBanos } = await supabase.from("banos").select("estado")

  // Obtener contratos activos
  const { data: contratos, error: errorContratos } = await supabase.from("contratos").select("*")

  // Obtener baños asignados a contratos
  const { data: banosContratos, error: errorAsignados } = await supabase.from("banos_contratos").select("fecha_fin")

  if (errorBanos || errorContratos || errorAsignados) {
    console.error("Error al obtener datos para el dashboard:", errorBanos || errorContratos || errorAsignados)
  }

  // Calcular estadísticas
  const totalBanos = banos?.length || 0
  const banosDisponibles = banos?.filter((bano) => bano.estado === "Disponible").length || 0
  const contratosActivos = contratos?.length || 0

  // Calcular baños vencidos
  const banosVencidos =
    banosContratos?.filter((bano) => {
      const diasRestantes = calcularDiasRestantes(bano.fecha_fin)
      return diasRestantes < 0
    }).length || 0

  // Calcular cargo adicional estimado (asumimos un valor promedio de 1500 por día)
  const cargoAdicionalEstimado = banosVencidos * 1500 * 3 // Asumimos un promedio de 3 días de retraso

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Baños Disponibles</CardTitle>
          <Warehouse className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{banosDisponibles}</div>
          <p className="text-xs text-muted-foreground">De un total de {totalBanos} unidades</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Contratos Activos</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{contratosActivos}</div>
          <p className="text-xs text-muted-foreground">+2 desde la semana pasada</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Baños Vencidos</CardTitle>
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{banosVencidos}</div>
          <p className="text-xs text-muted-foreground">Cargo adicional: ${cargoAdicionalEstimado.toLocaleString()}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Facturación Mensual</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$285,000</div>
          <p className="text-xs text-muted-foreground">+18% respecto al mes anterior</p>
        </CardContent>
      </Card>
    </div>
  )
}
