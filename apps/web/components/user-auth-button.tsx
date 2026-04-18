"use client";

import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { User } from "lucide-react";

interface UserAuthButtonProps {
  isCollapsed?: boolean;
}

export function UserAuthButton({ isCollapsed = false }: UserAuthButtonProps) {
  // Collapsed — icon only.
  if (isCollapsed) {
    return (
      <div className="flex items-center bg-blue-500 rounded-md justify-center p-2 cursor-pointer">
        <Show when="signed-in">
          <UserButton appearance={{ elements: { avatarBox: "w-8 h-8" } }} />
        </Show>
        <Show when="signed-out">
          <User className="w-6 h-6 text-zinc-600 dark:text-zinc-300" aria-label="Sign in" />
        </Show>
      </div>
    );
  }

  // Expanded — full sign-in button or user avatar.
  return (
    <>
      <Show when="signed-out">
        <SignInButton>
          <div className="flex px-4 py-2 h-12 items-center justify-center rounded-md p-2 cursor-pointer transition-shadow duration-200 hover:shadow-[0_0_0_3px_blue-600] bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white">
            Sign in
          </div>
        </SignInButton>
      </Show>
      <Show when="signed-in">
        <UserButton />
      </Show>
    </>
  );
}
