import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { Bookmark } from "@/models/Bookmark";
import { connectDB } from "@/lib/mongodb";

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    await connectDB();
    await Bookmark.deleteMany({ userId: session.user.id });

    return NextResponse.json({ message: "All bookmarks deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
