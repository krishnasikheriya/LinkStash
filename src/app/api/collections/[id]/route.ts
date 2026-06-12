import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { Collection } from "@/models/Collection";
import { Bookmark } from "@/models/Bookmark";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const collection = await Collection.findOne({ _id: id, userId: session.user.id });
    if (!collection) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    await Collection.deleteOne({ _id: id });

    await Bookmark.updateMany(
      { collectionId: id, userId: session.user.id },
      { $unset: { collectionId: 1 } }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Collection DELETE error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
