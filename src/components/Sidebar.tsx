"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Folder, Star, Bookmark, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import ImportExport from "@/components/ImportExport";
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

export default function Sidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [newCollectionName, setNewCollectionName] = useState("");

  const currentCollectionId = searchParams.get("collectionId");
  const isFavorite = searchParams.get("isFavorite") === "true";

  const { data: collections, isLoading } = useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const res = await fetch("/api/collections");
      if (!res.ok) throw new Error("Failed to fetch collections");
      return res.json();
    }
  });

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to create collection");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      setNewCollectionName("");
      toast.success("Collection created");
    },
    onError: () => toast.error("Failed to create collection")
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/collections/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete collection");
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      if (currentCollectionId === id) {
        setFilter(null);
      }
      toast.success("Collection deleted");
    },
    onError: () => toast.error("Failed to delete collection")
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCollectionName.trim()) {
      createMutation.mutate(newCollectionName);
    }
  };

  const setFilter = (type: 'all' | 'favorites' | string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("collectionId");
    params.delete("isFavorite");

    if (type === 'favorites') {
      params.set("isFavorite", "true");
    } else if (type && type !== 'all') {
      params.set("collectionId", type);
    }

    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="w-full md:w-64 flex-shrink-0 space-y-6">
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-muted-foreground mb-2 px-2">Library</h3>
        <Button 
          variant={!currentCollectionId && !isFavorite ? "secondary" : "ghost"} 
          className="w-full justify-start h-9"
          onClick={() => setFilter('all')}
        >
          <Bookmark className="mr-2 h-4 w-4" />
          All Bookmarks
        </Button>
        <Button 
          variant={isFavorite ? "secondary" : "ghost"} 
          className="w-full justify-start h-9"
          onClick={() => setFilter('favorites')}
        >
          <Star className="mr-2 h-4 w-4" />
          Favorites
        </Button>
      </div>

      <div className="space-y-1">
        <h3 className="text-sm font-medium text-muted-foreground mb-2 px-2">Collections</h3>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          collections?.map((c: any) => (
            <div key={c._id} className="group flex items-center justify-between">
              <Button 
                variant={currentCollectionId === c._id ? "secondary" : "ghost"} 
                className="w-full justify-start h-9 pr-10 truncate"
                onClick={() => setFilter(c._id)}
              >
                <Folder className="mr-2 h-4 w-4 shrink-0" />
                <span className="truncate">{c.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">{c.count}</span>
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 absolute right-4 transition-opacity">
                    <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Collection</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{c.name}"? The bookmarks inside won't be deleted, but they will be removed from this collection.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteMutation.mutate(c._id)} className="bg-destructive hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))
        )}

        <form onSubmit={handleCreate} className="px-2 mt-2 pt-2">
          <div className="relative">
            <Input 
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="New Collection..." 
              className="h-8 text-sm pr-8"
            />
            <Button 
              type="submit" 
              variant="ghost" 
              size="icon" 
              className="absolute right-0 top-0 h-8 w-8"
              disabled={!newCollectionName.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
            </Button>
          </div>
        </form>
      </div>

      <div className="space-y-1 pt-6 border-t border-border">
        <h3 className="text-sm font-medium text-muted-foreground mb-2 px-2">Data</h3>
        <ImportExport />
      </div>
    </div>
  );
}
