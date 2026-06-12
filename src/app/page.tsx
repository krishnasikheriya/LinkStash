import { Suspense } from "react";
import AddBookmark from "@/components/AddBookmark"; // Adjust path if needed
import SearchBar from "@/components/SearchBar"; // Adjust path if needed
import BookmarkList from "@/components/BookmarkList"; // Adjust path if needed
import Sidebar from "@/components/Sidebar";
import { Loader2 } from "lucide-react";

export default function Home() {
  return (
    <main className="w-full">
      <div className="flex flex-col md:flex-row gap-8">
        <Suspense fallback={<div className="w-64 animate-pulse bg-muted rounded-xl"></div>}>
          <Sidebar />
        </Suspense>
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-foreground mb-8">My Bookmarks</h1>
          
          {/* Inject the AddBookmark form */}
          <Suspense fallback={<div className="mb-8 p-6 bg-card rounded-xl shadow-sm border border-border h-24 animate-pulse"></div>}>
            <AddBookmark />
          </Suspense>

          {/* Dashboard content */}
          <Suspense fallback={
            <div className="flex justify-center mt-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          }>
            <SearchBar />
            <BookmarkList />
          </Suspense>
        </div>
      </div>
    </main>
  );
}