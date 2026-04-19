import type { NodeProps } from "reactflow";
import { Position } from "reactflow";
import { BaseNode } from "../base-node";
import { NodeRegistry, type NumberControlDef } from "@nextflow/core";

import { HandlerRenderer, LabelRenderer, NumberInputRenderer } from "../renderers";
import { Crop } from "lucide-react";
import { NODE_DEFINATIONS } from "../../type";

export function CropImageNode(props: NodeProps) {
  // Get node definition
  const definition = NODE_DEFINATIONS.ImageCropNodeDefination;

  //Extracting inputs and outputs
  const imageInput = definition.inputs.find(i => i.id === 'image_input');
  const imageOutput = definition.outputs.find(o => o.id === 'image_output');

  // Helper to strictly extract number controls
  const getNumControl = (id: string) => {
    const raw = definition.controls?.find(c => c.id === id);
    return raw?.type === 'number' ? (raw as NumberControlDef) : null;
  };

  const xControl = getNumControl('x');
  const yControl = getNumControl('y');
  const widthControl = getNumControl('width');
  const heightControl = getNumControl('height');

  return (
    <BaseNode {...props} Width="220px" minHeight="50px" tone="blue" icon={Crop}>

      {/* Top handles row: Input & Output */}
      <div className="relative flex px-4 h-7 w-full items-center justify-between ">
        <div className="flex items-center h-full gap-2">
          <HandlerRenderer
            label={imageInput!.label}
            id={imageInput!.id}
            handleType="target"
            handlerDataType={imageInput!.type}
            description={imageInput!.description || "Image to crop"}
            tone="blue"
            position={Position.Left}
          />
          <LabelRenderer tone="dark">{imageInput!.label}</LabelRenderer>
        </div>

        <div className="flex items-center h-full gap-2">
          <LabelRenderer tone="dark">{imageOutput!.label}</LabelRenderer>
          <HandlerRenderer
            label={imageOutput!.label}
            id={imageOutput!.id}
            handleType="source"
            handlerDataType={imageOutput!.type}
            description={imageOutput!.description || "The cropped image"}
            tone="blue"
            position={Position.Right}
          />
        </div>
      </div>

      {/* Config fields - 2x2 Grid Layout */}
      <div className="flex flex-col px-3 gap-3 mt-2">

        {/* ROW 1: X & Y */}
        <div className="flex gap-3">
          <div className="flex flex-col gap-1 w-1/2">
            <LabelRenderer tone="dark">{xControl!.label}</LabelRenderer>
            <NumberInputRenderer
              id={xControl!.id}
              nodeId={props.id}
              tone="dark"
              initialValue={xControl!.defaultValue}
              placeholder={xControl!.placeholder}
            />
          </div>
          <div className="flex flex-col gap-1 w-1/2">
            <LabelRenderer tone="dark">{yControl!.label}</LabelRenderer>
            <NumberInputRenderer
              id={yControl!.id}
              nodeId={props.id}
              tone="dark"
              initialValue={yControl!.defaultValue}
              placeholder={yControl!.placeholder}
            />
          </div>
        </div>

        {/* ROW 2: Width & Height */}
        <div className="flex gap-3">
          <div className="flex flex-col gap-1 w-1/2">
            <LabelRenderer tone="dark">{widthControl!.label}</LabelRenderer>
            <NumberInputRenderer
              id={widthControl!.id}
              nodeId={props.id}
              tone="dark"
              initialValue={widthControl!.defaultValue}
              placeholder={widthControl!.placeholder}
            />
          </div>
          <div className="flex flex-col gap-1 w-1/2">
            <LabelRenderer tone="dark">{heightControl!.label}</LabelRenderer>
            <NumberInputRenderer
              id={heightControl!.id}
              nodeId={props.id}
              tone="dark"
              initialValue={heightControl!.defaultValue}
              placeholder={heightControl!.placeholder}
            />
          </div>
        </div>

      </div>
    </BaseNode>
  );
}