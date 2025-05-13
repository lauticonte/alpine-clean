"use client"

import type React from "react"

import { createContext, useContext, useState } from "react"

interface SidebarContextType {
  isOpen: boolean
  toggle: () => void
}

const SidebarContext = createContext<SidebarContextType>({
  isOpen: false,
  toggle: () => {},
})

// Modificar el SidebarProvider para inicializar el estado del sidebar correctamente
export function SidebarProvider({ children }: { children: React.ReactNode }) {
  // Inicializar isOpen como false para que el sidebar esté cerrado por defecto en móviles
  const [isOpen, setIsOpen] = useState(false)

  const toggle = () => {
    setIsOpen(!isOpen)
  }

  return <SidebarContext.Provider value={{ isOpen, toggle }}>{children}</SidebarContext.Provider>
}

export const useSidebarContext = () => useContext(SidebarContext)
