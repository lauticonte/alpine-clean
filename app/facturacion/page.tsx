import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Search, Printer, Eye, FileDown } from "lucide-react"
import Link from "next/link"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// Datos de ejemplo para documentos agrupados por cliente
const clientesConDocumentos = [
  {
    id: 1,
    nombre: "Constructora ABC",
    facturas: [
      {
        id: "F-2023-042",
        fecha: "10/05/2023",
        contrato: "C-2023-097",
        monto: 45000,
        estado: "Pendiente",
        archivo: true,
      },
      {
        id: "F-2023-041",
        fecha: "05/05/2023",
        contrato: "C-2023-099",
        monto: 87000,
        estado: "Pendiente",
        archivo: true,
      },
    ],
    remitos: [
      {
        id: "R-2023-056",
        fecha: "10/05/2023",
        contrato: "C-2023-097",
        tipo: "Entrega",
        cantidad: 5,
        archivo: true,
      },
      {
        id: "R-2023-055",
        fecha: "05/05/2023",
        contrato: "C-2023-098",
        tipo: "Retiro",
        cantidad: 8,
        archivo: true,
      },
    ],
  },
  {
    id: 2,
    nombre: "Eventos XYZ",
    facturas: [
      {
        id: "F-2023-040",
        fecha: "01/05/2023",
        contrato: "C-2023-102",
        monto: 64000,
        estado: "Pagada",
        archivo: true,
      },
    ],
    remitos: [
      {
        id: "R-2023-054",
        fecha: "01/05/2023",
        contrato: "C-2023-102",
        tipo: "Entrega",
        cantidad: 12,
        archivo: false,
      },
    ],
  },
  {
    id: 3,
    nombre: "Municipalidad de San Martín",
    facturas: [
      {
        id: "F-2023-039",
        fecha: "28/04/2023",
        contrato: "C-2023-103",
        monto: 35000,
        estado: "Pagada",
        archivo: true,
      },
    ],
    remitos: [
      {
        id: "R-2023-053",
        fecha: "28/04/2023",
        contrato: "C-2023-103",
        tipo: "Entrega",
        cantidad: 5,
        archivo: true,
      },
    ],
  },
]

