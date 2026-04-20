import { SignUp } from "@clerk/nextjs";
import Image from "next/image";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-[#0d0d0d] border-r border-zinc-800/60">
        <div className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="NextFlow" width={32} height={32} className="rounded-lg brightness-0 invert" />
        </div>

        <div className="flex flex-col gap-4 max-w-sm">
          <h2 className="text-3xl font-bold text-white leading-tight">
            Start building powerful workflows today
          </h2>
          <p className="text-sm text-zinc-500 leading-relaxed">
            Free account. Connect AI models, process media, and automate complex tasks visually.
          </p>
        </div>

        <p className="text-xs text-zinc-700">© 2025 NextFlow. All rights reserved.</p>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center p-8">
        <SignUp
          appearance={{
            elements: {
              card: "bg-[#111111] border border-zinc-800 shadow-xl",
              headerTitle: "text-zinc-100",
              headerSubtitle: "text-zinc-500",
              socialButtonsBlockButton: "bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-zinc-800",
              formFieldLabel: "text-zinc-400",
              formFieldInput: "bg-zinc-900 border-zinc-700 text-zinc-100 focus:border-zinc-500",
              footerActionLink: "text-blue-400 hover:text-blue-300",
              formButtonPrimary: "bg-blue-600 hover:bg-blue-500",
            },
          }}
        />
      </div>
    </div>
  );
}
