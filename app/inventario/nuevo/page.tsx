"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"

export default function NuevoBanoPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    id: "",
    ubicacion: "Depósito Central",
    estado: "Disponible",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = getSupabaseClient()

      const { error } = await supabase.from("banos").insert([formData])

      if (error) throw error

      toast({
        title: "Baño registrado",
        description: `El baño ${formData.id} ha sido registrado correctamente.`,
      })

      router.push("/inventario")
      router.refresh()
    } catch (error) {
      console.error("Error al registrar baño:", error)
      toast({
        title: "Error",
        description: "No se pudo registrar el baño. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Agregar Nuevo Baño</h1>

      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Información del Baño</CardTitle>
            <CardDescription>Ingrese los datos del nuevo baño para registrarlo en el sistema.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="id">ID del Baño</Label>
              <Input id="id" name="id" placeholder="Ej: B040" value={formData.id} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ubicacion">Ubicación</Label>
              <Select value={formData.ubicacion} onValueChange={(value) => handleSelectChange("ubicacion", value)}>
                <SelectTrigger id="ubicacion">
                  <SelectValue placeholder="Seleccionar ubicación" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Depósito Central">Depósito Central</SelectItem>
                  <SelectItem value="Sucursal Norte">Sucursal Norte</SelectItem>
                  <SelectItem value="Sucursal Sur">Sucursal Sur</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select value={formData.estado} onValueChange={(value) => handleSelectChange("estado", value)}>
                <SelectTrigger id="estado">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Disponible">Disponible</SelectItem>
                  <SelectItem value="Mantenimiento">En Mantenimiento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push("/inventario")} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar Baño"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
