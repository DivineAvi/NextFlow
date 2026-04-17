"use client"
import { Sidebar } from "@/ui/workflow-builder/app-sidebar";
import { EditorCanvas } from "@/ui/workflow-builder/canvas/index";
export default function Home() {
  return (
<div className="flex h-screen w-full overflow-hidden bg-[#0A0A0A]">
      
      {/* 2. The Sidebar (It already has fixed width in its own file) */}
      <Sidebar />
      <EditorCanvas />
      {/* 3. The Main Content Area: flex-1 forces it to take up the remaining space */}
      <main className="flex-1 overflow-y-auto">
       
      </main>

    </div>
  );
}
