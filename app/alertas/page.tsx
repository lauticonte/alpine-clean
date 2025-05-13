import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Calendar, CreditCard, CheckCircle2 } from "lucide-react"
import { createServerSupabaseClient } from "@/lib/supabase/server"

export default async function AlertasPage() {
  const supabase = createServerSupabaseClient()

  // Obtener alertas con información de clientes
  const { data: alertas, error } = await supabase
    .from("alertas")
    .select(`
      *,
      clientes(id, nombre)
    `)
    .eq("resuelta", false)
    .order("fecha", { ascending: false })

  if (error) {
    console.error("Error al obtener alertas:", error)
  }

  // Contar alertas por tipo
  const alertasPago = alertas?.filter((alerta) => alerta.tipo === "pago") || []
  const alertasContrato = alertas?.filter((alerta) => alerta.tipo === "contrato") || []

  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Alertas</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Alertas Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertas?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pagos Vencidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{alertasPago.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Contratos por Vencer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{alertasContrato.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="todas">
        <TabsList>
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="pagos">Pagos</TabsTrigger>
          <TabsTrigger value="contratos">Contratos</TabsTrigger>
        </TabsList>

        <TabsContent value="todas" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Buscar alertas..." className="pl-8" />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Mensaje</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alertas &&
                  alertas.map((alerta) => (
                    <TableRow key={alerta.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="rounded-full bg-primary/10 p-1.5 text-primary">
                            {alerta.tipo === "pago" ? (
                              <CreditCard className="h-4 w-4" />
                            ) : (
                              <Calendar className="h-4 w-4" />
                            )}
                          </div>
                          <span className="capitalize">{alerta.tipo}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{alerta.clientes?.nombre}</TableCell>
                      <TableCell>{alerta.mensaje}</TableCell>
                      <TableCell>{new Date(alerta.fecha).toLocaleDateString("es-ES")}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            alerta.prioridad === "alta"
                              ? "destructive"
                              : alerta.prioridad === "media"
                                ? "default"
                                : "outline"
                          }
                        >
                          {alerta.prioridad.charAt(0).toUpperCase() + alerta.prioridad.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Marcar como resuelta
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}

                {(!alertas || alertas.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                      No hay alertas pendientes
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="pagos" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Buscar alertas de pagos..." className="pl-8" />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Mensaje</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alertasPago.length > 0 ? (
                  alertasPago.map((alerta) => (
                    <TableRow key={alerta.id}>
                      <TableCell className="font-medium">{alerta.clientes?.nombre}</TableCell>
                      <TableCell>{alerta.mensaje}</TableCell>
                      <TableCell>{new Date(alerta.fecha).toLocaleDateString("es-ES")}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            alerta.prioridad === "alta"
                              ? "destructive"
                              : alerta.prioridad === "media"
                                ? "default"
                                : "outline"
                          }
                        >
                          {alerta.prioridad.charAt(0).toUpperCase() + alerta.prioridad.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Marcar como resuelta
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      No hay alertas de pagos pendientes
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="contratos" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Buscar alertas de contratos..." className="pl-8" />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Mensaje</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Prioridad</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alertasContrato.length > 0 ? (
                  alertasContrato.map((alerta) => (
                    <TableRow key={alerta.id}>
                      <TableCell className="font-medium">{alerta.clientes?.nombre}</TableCell>
                      <TableCell>{alerta.mensaje}</TableCell>
                      <TableCell>{new Date(alerta.fecha).toLocaleDateString("es-ES")}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            alerta.prioridad === "alta"
                              ? "destructive"
                              : alerta.prioridad === "media"
                                ? "default"
                                : "outline"
                          }
                        >
                          {alerta.prioridad.charAt(0).toUpperCase() + alerta.prioridad.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Marcar como resuelta
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      No hay alertas de contratos pendientes
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
