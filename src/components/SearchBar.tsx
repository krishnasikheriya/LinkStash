"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useTransition, useState, useEffect } from "react";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Local state for the input, so we don't lag on every keystroke
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");

  // Sync local state when URL changes externally
  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Get current params
    const params = new URLSearchParams(searchParams.toString());
    
    // 2. Update or delete the search key
    if (searchTerm) {
      params.set("search", searchTerm);
    } else {
      params.delete("search");
    }
    
    // 3. Update the URL
    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  };

  return (
    <form onSubmit={handleSearch} className="mb-6 flex gap-2 items-center">
      <Input
        type="text"
        placeholder="Search titles or descriptions... (Press Enter)"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full max-w-md"
      />
      {/* Optional submit button, or just rely on Enter key */}
      <button type="submit" className="hidden">Search</button>
      {isPending && <span className="text-sm text-gray-500 animate-pulse">Updating...</span>}
    </form>
  );
}