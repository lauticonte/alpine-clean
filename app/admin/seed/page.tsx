"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function SeedPage() {
  const [isLoadingBasic, setIsLoadingBasic] = useState(false)
  const [isLoadingComplete, setIsLoadingComplete] = useState(false)
  const router = useRouter()

  const handleSeedBasic = async () => {
    setIsLoadingBasic(true)
    try {
      const response = await fetch("/api/seed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al poblar la base de datos")
      }

      toast({
        title: "Base de datos poblada",
        description: "Los datos básicos de prueba se han cargado correctamente.",
      })

      // Refrescar la aplicación para mostrar los nuevos datos
      router.refresh()
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setIsLoadingBasic(false)
    }
  }

  const handleSeedComplete = async () => {
    setIsLoadingComplete(true)
    try {
      const response = await fetch("/api/seed/datos-completos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al poblar la base de datos")
      }

      toast({
        title: "Base de datos poblada",
        description: "Los datos completos de prueba se han cargado correctamente.",
      })

      // Refrescar la aplicación para mostrar los nuevos datos
      router.refresh()
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      })
    } finally {
      setIsLoadingComplete(false)
    }
  }

  return (
    <div className="flex flex-col p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Administración</h1>

      <Tabs defaultValue="basic">
        <TabsList>
          <TabsTrigger value="basic">Datos Básicos</TabsTrigger>
          <TabsTrigger value="complete">Datos Completos</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Poblar Base de Datos - Datos Básicos</CardTitle>
              <CardDescription>
                Esta acción cargará datos básicos de prueba en la base de datos para facilitar el testing inicial de la
                aplicación.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Se crearán 5 clientes, 20 baños, 3 contratos, 3 facturas, 3 remitos y 3 alertas de ejemplo.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-800 text-sm">
                <strong>Advertencia:</strong> Esta acción eliminará todos los datos existentes en la base de datos antes
                de cargar los nuevos.
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSeedBasic} disabled={isLoadingBasic}>
                {isLoadingBasic ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cargando datos básicos...
                  </>
                ) : (
                  "Cargar Datos Básicos"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="complete" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Poblar Base de Datos - Datos Completos</CardTitle>
              <CardDescription>
                Esta acción cargará un conjunto completo de datos de prueba en la base de datos para facilitar el
                testing exhaustivo de la aplicación.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Se crearán 8 clientes, 100 baños, 8 contratos, 10 facturas, 9 remitos, 6 pagos y 6 alertas de ejemplo.
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-amber-800 text-sm">
                <strong>Advertencia:</strong> Esta acción eliminará todos los datos existentes en la base de datos antes
                de cargar los nuevos.
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSeedComplete} disabled={isLoadingComplete}>
                {isLoadingComplete ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cargando datos completos...
                  </>
                ) : (
                  "Cargar Datos Completos"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
