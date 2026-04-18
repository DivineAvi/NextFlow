import type { NodeProps } from "reactflow";
import { Position } from "reactflow";
import { BaseNode } from "../base-node";
import HandlerRenderer from "../fields/renderers/handler-renderer";
import LabelRenderer from "../fields/renderers/label-renderer";
import TextFieldRenderer from "../fields/renderers/textfield-renderer";
import CopyButton from "../fields/renderers/copy-button";
import { Crop } from "lucide-react";
import NumberInputRenderer from "../fields/renderers/number-renderer";

export function CropImageNode(props: NodeProps) {
  return (
    <BaseNode {...props} Width="220px" minHeight="50px" tone="blue">
      {/* Top handles row: Input & Output */}
      <div className="relative flex px-4 h-7 w-full items-center justify-between">
        <div className="flex items-center h-full gap-2">
          <HandlerRenderer
            label="Image Input"
            id="crop-image-input"
            handleType="target"
            handlerDataType="string"
            description="Image to crop"
            tone="blue"
            position={Position.Left}
          />
          <LabelRenderer tone="dark">Image</LabelRenderer>
        </div>
        <div className="flex items-center h-full">
          <LabelRenderer tone="dark">Output</LabelRenderer>
          <HandlerRenderer
            label="Cropped Image Output"
            id="crop-image-output"
            handleType="source"
            handlerDataType="string"
            description="The cropped image"
            tone="blue"
            position={Position.Right}
          />
        </div>
      </div>
      {/* Config fields */}
      <div className="flex flex-col px-3 gap-3">
      <div className="flex gap-3">
        <div className="flex flex-col gap-1">
          <LabelRenderer tone="dark">X Coordinate (%)</LabelRenderer>
          <NumberInputRenderer
            id="crop-x-coordinate"
            tone="dark"
            initialValue={props.data?.x ?? 0}
            placeholder="0"
            />
        </div>
        <div className="flex flex-col gap-1">
          <LabelRenderer tone="dark">Y Coordinate (%)</LabelRenderer>
          <TextFieldRenderer
            id="crop-y-coordinate"
            tone="dark"
            initialValue={props.data?.y ?? "0"}
            placeholder="0"
            />
        </div>
        </div>
        <div className="flex gap-3">
        <div className="flex flex-col gap-1">
          <LabelRenderer tone="dark">Width (%)</LabelRenderer>
          <TextFieldRenderer
            id="crop-width"
            tone="dark"
            initialValue={props.data?.width ?? "100"}
            placeholder="100"
          />
        </div>
        <div className="flex flex-col gap-1">
          <LabelRenderer tone="dark">Height (%)</LabelRenderer>
          <TextFieldRenderer
            id="crop-height"
            tone="dark"
            initialValue={props.data?.height ?? "100"}
            placeholder="100"
          />
        </div>
        </div>
      </div>
    </BaseNode>
  );
}
