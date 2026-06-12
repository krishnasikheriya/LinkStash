"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useTransition, useState, useEffect } from "react";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  // Debounced auto-search
  useEffect(() => {
    // Skip if searchTerm matches the URL exactly (to prevent loop on load)
    const currentUrlSearch = searchParams.get("search") || "";
    if (searchTerm === currentUrlSearch) return;

    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchTerm) {
        params.set("search", searchTerm);
      } else {
        params.delete("search");
      }
      
      startTransition(() => {
        router.push(`/?${params.toString()}`);
      });
    }, 300); // 300ms debounce delay

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchParams, router]);

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

  const handleClear = () => {
    setSearchTerm("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    startTransition(() => {
      router.push(`/?${params.toString()}`);
    });
  };

  return (
    <form onSubmit={handleSearch} className="mb-6 flex gap-2 items-center">
      <div className="flex gap-1 mr-2 shrink-0">
        <Button variant="outline" size="icon" type="button" onClick={() => router.back()} className="h-9 w-9" title="Go Back">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" type="button" onClick={() => router.forward()} className="h-9 w-9" title="Go Forward">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="relative w-full max-w-md flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search titles or descriptions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-10 h-9"
        />
        {searchTerm && (
          <button 
            type="button" 
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            title="Clear Search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {/* Optional submit button, or just rely on Enter key */}
      <button type="submit" className="hidden">Search</button>
      {isPending && <span className="text-sm text-muted-foreground animate-pulse">Updating...</span>}
    </form>
  );
}