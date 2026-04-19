"use client";

import { ReactFlowProvider } from "reactflow";
import { AppSidebar } from "./sidebar/app-sidebar";
import { EditorCanvas } from "./canvas/editor-canvas";
import { HistorySidebar } from "./sidebar/history-library";

/**
 * `ReactFlowProvider` is lifted to this level so that both sidebar and canvas
 * share the same React Flow context. This allows the sidebar's "Add to Canvas"
 * action to resolve node positions via `screenToFlowPosition` without prop-drilling.
 */
export function WorkflowCanvas() {
  return (
    <ReactFlowProvider>
      <div className="flex h-screen w-full overflow-hidden bg-[#0A0A0A]">
        <AppSidebar />
        <main className="flex-1 min-w-0">
          <EditorCanvas />
        </main>
        <HistorySidebar />
      </div>
    </ReactFlowProvider>
  );
}
