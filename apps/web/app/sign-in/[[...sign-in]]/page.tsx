import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0E0E0E]">
      <SignIn
        appearance={{
          elements: { card: "bg-[#1A1A1A] border-zinc-800" },
        }}
      />
    </div>
  );
}
