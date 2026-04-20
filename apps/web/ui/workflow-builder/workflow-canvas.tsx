"use client";

import { useEffect } from "react";
import { ReactFlowProvider } from "reactflow";
import { AppSidebar } from "./sidebar/app-sidebar";
import { EditorCanvas } from "./canvas/editor-canvas";
import { HistorySidebar } from "./sidebar/history-library";
import { WorkflowInitializer } from "./workflow-initializer";
import { useCanvasStore } from "@/store/canvas-store";
import { PanelLeft } from "lucide-react";
import { SidebarToggle } from "./sidebar/sidebar-toggle";

export function WorkflowCanvas({ workflowId }: { workflowId?: string }) {
  const theme = useCanvasStore((s) => s.theme);
  const mobileSidebarOpen = useCanvasStore((s) => s.mobileSidebarOpen);
  const toggleMobileSidebar = useCanvasStore((s) => s.toggleMobileSidebar);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    return () => { delete document.documentElement.dataset.theme; };
  }, [theme]);

  return (
    <ReactFlowProvider>
      {workflowId && <WorkflowInitializer workflowId={workflowId} />}

      {/* Mobile navbar */}
      <div className="md:hidden flex items-center h-16 bg-[var(--wf-bg-sidebar)] border-[var(--wf-border)] shrink-0">
        <SidebarToggle toggleCollapse={toggleMobileSidebar} />
      </div>

      <div className="flex h-[calc(100vh-3rem)] md:h-screen w-full overflow-hidden bg-[var(--wf-bg-canvas)]">
        {/* Desktop sidebar */}
        <div className="hidden md:flex">
          <AppSidebar />
        </div>

        {/* Mobile sidebar overlay */}
        {mobileSidebarOpen && (
          <>
            <div
              className="md:hidden fixed inset-0 z-40 bg-black/50"
              onClick={toggleMobileSidebar}
            />
            <div className="md:hidden fixed inset-y-0 left-0 z-50">
              <AppSidebar />
            </div>
          </>
        )}

        <main className="flex-1 min-w-0">
          <EditorCanvas />
        </main>
        <HistorySidebar />
      </div>
    </ReactFlowProvider>
  );
}
