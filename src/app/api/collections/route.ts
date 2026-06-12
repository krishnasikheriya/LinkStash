import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { Collection } from "@/models/Collection";
import { Bookmark } from "@/models/Bookmark";
import mongoose from "mongoose";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const collections = await Collection.find({ userId: session.user.id }).sort({ name: 1 });
    
    // Also get the count of bookmarks in each collection
    const collectionIds = collections.map(c => c._id);
    
    // Aggregate bookmark counts
    const bookmarkCounts = await Bookmark.aggregate([
      { $match: { 
          collectionId: { $in: collectionIds }, 
          userId: new mongoose.Types.ObjectId(session.user.id) 
        } 
      },
      { $group: { _id: "$collectionId", count: { $sum: 1 } } }
    ]);
    
    const countMap = bookmarkCounts.reduce((acc, curr) => {
      acc[curr._id.toString()] = curr.count;
      return acc;
    }, {});
    
    const collectionsWithCounts = collections.map(c => ({
      _id: c._id,
      name: c.name,
      count: countMap[c._id.toString()] || 0
    }));

    return NextResponse.json(collectionsWithCounts);
  } catch (error) {
    console.error("Collections GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name } = await request.json();
    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    await connectDB();
    const collection = await Collection.create({
      userId: session.user.id,
      name: name.trim()
    });

    return NextResponse.json(collection);
  } catch (error) {
    console.error("Collections POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
