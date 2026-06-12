import { Suspense } from "react";
import AddBookmark from "@/components/AddBookmark"; // Adjust path if needed
import SearchBar from "@/components/SearchBar"; // Adjust path if needed
import BookmarkList from "@/components/BookmarkList"; // Adjust path if needed

export default function Home() {
  return (
    <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookmarks</h1>
      
      {/* Inject the AddBookmark form */}
      <AddBookmark />

      {/* Dashboard content */}
      <Suspense fallback={<div className="text-gray-500 py-4">Loading dashboard features...</div>}>
        <SearchBar />
        <BookmarkList />
      </Suspense>
    </main>
  );
}