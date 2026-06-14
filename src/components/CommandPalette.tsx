"use client"

import * as React from "react"
import {
  Folder,
  Moon,
  Sun,
  Star,
  Bookmark,
  Search,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  Command,
} from "@/components/ui/command"
import { useQuery } from "@tanstack/react-query"

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")
  const { setTheme } = useTheme()
  const router = useRouter()

  const { data: collections } = useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const res = await fetch("/api/collections");
      if (!res.ok) throw new Error("Failed to fetch collections");
      return res.json();
    }
  })

  const { data: bookmarksData } = useQuery({
    queryKey: ["bookmarks", "cmd-k"],
    queryFn: async () => {
      const res = await fetch("/api/bookmarks?limit=100");
      if (!res.ok) throw new Error("Failed to fetch bookmarks");
      return res.json();
    }
  })

  const bookmarks = bookmarksData?.bookmarks || [];

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    const customOpen = () => setOpen(true);

    document.addEventListener("keydown", down)
    document.addEventListener("open-command-palette", customOpen)
    
    return () => {
      document.removeEventListener("keydown", down)
      document.removeEventListener("open-command-palette", customOpen)
    }
  }, [])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command>
        <CommandInput 
          placeholder="Type a command, search term, or collection..." 
          value={searchValue}
          onValueChange={setSearchValue}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          {searchValue.trim() && (
            <CommandGroup heading="Search">
              <CommandItem 
                value={searchValue} 
                onSelect={() => runCommand(() => router.push(`/?search=${encodeURIComponent(searchValue.trim())}`))}
              >
                <Search className="mr-2 h-4 w-4 text-primary" />
                <span className="font-medium">Search for "{searchValue}"</span>
              </CommandItem>
            </CommandGroup>
          )}

          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => runCommand(() => router.push("/"))}>
              <Bookmark className="mr-2 h-4 w-4" />
              <span>All Bookmarks</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/?isFavorite=true"))}>
              <Star className="mr-2 h-4 w-4" />
              <span>Favorites</span>
            </CommandItem>
          </CommandGroup>
          
          {collections && collections.length > 0 && (
            <CommandGroup heading="Collections">
              {collections.map((c: any) => (
                <CommandItem key={c._id} onSelect={() => runCommand(() => router.push(`/?collectionId=${c._id}`))}>
                  <Folder className="mr-2 h-4 w-4" />
                  <span>{c.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {bookmarks && bookmarks.length > 0 && (
            <CommandGroup heading="Recent Bookmarks">
              {bookmarks.map((b: any) => (
                <CommandItem 
                  key={b._id} 
                  value={b.title + " " + b.description} 
                  onSelect={() => runCommand(() => router.push(`/?search=${encodeURIComponent(b.title || b.url)}`))}
                >
                  <Bookmark className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{b.title || b.url}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandSeparator />
          <CommandGroup heading="Theme">
            <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
              <Sun className="mr-2 h-4 w-4" />
              <span>Light Mode</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
              <Moon className="mr-2 h-4 w-4" />
              <span>Dark Mode</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
              <Moon className="mr-2 h-4 w-4" />
              <span>System Theme</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
