"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Edit2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EditBookmarkDialog({ bookmark, search, tag, collectionId: currentCollectionId, isFavorite }: any) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(bookmark.title || "");
  const [description, setDescription] = useState(bookmark.description || "");
  const [tags, setTags] = useState(bookmark.tags?.join(", ") || "");
  const [collectionId, setCollectionId] = useState(bookmark.collectionId || "none");
  const queryClient = useQueryClient();

  const { data: collections } = useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const res = await fetch("/api/collections");
      if (!res.ok) return [];
      return res.json();
    }
  });

  const mutation = useMutation({
    mutationFn: async (updatedData: any) => {
      const res = await fetch(`/api/bookmarks/${bookmark._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) throw new Error("Failed to update bookmark");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks", { search, tag, collectionId: currentCollectionId, isFavorite }] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      toast.success("Bookmark updated");
      setOpen(false);
    },
    onError: () => {
      toast.error("Failed to update bookmark");
    }
  });

  const handleSave = () => {
    const parsedTags = tags.split(',').map((t: string) => t.trim()).filter(Boolean);
    mutation.mutate({
      title,
      description,
      tags: parsedTags,
      collectionId: collectionId
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground h-8 px-2">
          <Edit2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Bookmark</DialogTitle>
          <DialogDescription>
            Make changes to your bookmark here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tags (comma separated)</label>
            <Input value={tags} onChange={(e) => setTags(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Collection</label>
            <Select value={collectionId} onValueChange={setCollectionId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Collection" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Collection</SelectItem>
                {collections?.map((c: any) => (
                  <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
