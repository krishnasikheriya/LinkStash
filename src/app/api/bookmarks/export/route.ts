import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { Bookmark } from "@/models/Bookmark";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const bookmarks = await Bookmark.find({ userId: session.user.id }).sort({ createdAt: -1 });

    // Generate Netscape Bookmark HTML Format
    let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>\n`;

    for (const bookmark of bookmarks) {
      const addDate = Math.floor(new Date(bookmark.createdAt).getTime() / 1000);
      const title = bookmark.title || bookmark.url;
      const tagsAttr = bookmark.tags && bookmark.tags.length > 0 ? ` TAGS="${bookmark.tags.join(',')}"` : '';
      
      html += `    <DT><A HREF="${bookmark.url}" ADD_DATE="${addDate}"${tagsAttr}>${title}</A>\n`;
      
      if (bookmark.description) {
        html += `    <DD>${bookmark.description}\n`;
      }
    }

    html += `</DL><p>\n`;

    // Return as a downloadable file
    const headers = new Headers();
    headers.set('Content-Type', 'text/html');
    headers.set('Content-Disposition', 'attachment; filename="linkstash_bookmarks.html"');

    return new NextResponse(html, {
      status: 200,
      headers
    });
  } catch (error) {
    console.error("Failed to export bookmarks:", error);
    return NextResponse.json({ error: "Failed to export bookmarks" }, { status: 500 });
  }
}
