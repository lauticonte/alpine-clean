import { Badge } from "@/components/ui/badge"
import { CreditCard, Calendar } from "lucide-react"

const alertas = [
  {
    id: 1,
    tipo: "pago",
    cliente: "Constructora ABC",
    mensaje: "Pago vencido por $45,000",
    fecha: "Hace 3 días",
    icono: CreditCard,
  },
  {
    id: 2,
    tipo: "contrato",
    cliente: "Eventos XYZ",
    mensaje: "Contrato vence en 5 días",
    fecha: "15/05/2023",
    icono: Calendar,
  },
  {
    id: 3,
    tipo: "pago",
    cliente: "Municipalidad de San Martín",
    mensaje: "Pago pendiente por $28,500",
    fecha: "Vence mañana",
    icono: CreditCard,
  },
]

export function AlertasVencimiento() {
  return (
    <div className="space-y-4">
      {alertas.map((alerta) => (
        <div key={alerta.id} className="flex items-start gap-3 border-b pb-3 last:border-0">
          <div className="mt-0.5 rounded-full bg-primary/10 p-1.5 text-primary">
            <alerta.icono className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">{alerta.cliente}</p>
              <Badge variant={alerta.tipo === "pago" ? "destructive" : "outline"} className="text-[10px]">
                {alerta.tipo === "pago" ? "Pago" : "Contrato"}
              </Badge>
            </div>
            <p className="text-xs">{alerta.mensaje}</p>
            <p className="text-xs text-muted-foreground">{alerta.fecha}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
