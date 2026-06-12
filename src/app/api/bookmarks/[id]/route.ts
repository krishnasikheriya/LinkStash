import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { Bookmark } from "@/models/Bookmark";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // In Next.js 15 App Router, dynamic params are asynchronous
    const { id } = await params;

    // Parse the payload
    const { isFavorite } = await req.json();

    // 1. Await database connection
    await connectDB();

    // 2. Find the bookmark by `id` AND `session.user.id` (to ensure they own it) and update `isFavorite`
    const updatedBookmark = await Bookmark.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { isFavorite },
      { new: true } // Returns the modified document rather than the original
    );

    if (!updatedBookmark) {
      return NextResponse.json({ error: "Bookmark not found or unauthorized" }, { status: 404 });
    }

    // 3. Return a success JSON response
    return NextResponse.json(updatedBookmark, { status: 200 });

  } catch (error) {
    console.error("Failed to update bookmark:", error);
    return NextResponse.json({ error: "Failed to update bookmark" }, { status: 500 });
  }
}