"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth/auth.client";
export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const restul = await signIn.email({
        email,
        password
      });

      if (restul.error) {
        setError(restul.error.message ?? "Failed to sign in");
      } else {
        router.push("/dashboard")
      }
    } catch (err) {
      setError("An unexpected error ocurred");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-white dark:bg-zinc-950 p-4 transition-colors">
      <Card className="w-full max-w-md border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-black dark:text-white">
            Sign In
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-zinc-400">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/15 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-zinc-300" htmlFor="email">
                Email
              </Label>
              <Input
                className="border-gray-300 dark:border-zinc-700 focus:border-primary focus:ring-primary focus:ring-1"
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-zinc-300" htmlFor="password">
                Password
              </Label>
              <Input
                className="border-gray-300 dark:border-zinc-700 focus:border-primary focus:ring-primary focus:ring-1"
                id="password"
                type="password"
                placeholder=""
                minLength={8}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
              type="submit"
            >
              Sign In
            </Button>
            <p className="text-center text-sm text-gray-600 dark:text-zinc-400">
              Do not have an account?{" "}
              <Link
                className="font-medium text-primary hover:underline"
                href="/sign-up"
              >
                Sign Up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
