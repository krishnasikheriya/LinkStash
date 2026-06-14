import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GithubLoginButton } from "@/components/GithubLoginButton";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">

      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-30 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-20 dark:opacity-30 animate-blob animation-delay-4000"></div>

      <Card className="w-full max-w-md mx-4 relative z-10 border-border shadow-2xl bg-card/90 backdrop-blur-sm">
        <CardHeader className="space-y-3 text-center pb-8 pt-10">
          <div className="flex justify-center mb-2">
            <img src="/logo.svg" alt="LinkStash Logo" className="h-16 w-16 dark:invert" />
          </div>
          <CardTitle className="text-3xl font-extrabold tracking-tight text-foreground">
            LinkStash
          </CardTitle>
          <CardDescription className="text-muted-foreground text-base font-medium">
            Your intelligent digital workspace.<br/> Save, search, and organize the web.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-10 px-8">
          <form action={async () => {
            "use server";
            await signIn("github", { redirectTo: "/" });
          }}>
            <GithubLoginButton />
          </form>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}