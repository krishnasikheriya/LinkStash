"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, Loader2 } from "lucide-react";
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

export default function DeleteAllBookmarks() {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/bookmarks/delete-all", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete bookmarks");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      toast.success("All bookmarks deleted permanently");
      setOpen(false);
      setConfirmation("");
    },
    onError: () => {
      toast.error("Failed to delete bookmarks");
    }
  });

  const handleDelete = () => {
    if (confirmation === "DELETE ALL") {
      deleteMutation.mutate();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) setConfirmation("");
    }}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start h-9 text-destructive hover:text-destructive hover:bg-destructive/10 mt-1">
          <AlertTriangle className="mr-2 h-4 w-4" />
          Delete All Bookmarks
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Delete All Bookmarks
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete <b>all</b> your bookmarks from your account. Collections will remain, but will be empty.
            <br/><br/>
            Please type <b>DELETE ALL</b> to confirm.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="py-4">
          <Input 
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder="DELETE ALL"
            className="border-destructive/50 focus-visible:ring-destructive"
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
          <Button 
            variant="destructive"
            disabled={confirmation !== "DELETE ALL" || deleteMutation.isPending}
            onClick={handleDelete}
          >
            {deleteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Delete Everything
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
