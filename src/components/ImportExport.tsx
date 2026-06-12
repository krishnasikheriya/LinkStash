"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function ImportExport() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const queryClient = useQueryClient();

  const handleExport = () => {
    window.location.href = "/api/bookmarks/export";
  };

  const processImportFile = async (file: File) => {
    try {
      setIsImporting(true);
      const text = await file.text();
      
      // Super simple regex to extract URLs from Netscape Bookmark format
      const regex = /HREF="([^"]+)"/ig;
      const urls: string[] = [];
      let match;
      
      while ((match = regex.exec(text)) !== null) {
        // Basic validation
        if (match[1] && match[1].startsWith('http')) {
          urls.push(match[1]);
        }
      }

      if (urls.length === 0) {
        toast.error("No valid links found in this file.");
        setIsImporting(false);
        return;
      }

      // De-duplicate URLs
      const uniqueUrls = Array.from(new Set(urls));
      
      toast.info(`Importing ${uniqueUrls.length} bookmarks... Please wait.`);

      let successCount = 0;
      let failCount = 0;

      // Import sequentially so we don't crash the server/trigger rate limits
      for (let i = 0; i < uniqueUrls.length; i++) {
        const url = uniqueUrls[i];
        try {
          const res = await fetch("/api/bookmarks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url })
          });
          
          if (res.ok) successCount++;
          else failCount++;
        } catch (e) {
          failCount++;
        }
      }

      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      
      if (failCount === 0) {
        toast.success(`Successfully imported all ${successCount} bookmarks!`);
      } else {
        toast.warning(`Import complete. ${successCount} successful, ${failCount} failed.`);
      }
      
    } catch (error) {
      console.error("Import failed:", error);
      toast.error("Failed to parse bookmark file.");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input 
        type="file" 
        accept=".html" 
        className="hidden" 
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            processImportFile(e.target.files[0]);
          }
        }}
      />
      <Button 
        variant="ghost" 
        className="w-full justify-start h-9 text-muted-foreground" 
        onClick={handleImportClick}
        disabled={isImporting}
      >
        {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
        {isImporting ? "Importing..." : "Import HTML"}
      </Button>
      <Button 
        variant="ghost" 
        className="w-full justify-start h-9 text-muted-foreground" 
        onClick={handleExport}
        disabled={isImporting}
      >
        <Download className="mr-2 h-4 w-4" />
        Export HTML
      </Button>
    </>
  );
}