export default function FacturacionPage() {
  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Facturación</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/facturacion/remito">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nuevo Remito
            </Link>
          </Button>
          <Button asChild>
            <Link href="/facturacion/factura">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nueva Factura
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Facturación Mensual</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$285,000</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Remitos Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Facturas Impagas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">12</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Buscar por cliente, número de documento..." className="pl-8" />
        </div>
      </div>

      <Tabs defaultValue="porCliente">
        <TabsList>
          <TabsTrigger value="porCliente">Por Cliente</TabsTrigger>
          <TabsTrigger value="facturas">Facturas</TabsTrigger>
          <TabsTrigger value="remitos">Remitos</TabsTrigger>
        </TabsList>

        <TabsContent value="porCliente" className="space-y-6">
          <Accordion type="single" collapsible className="w-full">
            {clientesConDocumentos.map((cliente) => (
              <AccordionItem key={cliente.id} value={`cliente-${cliente.id}`}>
                <AccordionTrigger className="hover:bg-accent hover:text-accent-foreground px-4 py-2 rounded-md">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{cliente.nombre}</span>
                    <div className="flex gap-2 ml-4">
                      <Badge variant="outline" className="bg-blue-50">
                        {cliente.facturas.length} Facturas
                      </Badge>
                      <Badge variant="outline" className="bg-green-50">
                        {cliente.remitos.length} Remitos
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pt-2">
                  <div className="space-y-6">
                    {cliente.facturas.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold mb-2">Facturas</h3>
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Nº Factura</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Contrato</TableHead>
                                <TableHead>Monto</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {cliente.facturas.map((factura) => (
                                <TableRow key={factura.id}>
                                  <TableCell className="font-medium">{factura.id}</TableCell>
                                  <TableCell>{factura.fecha}</TableCell>
                                  <TableCell>
                                    <Link href={`/contratos/${factura.contrato}`} className="hover:underline">
                                      {factura.contrato}
                                    </Link>
                                  </TableCell>
                                  <TableCell>${factura.monto.toLocaleString()}</TableCell>
                                  <TableCell>
                                    <Badge variant={factura.estado === "Pendiente" ? "destructive" : "default"}>
                                      {factura.estado}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                      <Button variant="ghost" size="icon">
                                        <Eye className="h-4 w-4" />
                                        <span className="sr-only">Ver factura</span>
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        disabled={!factura.archivo}
                                        title={factura.archivo ? "Descargar archivo" : "No hay archivo disponible"}
                                      >
                                        <FileDown className="h-4 w-4" />
                                        <span className="sr-only">Descargar</span>
                                      </Button>
                                      <Button variant="ghost" size="icon">
                                        <Printer className="h-4 w-4" />
                                        <span className="sr-only">Imprimir</span>
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}

                    {cliente.remitos.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold mb-2">Remitos</h3>
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Nº Remito</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Contrato</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Cantidad</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {cliente.remitos.map((remito) => (
                                <TableRow key={remito.id}>
                                  <TableCell className="font-medium">{remito.id}</TableCell>
                                  <TableCell>{remito.fecha}</TableCell>
                                  <TableCell>
                                    <Link href={`/contratos/${remito.contrato}`} className="hover:underline">
                                      {remito.contrato}
                                    </Link>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline">{remito.tipo}</Badge>
                                  </TableCell>
                                  <TableCell>{remito.cantidad} baños</TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                      <Button variant="ghost" size="icon">
                                        <Eye className="h-4 w-4" />
                                        <span className="sr-only">Ver remito</span>
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        disabled={!remito.archivo}
                                        title={remito.archivo ? "Descargar archivo" : "No hay archivo disponible"}
                                      >
                                        <FileDown className="h-4 w-4" />
                                        <span className="sr-only">Descargar</span>
                                      </Button>
                                      <Button variant="ghost" size="icon">
                                        <Printer className="h-4 w-4" />
                                        <span className="sr-only">Imprimir</span>
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>

        <TabsContent value="facturas" className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº Factura</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Contrato</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientesConDocumentos.flatMap((cliente) =>
                  cliente.facturas.map((factura) => (
                    <TableRow key={`${cliente.id}-${factura.id}`}>
                      <TableCell className="font-medium">{factura.id}</TableCell>
                      <TableCell>{factura.fecha}</TableCell>
                      <TableCell>{cliente.nombre}</TableCell>
                      <TableCell>{factura.contrato}</TableCell>
                      <TableCell>${factura.monto.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={factura.estado === "Pendiente" ? "destructive" : "default"}>
                          {factura.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Ver factura</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={!factura.archivo}
                            title={factura.archivo ? "Descargar archivo" : "No hay archivo disponible"}
                          >
                            <FileDown className="h-4 w-4" />
                            <span className="sr-only">Descargar</span>
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Printer className="h-4 w-4" />
                            <span className="sr-only">Imprimir</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )),
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="remitos" className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº Remito</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Contrato</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientesConDocumentos.flatMap((cliente) =>
                  cliente.remitos.map((remito) => (
                    <TableRow key={`${cliente.id}-${remito.id}`}>
                      <TableCell className="font-medium">{remito.id}</TableCell>
                      <TableCell>{remito.fecha}</TableCell>
                      <TableCell>{cliente.nombre}</TableCell>
                      <TableCell>{remito.contrato}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{remito.tipo}</Badge>
                      </TableCell>
                      <TableCell>{remito.cantidad} baños</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Ver remito</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={!remito.archivo}
                            title={remito.archivo ? "Descargar archivo" : "No hay archivo disponible"}
                          >
                            <FileDown className="h-4 w-4" />
                            <span className="sr-only">Descargar</span>
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Printer className="h-4 w-4" />
                            <span className="sr-only">Imprimir</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )),
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
