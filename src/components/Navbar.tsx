import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ModeToggle";
import Link from "next/link";

export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="flex justify-between items-center p-4 bg-background/80 backdrop-blur-md border-b border-border shadow-sm sticky top-0 z-50">
      <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
        <img src="/bookmark.png" alt="LinkStash Logo" className="h-8 w-8 dark:invert" />
        <span className="font-bold text-2xl text-foreground tracking-tight">LinkStash</span>
      </Link>
      <div>
        <div className="flex items-center gap-4">
          <ModeToggle />
          {session?.user && (
            <>
              <span className="text-sm font-medium text-muted-foreground hidden sm:inline-block">
                {session.user.name || session.user.email}
              </span>
            <form action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}>
              <Button variant="outline" size="sm">Sign Out</Button>
              </form>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}