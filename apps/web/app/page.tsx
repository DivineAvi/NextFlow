import { AppSidebar } from "@/components/workflow-builder/sidebar/app-sidebar";
import { EditorCanvas } from "@/components/workflow-builder/canvas/editor-canvas";

export default function Home() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0A0A0A]">
      <AppSidebar />
      <EditorCanvas />
    </div>
  );
}
