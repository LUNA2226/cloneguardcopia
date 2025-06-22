import { createClient } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

// Load Supabase configuration from environment variables
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json()

    // Validate required fields
    const { dominioOriginal, dominioClonado, url, timestamp } = body

    if (!dominioOriginal || typeof dominioOriginal !== "string") {
      return NextResponse.json({ error: "dominioOriginal is required and must be a string" }, { status: 400 })
    }

    if (!dominioClonado || typeof dominioClonado !== "string") {
      return NextResponse.json({ error: "dominioClonado is required and must be a string" }, { status: 400 })
    }

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "url is required and must be a string" }, { status: 400 })
    }

    if (!timestamp || typeof timestamp !== "string") {
      return NextResponse.json({ error: "timestamp is required and must be a string" }, { status: 400 })
    }

    // Validate timestamp format (ISO 8601)
    const parsedTimestamp = new Date(timestamp)
    if (isNaN(parsedTimestamp.getTime())) {
      return NextResponse.json({ error: "timestamp must be a valid ISO 8601 date string" }, { status: 400 })
    }

    // Insert the clone visit data into Supabase
    const { data, error } = await supabase
      .from("clone_visits")
      .insert({
        dominio_original: dominioOriginal,
        dominio_clonado: dominioClonado,
        url: url,
        timestamp: parsedTimestamp.toISOString(),
      })
      .select()

    if (error) {
      console.error("Supabase insert error:", error)
      return NextResponse.json({ error: "Failed to insert clone visit data" }, { status: 500 })
    }

    // Return success response
    return NextResponse.json({ status: "ok" }, { status: 200 })
  } catch (error) {
    console.error("Error in track-clone API:", error)

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    // Handle other errors
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Handle non-POST requests
export async function GET() {
  return NextResponse.json({ error: "Method not allowed. Use POST." }, { status: 405 })
}

export async function PUT() {
  return NextResponse.json({ error: "Method not allowed. Use POST." }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ error: "Method not allowed. Use POST." }, { status: 405 })
}
