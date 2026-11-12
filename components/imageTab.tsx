"use client";
import Image from "next/image";
import { Button } from "./ui/button";
import { useState } from "react";

export default function ImageTab() {
    const [activeTab, setActiveTab] = useState("organize");
    return (
         <section className="border-t bg-white py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-6xl">
              <div className="flex gap-2 justify-center mb-8">
                <Button className={`cursor-pointer ${activeTab === "organize" ? "bg-primary text-primary-foreground " : "bg-muted text-muted-foreground hover:text-white"}`} onClick={() => setActiveTab("organize")}>Oragnize Applications</Button>
                <Button className={`cursor-pointer ${activeTab === "get-hired" ? "bg-primary text-primary-foreground " : "bg-muted text-muted-foreground hover:text-white"}`} onClick={() => setActiveTab("get-hired")}>Get Hired</Button>
                <Button className={`cursor-pointer ${activeTab === "manage-boards" ? "bg-primary text-primary-foreground " : "bg-muted text-muted-foreground hover:text-white"}`} onClick={() => setActiveTab("manage-boards")}>Manage Boards</Button>
              </div>
              <div className="relative animate-in mx-auto max-w-5xl overflow-hidden rounded-xl border border-gray-200 shadow-lg transition-all duration-300">
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
    );
}