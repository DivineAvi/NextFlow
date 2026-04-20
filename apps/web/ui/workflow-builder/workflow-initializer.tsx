"use client";

import { useEffect, useRef } from "react";
import { useCanvasStore } from "@/store/canvas-store";

export function WorkflowInitializer({ workflowId }: { workflowId: string }) {
  const setWorkflowId = useCanvasStore((s) => s.setWorkflowId);
  const setWorkflowName = useCanvasStore((s) => s.setWorkflowName);
  const setNodes = useCanvasStore((s) => s.setNodes);
  const setEdges = useCanvasStore((s) => s.setEdges);
  const currentWorkflowId = useCanvasStore((s) => s.workflowId);

  // Track whether we've already loaded this specific workflow to avoid
  // clobbering in-progress edits on re-renders.
  const loadedRef = useRef<string | null>(null);

  useEffect(() => {
    if (loadedRef.current === workflowId) return;
    loadedRef.current = workflowId;

    setWorkflowId(workflowId);
    // Clear stale state from any previously open workflow
    setNodes([]);
    setEdges([]);

    fetch(`/api/workflows/${workflowId}`)
      .then((r) => r.json())
      .then((workflow) => {
        if (workflow.error) return;
        setWorkflowName(workflow.name ?? "Untitled Workflow");
        const def = (workflow.definition as any) ?? {};
        setNodes(def.nodes ?? []);
        setEdges(def.edges ?? []);
      })
      .catch(() => {});
  }, [workflowId]);

  return null;
}
