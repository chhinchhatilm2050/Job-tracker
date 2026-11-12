"use client";
import { useState } from "react";
import { auth } from "@/lib/auth/auth";
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
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-white p-4">
      <Card className="w-full max-w-md border-gray-200 shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-black">
            Sign In
          </CardTitle>
          <CardDescription className="text-gray-600">
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
              <Label className="text-gray-700" htmlFor="email">
                Email
              </Label>
              <Input
                className="border-gray-300 focus:border-primary focus:ring-primary focus:ring-1"
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700" htmlFor="password">
                Password
              </Label>
              <Input
                className="border-gray-300 focus:border-primary focus:ring-primary focus:ring-1"
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
              className="w-full bg-primary hover:bg-primary/90 cursor-pointer"
              type="submit"
            >
              Sign In
            </Button>
            <p className="text-center text-sm text-gray-600">
              Do not have an account?{" "}
              <Link
                className="font-medium text-primary hover:underline"
                href="/sign-up"
              >
                {loading ? "Sgining in..." : "Sign In"}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
