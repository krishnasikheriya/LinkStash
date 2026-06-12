import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { Bookmark } from "@/models/Bookmark";
import { scrapeUrl } from "@/lib/scraper";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. Authenticate the user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse the request body
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // TODO: Phase 3 Implementation
    // 3. Call your `scrapeUrl` function from `@/lib/scraper`
    // 4. Connect to MongoDB
    // 5. Create and save a new Bookmark document using the scraped data, the original url, and session.user.id
    // 6. Return the newly created bookmark as JSON

    return NextResponse.json({ message: "Not implemented yet" }, { status: 501 });

  } catch (error) {
    console.error("Failed to add bookmark:", error);
    // TODO: Handle error states gracefully (e.g., what if the fetch fails completely?)
    return NextResponse.json({ error: "Failed to add bookmark" }, { status: 500 });
  }
}
