import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, CreditCard, ArrowUpDown } from "lucide-react"
import Link from "next/link"

const cuentas = [
  {
    id: 1,
    cliente: "Constructora ABC",
    deudaTotal: 132000,
    ultimoPago: "01/05/2023",
    montoUltimoPago: 45000,
    estado: "Con deuda",
  },
  {
    id: 2,
    cliente: "Eventos XYZ",
    deudaTotal: 12800,
    ultimoPago: "28/04/2023",
    montoUltimoPago: 64000,
    estado: "Con deuda",
  },
  {
    id: 3,
    cliente: "Municipalidad de San Martín",
    deudaTotal: 73500,
    ultimoPago: "15/04/2023",
    montoUltimoPago: 35000,
    estado: "Con deuda",
  },
  {
    id: 4,
    cliente: "Empresa de Construcción DEF",
    deudaTotal: 0,
    ultimoPago: "20/04/2023",
    montoUltimoPago: 56000,
    estado: "Al día",
  },
  {
    id: 5,
    cliente: "Productora de Eventos MNO",
    deudaTotal: 8900,
    ultimoPago: "10/04/2023",
    montoUltimoPago: 42000,
    estado: "Con deuda",
  },
]

export default function CuentasPage() {
  return (
    <div className="flex flex-col p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Cuentas Corrientes</h1>
        <Button asChild>
          <Link href="/cuentas/pago">
            <CreditCard className="mr-2 h-4 w-4" />
            Registrar Pago
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Deuda Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">$227,200</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Clientes con Deuda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pagos del Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">$242,000</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Buscar por cliente..." className="pl-8" />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  Deuda Total
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead>Último Pago</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cuentas.map((cuenta) => (
              <TableRow key={cuenta.id}>
                <TableCell className="font-medium">
                  <Link href={`/cuentas/${cuenta.id}`} className="hover:underline">
                    {cuenta.cliente}
                  </Link>
                </TableCell>
                <TableCell
                  className={cuenta.deudaTotal > 0 ? "text-destructive font-medium" : "text-green-600 font-medium"}
                >
                  ${cuenta.deudaTotal.toLocaleString()}
                </TableCell>
                <TableCell>{cuenta.ultimoPago}</TableCell>
                <TableCell>${cuenta.montoUltimoPago.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant={cuenta.estado === "Al día" ? "outline" : "destructive"}>{cuenta.estado}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/cuentas/${cuenta.id}`}>Ver Detalle</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
