import type { NodeProps } from "reactflow";
import { Position } from "reactflow";
import { BaseNode } from "../base-node";
import { TextareaRenderer, LabelRenderer, HandlerRenderer, CopyButton } from "../renderers";
import { TextNodeIcon } from "@nextflow/ui";
import { NODE_DEFINATIONS } from "../../type";

export function TextNode(props: NodeProps) {
  const definition = NODE_DEFINATIONS.TextNodeDefination;
  const textOutput = definition.outputs.find((o) => o.id === "text_output")!;

  const rawTextControl = definition.controls?.find((c) => c.id === "text");
  const textControl = rawTextControl?.type === "text" ? rawTextControl : null;

  return (
    <BaseNode {...props} Width="220px" icon={TextNodeIcon} tone="yellow">
      {/* Output handle + copy row */}
      <div className="relative flex px-4 h-7 w-full items-center justify-between">
        <CopyButton value={props.data[textControl?.id ?? "text"] ?? ""} />
        <div className="flex items-center gap-1.5 h-full">
          <LabelRenderer htmlFor={textOutput.id} tone="dark">
            {textOutput.label}
          </LabelRenderer>
          <HandlerRenderer
            label={textOutput.label}
            id={textOutput.id}
            handleType="source"
            handlerDataType={textOutput.type}
            description={textOutput.description ?? "The processed text"}
            tone="yellow"
            position={Position.Right}
          />
        </div>
      </div>

      {/* Textarea */}
      <div className="flex px-3">
        {textControl && (
          <TextareaRenderer
            nodeId={props.id}
            id={textControl.id}
            tone="dark"
            initialValue={props.data[textControl.id] ?? textControl.defaultValue}
            placeholder={textControl.placeholder ?? "Enter text…"}
          />
        )}
      </div>
    </BaseNode>
  );
}
