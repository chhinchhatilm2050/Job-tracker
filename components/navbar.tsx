"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Home,
  LayoutDashboard,
  Info,
  Menu,
  X,
  LogOut,
  BriefcaseBusiness,
  Layers,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { SignOutButton } from "./signoutBtn";
import { useSession, signOut } from "@/lib/auth/auth.client";
import { ThemeToggle } from "./themeToggle";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    {
      name: "Home",
      href: "/",
      icon: Home,
    },
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "About",
      href: "/about",
      icon: Info,
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-zinc-950/80 transition-colors">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Left: Hamburger (mobile) + Brand Logo + Desktop Nav */}
          <div className="flex items-center gap-3 sm:gap-6">
            {/* Hamburger Button (Phone / Mobile screen only) */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden h-9 w-9 text-gray-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
              aria-label="Open mobile menu"
            >
              <Menu className="size-5" />
            </Button>

            {/* Brand Logo */}
            <Link
              href="/"
              className="flex items-center gap-2.5 text-base sm:text-lg font-bold tracking-tight text-gray-900 dark:text-zinc-100 transition hover:opacity-90"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                <Layers className="size-5" />
              </div>
              <span className="whitespace-nowrap">J◎B Tracker</span>
            </Link>
          </div>
           {/* Desktop Nav Links (Hidden on phone screen) */}
            <nav className="hidden md:flex  items-center gap-1 ml-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? "bg-slate-100 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 font-semibold"
                        : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 hover:bg-slate-50 dark:hover:bg-zinc-900"
                    }`}
                  >
                    <Icon className="size-4" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>

          {/* Right: Theme Toggle + Account */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />

            {session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button
                      type="button"
                      className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 cursor-pointer"
                    >
                      <Avatar className="h-9 w-9 border border-gray-200 dark:border-zinc-700">
                        <AvatarFallback className="bg-primary font-semibold text-primary-foreground">
                          {session.user.name?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  }
                />
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold leading-none text-gray-900 dark:text-zinc-100">
                          {session.user.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground truncate">
                          {session.user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <SignOutButton />
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/sign-in">
                  <Button
                    variant="ghost"
                    className="text-gray-700 dark:text-zinc-300 hover:text-black dark:hover:text-white cursor-pointer text-sm px-3"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up" className="hidden sm:inline-flex">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer text-sm">
                    Start for free
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Sidebar (Slide-over drawer on phone screen) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Sidebar drawer content */}
          <div className="relative z-50 flex h-full w-4/5 max-w-xs flex-col bg-white dark:bg-zinc-950 p-6 shadow-2xl border-r border-gray-200 dark:border-zinc-800 transition-transform animate-in slide-in-from-left duration-200">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-zinc-800">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2.5 font-bold text-gray-900 dark:text-zinc-100"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Briefcase className="size-4" />
                </div>
                <span>Job Tracker</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(false)}
                className="h-8 w-8 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="size-5" />
              </Button>
            </div>

            {/* Sidebar Navigation Links */}
            <nav className="flex-1 space-y-1.5 py-6">
              <p className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Navigation
              </p>
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-slate-100 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 font-semibold"
                        : "text-gray-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-900 hover:text-gray-900 dark:hover:text-zinc-100"
                    }`}
                  >
                    <Icon className="size-4" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Sidebar Footer: Account / Actions */}
            <div className="pt-6 border-t border-gray-100 dark:border-zinc-800">
              {session?.user ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 px-2">
                    <Avatar className="h-10 w-10 border border-gray-200 dark:border-zinc-700">
                      <AvatarFallback className="bg-primary font-semibold text-primary-foreground">
                        {session.user.name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100 truncate">
                        {session.user.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {session.user.email}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full justify-start text-destructive hover:bg-destructive/10 cursor-pointer"
                    onClick={async () => {
                      setIsMobileMenuOpen(false);
                      await signOut();
                    }}
                  >
                    <LogOut className="size-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/sign-in"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button
                      variant="outline"
                      className="w-full justify-center cursor-pointer"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link
                    href="/sign-up"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button className="w-full justify-center bg-primary text-primary-foreground cursor-pointer">
                      Start for free
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
