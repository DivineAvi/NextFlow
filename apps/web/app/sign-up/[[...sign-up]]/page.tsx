import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0E0E0E]">
      <SignUp
        appearance={{
          elements: { card: "bg-[#1A1A1A] border-zinc-800" },
        }}
      />
    </div>
  );
}
