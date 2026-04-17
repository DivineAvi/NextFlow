import { BaseNode } from "../base-node";
import { NodeProps, Position } from "reactflow";
import TextareaRenderer from "../fields/renderers/textarea";
import HandlerRenderer from "../fields/renderers/handler";
import LabelRenderer from "../fields/renderers/label";
import CopyRenderer from "../fields/renderers/options/copy";
export function TextNode(props: NodeProps) {
  return (
    <BaseNode {...props} minWidth="min-w-[220px]" minHeight="min-h-fit">
      <div className="relative flex px-4 h-7 w-full items-center justify-between">
        <div className="flex items-center h-full">
        <LabelRenderer htmlFor="text-input" tone="dark">Input</LabelRenderer>
        <HandlerRenderer label="Text input" id="text-input" handleType="target" handlerDataType="string" description="The input text to process" tone="yellow" position={Position.Left} />
        </div>
        <div className="flex items-center h-full">
        <LabelRenderer htmlFor="text-output" tone="dark">Output</LabelRenderer>
        <HandlerRenderer label="Text input" id="text-output" handleType="target" handlerDataType="string" description="The input text to process" tone="yellow" position={Position.Right} />
        </div>
      </div>
      <div className="flex justify-end px-3 h-7">
        <CopyRenderer value={props.data} />
      </div>
      
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