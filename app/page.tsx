import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardStats } from "@/components/dashboard-stats"
import { ClientesRecientes } from "@/components/clientes-recientes"
import { ContratosActivos } from "@/components/contratos-activos"
import { AlertasVencimiento } from "@/components/alertas-vencimiento"

export default function Home() {
  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Tabs defaultValue="dia">
            <TabsList>
              <TabsTrigger value="dia">Día</TabsTrigger>
              <TabsTrigger value="semana">Semana</TabsTrigger>
              <TabsTrigger value="mes">Mes</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <DashboardStats />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Clientes Recientes</CardTitle>
            <CardDescription>Últimos clientes registrados</CardDescription>
          </CardHeader>
          <CardContent>
            <ClientesRecientes />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contratos Activos</CardTitle>
            <CardDescription>Contratos en curso</CardDescription>
          </CardHeader>
          <CardContent>
            <ContratosActivos />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertas</CardTitle>
            <CardDescription>Vencimientos y pagos pendientes</CardDescription>
          </CardHeader>
          <CardContent>
            <AlertasVencimiento />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
