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

    const { id } = await params;

    const body = await req.json();

    await connectDB();

    const updateQuery: any = { $set: {} };
    if (body.isFavorite !== undefined) updateQuery.$set.isFavorite = body.isFavorite;
    if (body.title !== undefined) updateQuery.$set.title = body.title;
    if (body.description !== undefined) updateQuery.$set.description = body.description;
    if (body.tags !== undefined) updateQuery.$set.tags = body.tags;

    if (body.collectionId !== undefined) {
      if (body.collectionId === null || body.collectionId === "none") {
        updateQuery.$unset = { collectionId: "" };
      } else {
        updateQuery.$set.collectionId = body.collectionId;
      }
    }

    // 2. Find the bookmark by `id` AND `session.user.id` (to ensure they own it) and update
    const updatedBookmark = await Bookmark.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      updateQuery,
      { new: true } // Returns the modified document rather than the original
    );

    if (!updatedBookmark) {
      return NextResponse.json({ error: "Bookmark not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json(updatedBookmark, { status: 200 });

  } catch (error) {
    console.error("Failed to update bookmark:", error);
    return NextResponse.json({ error: "Failed to update bookmark" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const deletedBookmark = await Bookmark.findOneAndDelete({ _id: id, userId: session.user.id });

    if (!deletedBookmark) {
      return NextResponse.json({ error: "Bookmark not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ message: "Bookmark deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete bookmark:", error);
    return NextResponse.json({ error: "Failed to delete bookmark" }, { status: 500 });
  }
}