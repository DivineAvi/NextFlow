import type { NodeProps } from "reactflow";
import { Position } from "reactflow";
import { BaseNode } from "../base-node";
import { HandlerRenderer, LabelRenderer, NumberInputRenderer } from "../renderers";
import type { NumberControlDef } from "@nextflow/core";
import { Crop } from "lucide-react";
import { NODE_DEFINATIONS } from "../../type";

export function CropImageNode(props: NodeProps) {
  const definition = NODE_DEFINATIONS.ImageCropNodeDefination;
  const imageInput  = definition.inputs.find((i) => i.id === "image_input")!;
  const imageOutput = definition.outputs.find((o) => o.id === "image_output")!;

  const getNum = (id: string): NumberControlDef | null => {
    const raw = definition.controls?.find((c) => c.id === id);
    return raw?.type === "number" ? (raw as NumberControlDef) : null;
  };

  const xCtrl = getNum("x");
  const yCtrl = getNum("y");
  const wCtrl = getNum("width");
  const hCtrl = getNum("height");

  const output: string | undefined = props.data.output;
  const isImage = output?.startsWith("data:image") || output?.startsWith("http");

  return (
    <BaseNode {...props} Width="220px" tone="blue" icon={Crop}>
      {/* Input & output handles */}
      <div className="relative flex px-4 h-7 w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <HandlerRenderer
            label={imageInput.label}
            id={imageInput.id}
            handleType="target"
            handlerDataType={imageInput.type}
            description={imageInput.description ?? "Image to crop"}
            tone="blue"
            position={Position.Left}
          />
          <LabelRenderer tone="dark">{imageInput.label}</LabelRenderer>
        </div>
        <div className="flex items-center gap-2">
          <LabelRenderer tone="dark">{imageOutput.label}</LabelRenderer>
          <HandlerRenderer
            label={imageOutput.label}
            id={imageOutput.id}
            handleType="source"
            handlerDataType={imageOutput.type}
            description={imageOutput.description ?? "The cropped image"}
            tone="blue"
            position={Position.Right}
          />
        </div>
      </div>

      {/* 2×2 grid of crop params */}
      <div className="flex flex-col px-3 gap-2 mt-1 pb-1">
        <div className="flex gap-2">
          {xCtrl && (
            <div className="flex flex-col gap-1 w-1/2">
              <LabelRenderer tone="dark">{xCtrl.label}</LabelRenderer>
              <NumberInputRenderer id={xCtrl.id} nodeId={props.id} tone="dark" initialValue={props.data[xCtrl.id] ?? xCtrl.defaultValue} placeholder={xCtrl.placeholder} />
            </div>
          )}
          {yCtrl && (
            <div className="flex flex-col gap-1 w-1/2">
              <LabelRenderer tone="dark">{yCtrl.label}</LabelRenderer>
              <NumberInputRenderer id={yCtrl.id} nodeId={props.id} tone="dark" initialValue={props.data[yCtrl.id] ?? yCtrl.defaultValue} placeholder={yCtrl.placeholder} />
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {wCtrl && (
            <div className="flex flex-col gap-1 w-1/2">
              <LabelRenderer tone="dark">{wCtrl.label}</LabelRenderer>
              <NumberInputRenderer id={wCtrl.id} nodeId={props.id} tone="dark" initialValue={props.data[wCtrl.id] ?? wCtrl.defaultValue} placeholder={wCtrl.placeholder} />
            </div>
          )}
          {hCtrl && (
            <div className="flex flex-col gap-1 w-1/2">
              <LabelRenderer tone="dark">{hCtrl.label}</LabelRenderer>
              <NumberInputRenderer id={hCtrl.id} nodeId={props.id} tone="dark" initialValue={props.data[hCtrl.id] ?? hCtrl.defaultValue} placeholder={hCtrl.placeholder} />
            </div>
          )}
        </div>
      </div>

      {/* Output image preview */}
      {output && isImage && (
        <div className="mx-3 mb-3">
          <img
            src={output}
            alt="Cropped output"
            className="w-full rounded-md border border-zinc-700 object-contain max-h-32"
          />
        </div>
      )}
    </BaseNode>
  );
}
