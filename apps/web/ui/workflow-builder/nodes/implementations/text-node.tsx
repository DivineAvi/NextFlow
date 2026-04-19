import type { NodeProps } from "reactflow";
import { Position } from "reactflow";
import { BaseNode } from "../base-node";
import { NodeRegistry } from "@nextflow/core";
import { TextareaRenderer, LabelRenderer, HandlerRenderer, CopyButton } from "../renderers";
import { TextNodeIcon } from "@nextflow/ui";

export function TextNode(props: NodeProps) {
  // Get Node Definition
  const definition = NodeRegistry['text_input'];
  
  // Extract inputs and outputs
  const textOutput = definition.outputs.find(o => o.id === 'text_output');

  const rawTextControl = definition.controls?.find(c => c.id === 'text');
  const textControl = rawTextControl?.type === 'text' ? rawTextControl : null;

  return (
    <BaseNode {...props} Width="220px" icon={TextNodeIcon} tone="yellow">
      {/* Handles row */}
      <div className="relative flex px-4 h-7 w-full items-center justify-end">
        <div className="flex items-center h-full">
          <LabelRenderer htmlFor={textOutput!.id} tone="dark">
            {textOutput!.label}
          </LabelRenderer>
          <HandlerRenderer
            label={textOutput!.label}
            id={textOutput!.id}
            handleType="source"
            handlerDataType={textOutput!.type}
            description={textOutput!.description || "The processed text"}
            tone="yellow"
            position={Position.Right}
          />
        </div>
      </div>

      {/* Copy button row */}
      <div className="flex justify-end px-3 h-7">
        {/* Pass the data string to the copy button */}
        <CopyButton value={props.data[textControl!.id] || ''} />
      </div>

      {/* Content row */}
      <div className="flex px-3">
        {textControl && (
          <TextareaRenderer
            nodeId={props.id}
            id={textControl.id}
            tone="dark"
            initialValue={props.data[textControl.id] || textControl.defaultValue}
            placeholder={textControl.placeholder || 'Enter text'}
          />
        )}
      </div>
      <div className="mt-2 px-3 pb-2 border-t border-white/10 pt-2">
        <p className="text-[9px] uppercase text-zinc-500 font-bold mb-1">Live Node Data</p>
        <pre className="text-[9px] bg-black/30 p-1 rounded overflow-hidden text-green-400 font-mono">
          {JSON.stringify(props, null, 2)}
        </pre>
      </div>
    </BaseNode>
  );
}