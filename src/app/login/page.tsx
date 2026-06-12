import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="text-center space-y-6 max-w-md p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Welcome to LinkStash</h1>
        <p className="text-gray-600 text-lg">Your intelligent digital bookmark manager.</p>

        <div className="pt-8">
          <form action={async () => {
            "use server";
            await signIn("github", { redirectTo: "/" });
          }}>
            <Button className="w-full">Sign in with GitHub</Button>
          </form>
        </div>
      </div>
    </div>
  );
}