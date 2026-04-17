import { BaseNode } from "../base-node";
import { NodeHandle } from "../node-handle";
import { Position, NodeProps } from "reactflow";

export function LLMNode(props: NodeProps) {
  return (
    <BaseNode {...props}>
      {/* Row 1: Prompt Input with its own Handle */}
      <div className="relative flex flex-col gap-1">
        <label className="text-[10px] font-bold text-zinc-500 uppercase">System Prompt</label>
        <textarea
          className="nodrag nopan w-full resize-y bg-black/40 border border-zinc-800 rounded-md p-2 text-xs text-white outline-none "
          rows={3}
        />
        
        <NodeHandle
          type="target"
          position={Position.Left}
          id="prompt-input"
          tone="orange"
        />
      </div>

      {/* Row 2: Image Input with its own Handle */}
      <div className="relative flex flex-col gap-1">
        <label className="text-[10px] font-bold text-zinc-500 uppercase">Reference Image</label>
        <div className="h-10 w-full bg-zinc-800/50 border border-dashed border-zinc-700 rounded-md flex items-center justify-center text-[10px] text-zinc-500">
          Drop image or connect
        </div>

        <NodeHandle
          type="target"
          position={Position.Left}
          id="image-input"
          tone="blue"
          className="!shadow-md"
     
        />
      </div>
    </BaseNode>
  );
}