"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

import { Star } from "lucide-react";
import { toast } from "sonner";

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
      await queryClient.cancelQueries({ queryKey: ["bookmarks", { search, tag }] });
      const previousBookmarks = queryClient.getQueryData(["bookmarks", { search, tag }]);
      queryClient.setQueryData(["bookmarks", { search, tag }], (old: any) =>
        old?.map((b: any) => b._id === bookmarkId ? { ...b, isFavorite: newIsFavorite } : b)
      );
      return { previousBookmarks };
    },
    onSuccess: (data, newIsFavorite) => {
      toast.success(newIsFavorite ? "Added to favorites" : "Removed from favorites");
    },
    onError: (err, newIsFavorite, context) => {
      if (context?.previousBookmarks) {
        queryClient.setQueryData(["bookmarks", { search, tag }], context.previousBookmarks);
      }
      toast.error("Failed to update favorite status");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks", { search, tag }] });
    }
  });

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => mutation.mutate(!isFavorite)}
      className={`h-8 w-8 shrink-0 ${isFavorite ? "text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10" : "text-muted-foreground hover:text-foreground"}`}
      title={isFavorite ? "Unfavorite" : "Favorite"}
    >
      <Star className="h-5 w-5" fill={isFavorite ? "currentColor" : "none"} />
    </Button>
  );
}