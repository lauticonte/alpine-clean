import { Badge } from "@/components/ui/badge"

const contratos = [
  {
    id: 1,
    cliente: "Constructora ABC",
    cantidad: 12,
    fechaInicio: "01/05/2023",
    fechaFin: "30/06/2023",
    estado: "En curso",
  },
  {
    id: 2,
    cliente: "Eventos XYZ",
    cantidad: 8,
    fechaInicio: "15/04/2023",
    fechaFin: "15/05/2023",
    estado: "Por vencer",
  },
  {
    id: 3,
    cliente: "Municipalidad de San Martín",
    cantidad: 5,
    fechaInicio: "10/05/2023",
    fechaFin: "10/08/2023",
    estado: "En curso",
  },
]

export function ContratosActivos() {
  return (
    <div className="space-y-4">
      {contratos.map((contrato) => (
        <div key={contrato.id} className="flex flex-col space-y-2 border-b pb-2 last:border-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{contrato.cliente}</p>
            <Badge variant={contrato.estado === "Por vencer" ? "destructive" : "default"}>{contrato.estado}</Badge>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{contrato.cantidad} baños</span>
            <span>
              {contrato.fechaInicio} - {contrato.fechaFin}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
