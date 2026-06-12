"use client";

import { useMutation, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import FavoriteButton from "@/components/FavoriteButton"; 
import EditBookmarkDialog from "@/components/EditBookmarkDialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, Copy, Check, Globe } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useInView } from "react-intersection-observer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function BookmarkList() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const tag = searchParams.get("tag") || "";
  const collectionId = searchParams.get("collectionId") || "";
  const isFavorite = searchParams.get("isFavorite") || "";
  const queryClient = useQueryClient();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { 
    data, 
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ["bookmarks", { search, tag, collectionId, isFavorite }],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetch(`/api/bookmarks?search=${search}&tag=${tag}&collectionId=${collectionId}&isFavorite=${isFavorite}&page=${pageParam}&limit=12`);
      if (!res.ok) {
        throw new Error("Failed to fetch bookmarks");
      }
      return res.json();
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  // Flatten pages to a single array of bookmarks
  const bookmarks = data?.pages.flatMap((page) => page.bookmarks) || [];

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/bookmarks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks", { search, tag, collectionId, isFavorite }] });
      toast.success("Bookmark deleted");
    },
    onError: () => {
      toast.error("Failed to delete bookmark");
    }
  });

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Link copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) return (
    <div className="flex justify-center mt-12 text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
  
  if (!bookmarks?.length) return (
    <div className="flex items-center justify-center h-64 border-2 border-dashed border-border rounded-xl bg-card">
      <div className="text-center">
        <p className="text-muted-foreground text-lg">No bookmarks found.</p>
        {search || tag ? <p className="text-muted-foreground text-sm mt-2">Try adjusting your filters.</p> : null}
      </div>
    </div>
  );

  return (
    <>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mt-8">
      {bookmarks.map((bookmark: any) => (
        <Card key={bookmark._id} className="overflow-hidden flex flex-col hover:shadow-lg transition-shadow border-border bg-card">
          <div className="h-48 w-full overflow-hidden bg-muted relative group">
            {bookmark.ogImage ? (
              <img 
                src={bookmark.ogImage} 
                alt={bookmark.title || "Bookmark image"} 
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/20 ${bookmark.ogImage ? 'hidden' : ''}`}>
              <Globe className="h-12 w-12 text-primary/40" />
            </div>
            <div className="absolute top-3 right-3 z-10 bg-background/80 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 transition-transform">
              <FavoriteButton 
                bookmarkId={bookmark._id}
                isFavorite={bookmark.isFavorite}
                search={search}
                tag={tag}
              />
            </div>
          </div>
          <CardHeader className="pt-5 pb-3 px-5">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg line-clamp-2 font-semibold text-foreground leading-tight">
                  <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline">
                    {bookmark.title || "Untitled Bookmark"}
                  </a>
                </CardTitle>
                <CardDescription className="truncate mt-1.5 text-xs">
                  <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                    {bookmark.url}
                  </a>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 px-5 pb-4">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {bookmark.description || "No description available."}
            </p>
            {bookmark.tags && bookmark.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {bookmark.tags.map((t: string) => (
                  <Badge key={t} variant="secondary" className="text-[10px] font-normal px-2 py-0 h-5">
                    {t}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="px-5 py-3 flex justify-between items-center border-t border-border bg-muted/50">
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => handleCopy(bookmark.url, bookmark._id)} className="text-muted-foreground hover:text-foreground h-8 px-2">
                {copiedId === bookmark._id ? <Check className="h-4 w-4 mr-1 text-green-500" /> : <Copy className="h-4 w-4 mr-1" />}
                <span className="text-xs hidden sm:inline-block">Copy</span>
              </Button>
              <EditBookmarkDialog 
                bookmark={bookmark} 
                search={search} 
                tag={tag} 
                collectionId={collectionId} 
                isFavorite={isFavorite} 
              />
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive h-8 px-2" disabled={deleteMutation.isPending}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Bookmark</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this bookmark? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteMutation.mutate(bookmark._id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      ))}
    </div>
    
    {/* Infinite scroll sentinel */}
    <div ref={ref} className="w-full flex justify-center py-8">
      {isFetchingNextPage && <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />}
    </div>
    </>
  );
}