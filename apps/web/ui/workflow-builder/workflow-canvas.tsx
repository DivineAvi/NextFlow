"use client";

import { ReactFlowProvider } from "reactflow";
import { AppSidebar } from "./sidebar/app-sidebar";
import { EditorCanvas } from "./canvas/editor-canvas";
import { HistoryPanel } from "./workflow-history/history-panel";
import { HistorySidebar } from "./sidebar/history-library";
/**
 * `ReactFlowProvider` is intentionally lifted to this level so that both
 * `AppSidebar` and `EditorCanvas` share the same React Flow context and
 * internal Zustand stores.  This allows the sidebar's "Add to Canvas" action
 * to resolve node positions via `screenToFlowPosition` without prop-drilling.
 */
export function WorkflowCanvas() {
  return (
    <ReactFlowProvider>
      <div className="flex h-screen w-full overflow-hidden bg-[#0A0A0A]">
        <AppSidebar />
        <EditorCanvas />
        <HistorySidebar />
      </div>
    </ReactFlowProvider>
  );
}
