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
import { signIn } from "@/lib/auth/auth.client";
export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        window.location.replace("/dashboard");
      }
    } catch {
      setError("An unexpected error ocurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setError("");
    setLoading(true);

    try {
      const result = await signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });

      if (result.error) {
        setError(result.error.message ?? "Failed to sign in with Google");
        setLoading(false);
      }
    } catch {
      setError("An unexpected error occurred while signing in with Google");
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
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-zinc-400">
              <span className="h-px flex-1 bg-gray-200 dark:bg-zinc-700" />
              or
              <span className="h-px flex-1 bg-gray-200 dark:bg-zinc-700" />
            </div>
            <Button
              className="w-full cursor-pointer"
              type="button"
              variant="outline"
              disabled={loading}
              onClick={handleGoogleSignIn}
            >
              <svg
                aria-hidden="true"
                className="mr-2 size-4"
                viewBox="0 0 48 48"
              >
                <path
                  fill="#4285F4"
                  d="M48 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h13.48c-.58 2.96-2.26 5.48-4.76 7.18v5.99h7.73c4.52-4.17 7.13-10.31 7.13-17.64Z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.9-5.77l-7.73-5.99c-2.15 1.45-4.9 2.3-8.17 2.3-6.26 0-11.57-4.22-13.47-9.91H2.56v6.19C6.51 42.62 14.62 48 24 48Z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.63a14.4 14.4 0 0 1 0-9.18v-6.19H2.56a24 24 0 0 0 0 21.48l7.97-6.11Z"
                />
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.97 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
                />
              </svg>
              Continue with Google
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
