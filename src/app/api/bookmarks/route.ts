import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { Bookmark } from "@/models/Bookmark";
import { scrapeUrl } from "@/lib/scraper";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url, tags, collectionId } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const scrapedData = await scrapeUrl(url);

    await connectDB();

    const newBookmark = await Bookmark.create({
      userId: session.user.id,
      url: url,
      title: scrapedData.title,
      description: scrapedData.description,
      ogImage: scrapedData.ogImage,
      tags: tags || [],
      collectionId: collectionId || undefined
    });

    return NextResponse.json(newBookmark, { status: 201 });

  } catch (error) {
    console.error("Failed to add bookmark:", error);

    return NextResponse.json({ error: "Failed to add bookmark" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    const search = searchParams.get('search');
    const tag = searchParams.get('tag');
    const collectionId = searchParams.get('collectionId');
    const isFavorite = searchParams.get('isFavorite');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    await connectDB();
    const query: any = { userId: session.user.id };

    if (search) {

      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (tag) {
      query.tags = tag;
    }

    if (collectionId) {
      query.collectionId = collectionId;
    }

    if (isFavorite === 'true') {
      query.isFavorite = true;
    }

    const bookmarks = await Bookmark.find(query)
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Bookmark.countDocuments(query);
    const hasNextPage = (page * limit) < total;

    return NextResponse.json({
      bookmarks,
      nextPage: hasNextPage ? page + 1 : null
    });
  } catch (error) {
    console.error("Failed to fetch bookmarks:", error);
    return NextResponse.json({ error: "Failed to fetch bookmarks" }, { status: 500 });
  }
}