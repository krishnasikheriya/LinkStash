"use client";

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import FavoriteButton from "@/components/FavoriteButton"; // Adjust path if needed

export default function BookmarkList() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const tag = searchParams.get("tag") || "";

  const { data: bookmarks, isLoading } = useQuery({
    queryKey: ["bookmarks", { search, tag }],
    queryFn: async () => {
      const res = await fetch(`/api/bookmarks?search=${search}&tag=${tag}`);
      if (!res.ok) {
        throw new Error("Failed to fetch bookmarks");
      }
      return res.json();
    }
  });

  if (isLoading) return <div className="text-gray-500 mt-8">Loading bookmarks...</div>;
  if (!bookmarks?.length) return <div className="text-gray-500 mt-8">No bookmarks found.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      {bookmarks.map((bookmark: any) => (
        <Card key={bookmark._id} className="overflow-hidden flex flex-col hover:shadow-md transition-shadow">
          {bookmark.ogImage && (
            <div className="h-48 w-full overflow-hidden bg-gray-100">
              <img 
                src={bookmark.ogImage} 
                alt={bookmark.title || "Bookmark image"} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <CardHeader className={bookmark.ogImage ? "pt-4" : ""}>
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg line-clamp-1">
                  <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 hover:underline">
                    {bookmark.title || "Untitled Bookmark"}
                  </a>
                </CardTitle>
                <CardDescription className="truncate mt-1">
                  <a href={bookmark.url} target="_blank" rel="noopener noreferrer">
                    {bookmark.url}
                  </a>
                </CardDescription>
              </div>
              
              {/* Inject the FavoriteButton and pass all required state */}
              <FavoriteButton 
                bookmarkId={bookmark._id}
                isFavorite={bookmark.isFavorite}
                search={search}
                tag={tag}
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <p className="text-sm text-gray-600 line-clamp-3">
              {bookmark.description || "No description available."}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}