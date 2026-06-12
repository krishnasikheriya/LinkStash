"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function AddBookmark() {
  const [url, setUrl] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newUrl: string) => {
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newUrl })
      });

      if (!response.ok) {
        throw new Error("Failed to add bookmark");
      }

      return response.json();
    },
    onSuccess: () => {
      // Clear the input field on success
      setUrl("");
      // Refresh the list automatically
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    // Trigger mutation here
    mutation.mutate(url);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 mb-8 bg-white p-4 rounded-xl shadow-sm border">
      <Input
        type="url"
        placeholder="https://example.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        required
        className="flex-1"
        disabled={mutation.isPending} // Lock input while saving
      />
      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Adding..." : "Add Bookmark"}
      </Button>
    </form>
  );
}