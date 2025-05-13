"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { createClientSupabaseClient } from "@/lib/supabase/client"

interface Cliente {
  id: string
  nombre: string
  cuit: string
  telefono: string
  direccion: string
}

export function ClientesRecientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const supabase = createClientSupabaseClient()
        const { data, error } = await supabase
          .from("clientes")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(3)

        if (error) {
          console.error("Error al obtener clientes recientes:", error)
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

  if (loading) {
    return <div>Cargando...</div>
  }

  return (
    <div className="space-y-4">
      {clientes.map((cliente) => {
        const iniciales = cliente.nombre
          .split(" ")
          .map((word) => word[0])
          .join("")
          .toUpperCase()

        return (
          <div key={cliente.id} className="flex items-center gap-4">
            <Avatar>
              <AvatarFallback>{iniciales}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">{cliente.nombre}</p>
              <p className="text-xs text-muted-foreground">CUIT: {cliente.cuit}</p>
            </div>
            <div className="ml-auto text-xs text-muted-foreground">
              {new Date().toLocaleDateString("es-ES")}
            </div>
          </div>
        )
      })}
    </div>
  )
}
