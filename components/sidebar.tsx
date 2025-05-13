"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Users,
  Warehouse,
  FileText,
  Receipt,
  CreditCard,
  Bell,
  Settings,
  Menu,
  Database,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useSidebarContext } from "@/components/sidebar-provider"

// Simplificamos los elementos de navegación para reflejar la nueva estructura
const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: BarChart3,
  },
  {
    title: "Inventario",
    href: "/inventario",
    icon: Warehouse,
  },
  {
    title: "Clientes",
    href: "/clientes",
    icon: Users,
  },
  {
    title: "Contratos",
    href: "/contratos",
    icon: FileText,
  },
  {
    title: "Facturación",
    href: "/facturacion",
    icon: Receipt,
  },
  {
    title: "Cuentas Corrientes",
    href: "/cuentas",
    icon: CreditCard,
  },
  {
    title: "Alertas",
    href: "/alertas",
    icon: Bell,
  },
  {
    title: "Configuración",
    href: "/configuracion",
    icon: Settings,
  },
  {
    title: "Admin",
    href: "/admin/seed",
    icon: Database,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { isOpen, toggle } = useSidebarContext()

  const sidebarWidth = "240px"

  return (
    <>
      <Sheet open={isOpen} onOpenChange={toggle}>
        <SheetContent side="left" className="p-0 w-[240px]">
          <div className="py-4">
            <div className="px-3 py-2">
              <h2 className="mb-2 px-4 text-lg font-semibold">Baños Químicos</h2>
              <div className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                      pathname === item.href ? "bg-accent text-accent-foreground" : "transparent",
                    )}
                    onClick={() => {
                      if (window.innerWidth < 768) {
                        toggle()
                      }
                    }}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <aside
        className={cn(
          "fixed left-0 top-0 z-30 h-screen w-[240px] border-r bg-background transition-all duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0", // Siempre visible en desktop
        )}
      >
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="text-primary">Baños Químicos</span>
          </Link>
        </div>
        <div className="py-4">
          <nav className="grid gap-1 px-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  pathname === item.href ? "bg-accent text-accent-foreground" : "transparent",
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      <div className="fixed top-4 left-4 z-40 md:hidden">
        <Button variant="outline" size="icon" onClick={toggle}>
          <Menu className="h-4 w-4" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </div>
    </>
  )
}
