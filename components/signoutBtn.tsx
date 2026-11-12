"use client";
import { useRouter } from "next/navigation";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { signOut } from "@/lib/auth/auth.client";

export function SignOutButton() {
  const router = useRouter();

  return (
    <DropdownMenuItem
      className="cursor-pointer"
      onClick={async () => {
        await signOut();
        router.push("/sign-in");
        router.refresh();
      }}
    >
      Log Out
    </DropdownMenuItem>
  );
}