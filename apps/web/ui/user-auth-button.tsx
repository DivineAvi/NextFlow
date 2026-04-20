"use client";

import { useUser, SignInButton, Show } from "@clerk/nextjs";
import { LogIn } from "lucide-react";

interface UserAuthButtonProps {
  isCollapsed?: boolean;
}

export function UserAuthButton({ isCollapsed = false }: UserAuthButtonProps) {
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? "";

  return (
    <>
      <Show when="signed-out">
        <SignInButton>
          <div
            className={`flex ${isCollapsed ? "h-9 w-9 shrink-0" : "h-12 px-4 py-2"} rounded-md whitespace-nowrap items-center justify-center p-2 cursor-pointer transition-shadow duration-300 hover:shadow-[0_0_0_4px_rgba(59,130,246,0.38)] bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white overflow-hidden`}
          >
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
        {isCollapsed ? (
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-zinc-900 text-xs font-medium text-zinc-300 border border-zinc-800">
            {email[0]?.toUpperCase() ?? "U"}
          </div>
        ) : (
          <div className="flex items-center gap-2.5 rounded-md bg-zinc-900 border border-zinc-800 px-3 py-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-[10px] font-semibold text-zinc-200">
              {email[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-[11px] text-zinc-300 leading-tight">{email}</span>
              <span className="text-[9px] text-zinc-600 leading-tight">Free</span>
            </div>
          </div>
        )}
      </Show>
    </>
  );
}
