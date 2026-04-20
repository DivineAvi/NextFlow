"use client";

import { useEffect } from "react";
import { ReactFlowProvider } from "reactflow";
import { AppSidebar } from "./sidebar/app-sidebar";
import { EditorCanvas } from "./canvas/editor-canvas";
import { HistorySidebar } from "./sidebar/history-library";
import { WorkflowInitializer } from "./workflow-initializer";
import { useCanvasStore } from "@/store/canvas-store";

export function WorkflowCanvas({ workflowId }: { workflowId?: string }) {
  const theme = useCanvasStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    return () => { delete document.documentElement.dataset.theme; };
  }, [theme]);

  return (
    <ReactFlowProvider>
      {workflowId && <WorkflowInitializer workflowId={workflowId} />}
      <div className="flex h-screen w-full overflow-hidden bg-[var(--wf-bg-canvas)]">
        <AppSidebar />
        <main className="flex-1 min-w-0">
          <EditorCanvas />
        </main>
        <HistorySidebar />
      </div>
    </ReactFlowProvider>
  );
}
