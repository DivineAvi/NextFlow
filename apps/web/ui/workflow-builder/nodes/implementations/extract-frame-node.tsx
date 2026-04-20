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

  const status: string | undefined = props.data.status;
  const output: string | undefined = props.data.output;
  const hasImage = !!output;

  const preview = hasImage ? (
    <img src={output} alt="Extracted frame" className="w-full block object-cover max-h-40" />
  ) : status === "RUNNING" ? (
    <div className="h-20 bg-zinc-800 animate-pulse" />
  ) : null;

  return (
    <BaseNode {...props} Width="220px" tone="pink" icon={Film} preview={preview}>
      {/* Handles row */}
      <div className="relative flex px-4 h-7 w-full items-center justify-between mt-1">
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
      <div className="px-3 mt-1">
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
    </BaseNode>
  );
}
