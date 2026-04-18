"use client";

import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { LogIn } from "lucide-react";

interface UserAuthButtonProps {
  isCollapsed?: boolean;
}

export function UserAuthButton({ isCollapsed = false }: UserAuthButtonProps) {

  // Expanded — full sign-in button or user avatar.
  return (
    <>
      <Show when="signed-out">
        <SignInButton>
          <div className={`flex ${isCollapsed ? "h-9 w-9 shrink-0 " : "h-12 px-4 py-2 "} rounded-md whitespace-nowrap items-center justify-center p-2 cursor-pointer transition-shadow duration-300 hover:shadow-[0_0_0_4px_rgba(59,130,246,0.38)] bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white overflow-hidden`}>
          {isCollapsed ? (
            <>
              <LogIn className="size-3.5 text-white" strokeWidth={2} aria-hidden />
              <span className="sr-only">Sign in</span>
            </>
          ) : (
            <span>Sign in</span>
          )}
          </div>
        </SignInButton>
      </Show>
      <Show when="signed-in">
        <UserButton />
      </Show>
    </>
  );
}
