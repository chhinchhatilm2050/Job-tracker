"use client";
import { useState } from "react";
import { signUp } from "@/lib/auth/auth.client";
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

export default function SignUp() {
  const [name, setName] = useState("");
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
      const restul = await signUp.email({
        name,
        email,
        password
      });

      if (restul.error) {
        setError(restul.error.message ?? "Failed to sign up");
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
            Sign Up
          </CardTitle>
          <CardDescription className="text-gray-600">
            Create an account to start tracking your job application
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
              <Label className="text-gray-700" htmlFor="name">
                Name
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-gray-300 focus:border-primary focus:ring-primary focus:ring-1"
                id="name"
                type="text"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700" htmlFor="email">
                Email
              </Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-gray-300 focus:border-primary focus:ring-primary focus:ring-1"
                id="email"
                type="email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700" htmlFor="password">
                Password
              </Label>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-gray-300 focus:border-primary focus:ring-primary focus:ring-1"
                id="password"
                type="password"
                placeholder=""
                minLength={8}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              className="w-full bg-primary hover:bg-primary/90 cursor-pointer"
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                className="font-medium text-primary hover:underline"
                href="/sign-in"
              >
                Sign In
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
