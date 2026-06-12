"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

interface FavoriteButtonProps {
  bookmarkId: string;
  isFavorite: boolean;
  search: string;
  tag: string;
}

export default function FavoriteButton({ bookmarkId, isFavorite, search, tag }: FavoriteButtonProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newIsFavorite: boolean) => {
      // 1. Call PATCH `/api/bookmarks/${bookmarkId}` with body: { isFavorite: newIsFavorite }
      const res = await fetch(`/api/bookmarks/${bookmarkId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: newIsFavorite }),
      });
      
      if (!res.ok) {
        throw new Error("Failed to update favorite status");
      }
      return res.json();
    },
    onMutate: async (newIsFavorite) => {
      // 1. Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["bookmarks", { search, tag }] });

      // 2. Snapshot the previous value
      const previousBookmarks = queryClient.getQueryData(["bookmarks", { search, tag }]);

      // 3. Optimistically update the cache
      queryClient.setQueryData(["bookmarks", { search, tag }], (old: any) =>
        old?.map((b: any) => b._id === bookmarkId ? { ...b, isFavorite: newIsFavorite } : b)
      );

      // 4. Return the snapshot context
      return { previousBookmarks };
    },
    onError: (err, newIsFavorite, context) => {
      // 5. If the mutation fails, roll back to the snapshot!
      if (context?.previousBookmarks) {
        queryClient.setQueryData(["bookmarks", { search, tag }], context.previousBookmarks);
      }
    },
    onSettled: () => {
      // 6. Always refetch after error or success to ensure server sync
      queryClient.invalidateQueries({ queryKey: ["bookmarks", { search, tag }] });
    }
  });

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => mutation.mutate(!isFavorite)}
      className={isFavorite ? "text-yellow-500 hover:text-yellow-600" : "text-gray-400 hover:text-gray-500"}
    >
      {isFavorite ? "★ Favorited" : "☆ Favorite"}
    </Button>
  );
}