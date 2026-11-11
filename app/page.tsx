"use client";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link"; // Fixed: Import Next.js Link correctly
import { buttonVariants, Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react"; // Removed Link icon import to avoid confusion

export default function Home() {
  const [activeTab, setActiveTab] = useState("organize");
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex-1">
        <section className="container mx-auto px-4 py-32">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="font-bold text-black mb-6 text-6xl">
              A better way to track your job applications.
            </h1>
            <p className="text-muted-foreground mb-10 text-lg">
              Capture, organize, and manage your job search in one place. 
              With Chhat, you can easily track your applications, set reminders, and stay on top of your job search.
            </p>
            <div className="flex flex-col items-center gap-4">
              <Link 
                href="/sign-up" 
                className={`${buttonVariants({ size: "lg" })} h-12 px-8 text-lg font-medium cursor-pointer`}
              >
                Start for free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <p className="text-sm text-muted-foreground">Free forever. No credit card required.</p>
            </div>
          </div>
        </section>
        <section className="border-t bg-white py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-6xl">
              <div className="flex gap-2 justify-center mb-8">
                <Button className={`cursor-pointer ${activeTab === "organize" ? "bg-primary text-primary-foreground " : "bg-muted text-muted-foreground hover:text-white"}`} onClick={() => setActiveTab("organize")}>Oragnize Applications</Button>
                <Button className={`cursor-pointer ${activeTab === "get-hired" ? "bg-primary text-primary-foreground " : "bg-muted text-muted-foreground hover:text-white"}`} onClick={() => setActiveTab("get-hired")}>Get Hired</Button>
                <Button className={`cursor-pointer ${activeTab === "manage-boards" ? "bg-primary text-primary-foreground " : "bg-muted text-muted-foreground hover:text-white"}`} onClick={() => setActiveTab("manage-boards")}>Manage Boards</Button>
              </div>
              <div className="relative animate-in mx-auto max-w-5xl overflow-hidden rounded-xl border border-gray-200">
                {activeTab === "organize" && (
                  <Image src="/hero-image/hero1.png" alt="Hero Image" width={1200} height={800} />
                )}
                {activeTab === "get-hired" && (
                  <Image src="/hero-image/hero2.png" alt="Hero Image" width={1200} height={800} />
                )}
                {activeTab === "manage-boards" && (
                  <Image src="/hero-image/hero3.png" alt="Hero Image" width={1200} height={800} />
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}