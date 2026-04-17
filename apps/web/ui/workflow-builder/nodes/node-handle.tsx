import { type ComponentProps } from "react";
import { Handle } from "reactflow";
import { cn } from "@nextflow/utils";
import { type AccentTone } from "../tokens/tones";

export type NodeHandleTone = AccentTone;

export type NodeHandleProps = ComponentProps<typeof Handle> & {
  /** Visual accent; avoids per-node Tailwind `!` overrides. */
  tone?: NodeHandleTone;
};

/**
 * Workflow handle styled via `globals.css` (`.workflow-node-handle`).
 * Uses `--workflow-node-border` / `--workflow-handle-size` from the parent
 * {@link BaseNode} card so left/right alignment sits on the outer border.
 */
export function NodeHandle({ className, tone = "zinc", ...props }: NodeHandleProps) {
  return (
    <Handle
      {...props}
      data-tone={tone}
      className={cn("workflow-node-handle", className)}
    />
  );
}
