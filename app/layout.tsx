import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { ThemeProvider } from "@/components/themeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Suspense } from "react";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Task Flow",
  description:
    "Organize tasks, habits, projects, and job searches. Capture work quickly, plan your day, and focus on what matters next.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('dark');",
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-200">
        <ThemeProvider>
          <TooltipProvider>
            <Suspense fallback={<div className="h-16 border-b border-border bg-background" />}>
              <Navbar />
            </Suspense>
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster
              position="top-center"
              richColors
              closeButton
              theme="dark"
              toastOptions={{
                style: {
                  width: "320px",
                  maxWidth: "calc(100vw - 32px)",
                  padding: "8px 10px",
                },
                classNames: {
                  title: "text-sm",
                  description: "text-xs",
                },
              }}
            />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
