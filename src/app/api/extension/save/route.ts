import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Bookmark } from "@/models/Bookmark";
import { scrapeUrl } from "@/lib/scraper";
import { NextResponse } from "next/server";

export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid Authorization header" }, { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    const apiKey = authHeader.split("Bearer ")[1];
    if (!apiKey) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    await connectDB();
    const user = await User.findOne({ apiKey });
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Invalid API Key." }, { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    const { url, tags } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    // Scrape title/desc from URL
    const scrapedData = await scrapeUrl(url);

    const newBookmark = await Bookmark.create({
      userId: user._id,
      url: url,
      title: scrapedData.title,
      description: scrapedData.description,
      ogImage: scrapedData.ogImage,
      tags: tags || []
    });

    return NextResponse.json({ success: true, bookmark: newBookmark }, { status: 201, headers: { 'Access-Control-Allow-Origin': '*' } });
  } catch (error) {
    console.error("Extension save error:", error);
    return NextResponse.json({ error: "Failed to save bookmark" }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}
