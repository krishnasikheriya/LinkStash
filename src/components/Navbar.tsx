import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";

export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="flex justify-between items-center p-4 bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="font-bold text-2xl text-blue-600 tracking-tight">LinkStash</div>
      <div>
        {session?.user && (
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">
              {session.user.name || session.user.email}
            </span>
            <form action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}>
              <Button variant="outline" size="sm">Sign Out</Button>
            </form>
          </div>
        )}
      </div>
    </nav>
  );
}