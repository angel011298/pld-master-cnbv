import { supabase } from "@/lib/supabase"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { content, type = "text" } = body

    if (!content || typeof content !== "string") {
      return Response.json(
        { error: "Content is required and must be a string" },
        { status: 400 }
      )
    }

    if (content.trim().length === 0) {
      return Response.json(
        { error: "Suggestion cannot be empty" },
        { status: 400 }
      )
    }

    if (content.length > 5000) {
      return Response.json(
        { error: "Suggestion must be 5000 characters or less" },
        { status: 400 }
      )
    }

    const sb = supabase()
    const { data: user } = await sb.auth.getUser()

    if (!user?.user?.id) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { error, data } = await sb
      .from("suggestions")
      .insert([
        {
          user_id: user.user.id,
          content: content.trim(),
          type: ["text", "voice"].includes(type) ? type : "text",
        },
      ])
      .select("id")
      .single()

    if (error) {
      console.error("Error inserting suggestion:", error)
      return Response.json(
        { error: "Failed to save suggestion" },
        { status: 500 }
      )
    }

    return Response.json({
      success: true,
      message: "¡Gracias por tu sugerencia!",
      id: data?.id,
    })
  } catch (error) {
    console.error("API error:", error)
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
