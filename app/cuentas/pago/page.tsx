"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Upload } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClientSupabaseClient } from "@/lib/supabase/client"

interface Cliente {
  id: string
  nombre: string
  cuit: string
  telefono: string
  direccion: string
}

export default function RegistrarPagoPage() {
  const router = useRouter()
  const [fechaPago, setFechaPago] = useState<Date>()
  const [tieneFactura, setTieneFactura] = useState(false)
  const [tieneRemito, setTieneRemito] = useState(false)
  const [facturaFile, setFacturaFile] = useState<File | null>(null)
  const [remitoFile, setRemitoFile] = useState<File | null>(null)
  const [activeTab, setActiveTab] = useState("detalles")
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)

  // Obtener clientes de Supabase
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const supabase = createClientSupabaseClient()
        const { data, error } = await supabase
          .from("clientes")
          .select("*")
          .order("nombre")

        if (error) {
          console.error("Error al obtener clientes:", error)
          return
        }

        setClientes(data || [])
      } catch (error) {
        console.error("Error al inicializar Supabase:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchClientes()
  }, [])

  const handleFacturaFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFacturaFile(e.target.files[0])
    }
  }

  const handleRemitoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setRemitoFile(e.target.files[0])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí iría la lógica para registrar el pago y los documentos asociados
    console.log("Tiene factura:", tieneFactura)
    console.log("Tiene remito:", tieneRemito)
    console.log("Archivo de factura:", facturaFile)
    console.log("Archivo de remito:", remitoFile)
    router.push("/cuentas")
  }

  if (loading) {
    return <div>Cargando...</div>
  }

  return (
    <div className="flex flex-col p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Registrar Pago</h1>

      <Card className="max-w-3xl">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Información del Pago</CardTitle>
            <CardDescription>Complete los datos para registrar un nuevo pago.</CardDescription>
          </CardHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="detalles">Detalles del Pago</TabsTrigger>
                <TabsTrigger value="documentos">Documentos Asociados</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="detalles" className="p-0">
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="cliente">Cliente</Label>
                  <Select required>
                    <SelectTrigger id="cliente">
                      <SelectValue placeholder="Seleccionar cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Fecha de Pago</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !fechaPago && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {fechaPago ? format(fechaPago, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={fechaPago} onSelect={setFechaPago} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monto">Monto</Label>
                    <Input id="monto" type="number" min="0" step="100" required />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="metodo">Método de Pago</Label>
                    <Select required>
                      <SelectTrigger id="metodo">
                        <SelectValue placeholder="Seleccionar método" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="efectivo">Efectivo</SelectItem>
                        <SelectItem value="transferencia">Transferencia</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                        <SelectItem value="tarjeta">Tarjeta de Crédito/Débito</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comprobante">Nº de Comprobante</Label>
                    <Input id="comprobante" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Textarea id="observaciones" rows={3} />
                </div>
              </CardContent>
            </TabsContent>

            <TabsContent value="documentos" className="p-0">
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="tieneFactura"
                      checked={tieneFactura}
                      onCheckedChange={(checked) => {
                        setTieneFactura(checked === true)
                      }}
                    />
                    <Label htmlFor="tieneFactura" className="font-medium">
                      Factura asociada
                    </Label>
                  </div>

                  {tieneFactura && (
                    <div className="ml-6 space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="numeroFactura">Número de Factura</Label>
                          <Input id="numeroFactura" placeholder="Ej: F-2023-045" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fechaFactura">Fecha de Factura</Label>
                          <Input id="fechaFactura" type="date" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="archivoFactura">Adjuntar Factura (PDF)</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="archivoFactura"
                            type="file"
                            accept=".pdf"
                            onChange={handleFacturaFileChange}
                            className="flex-1"
                          />
                          <Button type="button" variant="outline" size="icon">
                            <Upload className="h-4 w-4" />
                          </Button>
                        </div>
                        {facturaFile && (
                          <p className="text-sm text-muted-foreground mt-1">Archivo seleccionado: {facturaFile.name}</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 mt-6">
                    <Checkbox
                      id="tieneRemito"
                      checked={tieneRemito}
                      onCheckedChange={(checked) => {
                        setTieneRemito(checked === true)
                      }}
                    />
                    <Label htmlFor="tieneRemito" className="font-medium">
                      Remito asociado
                    </Label>
                  </div>

                  {tieneRemito && (
                    <div className="ml-6 space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="numeroRemito">Número de Remito</Label>
                          <Input id="numeroRemito" placeholder="Ej: R-2023-058" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fechaRemito">Fecha de Remito</Label>
                          <Input id="fechaRemito" type="date" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="archivoRemito">Adjuntar Remito (PDF)</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="archivoRemito"
                            type="file"
                            accept=".pdf"
                            onChange={handleRemitoFileChange}
                            className="flex-1"
                          />
                          <Button type="button" variant="outline" size="icon">
                            <Upload className="h-4 w-4" />
                          </Button>
                        </div>
                        {remitoFile && (
                          <p className="text-sm text-muted-foreground mt-1">Archivo seleccionado: {remitoFile.name}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </TabsContent>
          </Tabs>

          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push("/cuentas")}>
              Cancelar
            </Button>
            <div className="flex gap-2">
              {activeTab === "detalles" ? (
                <Button type="button" onClick={() => setActiveTab("documentos")}>
                  Siguiente
                </Button>
              ) : (
                <>
                  <Button type="button" variant="outline" onClick={() => setActiveTab("detalles")}>
                    Anterior
                  </Button>
                  <Button type="submit">Registrar Pago</Button>
                </>
              )}
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
