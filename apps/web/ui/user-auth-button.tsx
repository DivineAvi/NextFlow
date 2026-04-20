"use client";

import { useUser, SignInButton, Show } from "@clerk/nextjs";
import { LogIn } from "lucide-react";
import { Button } from "@nextflow/ui";

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
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--wf-btn-bg)] text-xs font-medium text-[var(--wf-text-secondary)] border border-[var(--wf-border)]">
            {email[0]?.toUpperCase() ?? "U"}
          </div>
        ) : (
          <Button className=" cursor-pointer flex w-full h-12 justify-between items-center gap-2.5 rounded-md bg-[var(--wf-bg-surface)] hover:bg-[var(--wf-btn-bg)] transition-colors border-none">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--wf-btn-bg)] border border-[var(--wf-border)] text-[10px]  text-[var(--wf-text-primary)]">
              {email[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-[13px] text-[var(--wf-text-primary)] leading-tight">{email}</span>
              <span className="text-[9px] text-[var(--wf-text-faint)] leading-tight flex justify-start">Free</span>
            </div>
            <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">

            </div>
       
          </Button>
        )}
      </Show>
    </>
  );
}
