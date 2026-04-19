import type { NodeProps } from "reactflow";
import { Position } from "reactflow";
import { BaseNode } from "../base-node";
import { HandlerRenderer, LabelRenderer, NumberInputRenderer } from "../renderers";
import type { NumberControlDef } from "@nextflow/core";
import { Film } from "lucide-react";
import { NODE_DEFINATIONS } from "../../type";

export function ExtractFrameNode(props: NodeProps) {
  const definition = NODE_DEFINATIONS.ExtractFrameNodeDefination;
  const videoInput  = definition.inputs.find((i) => i.id === "video_input")!;
  const imageOutput = definition.outputs.find((o) => o.id === "image_output")!;

  const rawTimestamp = definition.controls?.find((c) => c.id === "timestamp");
  const timestampCtrl = rawTimestamp?.type === "number" ? (rawTimestamp as NumberControlDef) : null;

  const output: string | undefined = props.data.output;
  const isImage = output?.startsWith("data:image") || output?.startsWith("http");

  return (
    <BaseNode {...props} Width="220px" tone="pink" icon={Film}>
      {/* Handles row */}
      <div className="relative flex px-4 h-7 w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <HandlerRenderer
            label={videoInput.label}
            id={videoInput.id}
            handleType="target"
            handlerDataType={videoInput.type}
            description={videoInput.description ?? "Video to extract frame from"}
            tone="pink"
            position={Position.Left}
          />
          <LabelRenderer tone="dark">{videoInput.label}</LabelRenderer>
        </div>
        <div className="flex items-center gap-2">
          <LabelRenderer tone="dark">{imageOutput.label}</LabelRenderer>
          <HandlerRenderer
            label={imageOutput.label}
            id={imageOutput.id}
            handleType="source"
            handlerDataType={imageOutput.type}
            description={imageOutput.description ?? "Extracted frame image"}
            tone="blue"
            position={Position.Right}
          />
        </div>
      </div>

      {/* Timestamp control */}
      <div className="px-3 pb-2 mt-1">
        {timestampCtrl && (
          <div className="flex flex-col gap-1">
            <LabelRenderer tone="dark">{timestampCtrl.label}</LabelRenderer>
            <NumberInputRenderer
              id={timestampCtrl.id}
              nodeId={props.id}
              tone="dark"
              initialValue={props.data[timestampCtrl.id] ?? timestampCtrl.defaultValue}
              placeholder={timestampCtrl.placeholder}
            />
          </div>
        )}
      </div>

      {/* Extracted frame preview */}
      {output && isImage && (
        <div className="mx-3 mb-3">
          <img
            src={output}
            alt="Extracted frame"
            className="w-full rounded-md border border-zinc-700 object-contain max-h-32"
          />
        </div>
      )}
    </BaseNode>
  );
}
