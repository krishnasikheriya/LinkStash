"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AddBookmark() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentCollectionId = searchParams.get("collectionId");

  const [url, setUrl] = useState("");
  const [tags, setTags] = useState("");
  const [collectionId, setCollectionId] = useState(currentCollectionId || "none");
  const queryClient = useQueryClient();

  const handleCollectionChange = (val: string) => {
    setCollectionId(val);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("isFavorite"); 
    if (val === "none") {
      params.delete("collectionId");
    } else {
      params.set("collectionId", val);
    }
    router.push(`/?${params.toString()}`);
  };

  const { data: collections } = useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const res = await fetch("/api/collections");
      if (!res.ok) return [];
      return res.json();
    }
  });

  const mutation = useMutation({
    mutationFn: async ({ newUrl, newTags, newCollectionId }: { newUrl: string; newTags: string; newCollectionId: string }) => {
      const parsedTags = newTags.split(',').map(t => t.trim()).filter(Boolean);
      const payload: any = { url: newUrl, tags: parsedTags };
      if (newCollectionId && newCollectionId !== "none") {
        payload.collectionId = newCollectionId;
      }

      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to add bookmark");
      }

      return response.json();
    },
    onSuccess: () => {
      setUrl("");
      setTags("");
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      toast.success("Bookmark added successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    mutation.mutate({ newUrl: url, newTags: tags, newCollectionId: collectionId });
  };

  return (
    <div className="mb-8 p-6 bg-card rounded-xl shadow-sm border border-border">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <Input
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          className="flex-grow"
          disabled={mutation.isPending}
        />
        <Input
          type="text"
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="md:w-1/4"
          disabled={mutation.isPending}
        />
        <Select value={collectionId} onValueChange={handleCollectionChange} disabled={mutation.isPending}>
          <SelectTrigger className="md:w-1/4">
            <SelectValue placeholder="Select Collection" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Collection</SelectItem>
            {collections?.map((c: any) => (
              <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" disabled={mutation.isPending} className="self-end px-6 sm:w-auto w-full">
          {mutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</> : "Add Bookmark"}
        </Button>
      </form>
    </div>
  );
}