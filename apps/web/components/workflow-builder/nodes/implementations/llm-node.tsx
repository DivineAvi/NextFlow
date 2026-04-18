import type { NodeProps } from "reactflow";
import { BaseNode } from "../base-node";

export function LLMNode(props: NodeProps) {
  return (
    <BaseNode {...props}>
      {/* Row 1: System Prompt */}
      <div className="relative flex flex-col gap-1">
        <label className="text-[10px] font-bold text-zinc-500 uppercase">System Prompt</label>
        <textarea
          className="nodrag nopan w-full resize-y bg-black/40 border border-zinc-800 rounded-md p-2 text-xs text-white outline-none"
          rows={3}
        />
      </div>

      {/* Row 2: Reference Image */}
      <div className="relative flex flex-col gap-1">
        <label className="text-[10px] font-bold text-zinc-500 uppercase">Reference Image</label>
        <div className="h-10 w-full bg-zinc-800/50 border border-dashed border-zinc-700 rounded-md flex items-center justify-center text-[10px] text-zinc-500">
          Drop image or connect
        </div>
      </div>
    </BaseNode>
  );
}
