"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Copy, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SettingsDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings");
      if (!res.ok) throw new Error("Failed to load settings");
      return res.json();
    },
    enabled: open
  });

  const handleCopy = () => {
    if (data?.apiKey) {
      navigator.clipboard.writeText(data.apiKey);
      setCopied(true);
      toast.success("API Key copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Account Settings</DialogTitle>
          <DialogDescription>
            Manage your personal settings and API keys.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Browser Extension API Key</h4>
            <p className="text-sm text-muted-foreground">
              Use this secret key to authenticate the LinkStash Chrome Extension. Keep it safe and do not share it.
            </p>
            <div className="flex items-center space-x-2 mt-2">
              <Input
                value={data?.apiKey || ""}
                readOnly
                type="password"
                className="font-mono text-xs"
                placeholder={isLoading ? "Generating key..." : "Loading..."}
              />
              <Button size="icon" variant="outline" onClick={handleCopy} disabled={isLoading || !data?.apiKey}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
