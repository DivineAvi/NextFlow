import type { NodeProps } from "reactflow";
import { Position } from "reactflow";
import { BaseNode } from "../base-node";
import TextareaRenderer from "../fields/renderers/textarea-renderer";
import HandlerRenderer from "../fields/renderers/handler-renderer";
import LabelRenderer from "../fields/renderers/label-renderer";
import CopyButton from "../fields/renderers/copy-button";

export function TextNode(props: NodeProps) {
  return (
    <BaseNode {...props} minWidth="min-w-[220px]" minHeight="min-h-fit">
      {/* Handles row */}
      <div className="relative flex px-4 h-7 w-full items-center justify-between">
        <div className="flex items-center h-full">
          <LabelRenderer htmlFor="text-input" tone="dark">Input</LabelRenderer>
          <HandlerRenderer
            label="Text input"
            id="text-input"
            handleType="target"
            handlerDataType="string"
            description="The input text to process"
            tone="yellow"
            position={Position.Left}
          />
        </div>
        <div className="flex items-center h-full">
          <LabelRenderer htmlFor="text-output" tone="dark">Output</LabelRenderer>
          <HandlerRenderer
            label="Text output"
            id="text-output"
            handleType="source"
            handlerDataType="string"
            description="The processed text"
            tone="yellow"
            position={Position.Right}
          />
        </div>
      </div>

      {/* Copy button row */}
      <div className="flex justify-end px-3 h-7">
        <CopyButton value={props.data} />
      </div>

      {/* Content row */}
      <div className="flex flex-col px-3">
        <TextareaRenderer
          id="text-input"
          tone="dark"
          initialValue={props.data.text}
          placeholder="Enter text"
        />
      </div>
    </BaseNode>
  );
}
