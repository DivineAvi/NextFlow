import type { NodeProps } from "reactflow";
import { Position } from "reactflow";
import { BaseNode } from "../base-node";
import { NodeRegistry, type NumberControlDef } from "@nextflow/core";

import { HandlerRenderer, LabelRenderer } from "../renderers";
import { NumberInputRenderer } from "../renderers"; // Upgraded from TextField
import { Film } from "lucide-react"; // Or whatever icon you prefer

export function ExtractFrameNode(props: NodeProps) {
  // Get Node Definition
  const definition = NodeRegistry['extract_frame'];

  // Extract inputs and outputs
  const videoInput = definition.inputs.find(i => i.id === 'video_input');
  const imageOutput = definition.outputs.find(o => o.id === 'image_output');

  // Extract timestamp control
  const rawTimestampControl = definition.controls?.find(c => c.id === 'timestamp');
  const timestampControl = rawTimestampControl?.type === 'number' ? rawTimestampControl : null;

  return (
    <BaseNode {...props} Width="220px" Height="100px" tone="yellow" icon={Film}>

      {/* Top handles row: Input & Output */}
      <div className="relative flex px-4 h-7 w-full items-center justify-between ">
        <div className="flex items-center h-full gap-2">
          <HandlerRenderer
            label={videoInput!.label}
            id={videoInput!.id}
            handleType="target"
            handlerDataType={videoInput!.type}
            description={videoInput!.description || "Video to extract frame from"}
            tone="pink"
            position={Position.Left}
          />
          <LabelRenderer htmlFor={videoInput!.id} tone="dark">{videoInput!.label}</LabelRenderer>
        </div>

        <div className="flex items-center h-full">
          <LabelRenderer htmlFor={imageOutput!.id} tone="dark">{imageOutput!.label}</LabelRenderer>
          <HandlerRenderer
            label={imageOutput!.label}
            id={imageOutput!.id}
            handleType="source"
            handlerDataType={imageOutput!.type}
            description={imageOutput!.description || "The extracted frame image"}
            tone="blue"
            position={Position.Right}
          />
        </div>
      </div>

      {/* Config fields with timestamp input */}
      <div className="flex flex-col px-3 gap-3 mt-1">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1 w-full">

            {timestampControl && (
              <>
                <LabelRenderer htmlFor={timestampControl.id} tone="dark">
                  {timestampControl.label}
                </LabelRenderer>
                <NumberInputRenderer
                  id={timestampControl.id}
                  nodeId={props.id}
                  tone="dark"
                  initialValue={props.data[timestampControl.id] ?? timestampControl.defaultValue}
                  placeholder={timestampControl.placeholder}
                />
              </>
            )}

          </div>
        </div>
      </div>

    </BaseNode>
  );
}