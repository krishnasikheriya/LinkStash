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

    // 3. Call your `scrapeUrl` function
    // Thanks to the try/catch in scraper.ts, this will reliably return data or nulls
    const scrapedData = await scrapeUrl(url);

    // 4. Connect to MongoDB
    await connectDB();

    // 5. Create and save a new Bookmark document
    const newBookmark = await Bookmark.create({
      userId: session.user.id,
      url: url,
      title: scrapedData.title,
      description: scrapedData.description,
      ogImage: scrapedData.ogImage,
    });

    // 6. Return the newly created bookmark as JSON
    return NextResponse.json(newBookmark, { status: 201 });

  } catch (error) {
    console.error("Failed to add bookmark:", error);
    // This catches database connection errors or payload parsing issues
    return NextResponse.json({ error: "Failed to add bookmark" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Get the URL search params
    const { searchParams } = new URL(req.url);
    
    // 2. Extract `search` and `tag` queries
    const search = searchParams.get('search');
    const tag = searchParams.get('tag');

    // 3. Connect to MongoDB and build the Mongoose query object
    await connectDB();
    const query: any = { userId: session.user.id };

    if (search) {
      // Use regex for partial, case-insensitive matches on title or description
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (tag) {
      query.tags = tag;
    }

    // 4. Fetch the data, sort by newest first, and return it
    const bookmarks = await Bookmark.find(query).sort({ createdAt: -1 });

    return NextResponse.json(bookmarks);
  } catch (error) {
    console.error("Failed to fetch bookmarks:", error);
    return NextResponse.json({ error: "Failed to fetch bookmarks" }, { status: 500 });
  }
}