import { createServerSupabaseClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ success: false, error: "ID de alerta no proporcionado" }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    const { error } = await supabase.from("alertas").update({ resuelta: true }).eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al resolver alerta:", error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}
