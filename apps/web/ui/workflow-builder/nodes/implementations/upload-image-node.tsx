import type { NodeProps } from "reactflow";
import { Position } from "reactflow";
import { BaseNode } from "../base-node";
import UploadImageRenderer from "../fields/renderers/upload-file-renderer";
import HandlerRenderer from "../fields/renderers/handler-renderer";
import LabelRenderer from "../fields/renderers/label-renderer";
import CopyButton from "../fields/renderers/copy-button";

export function UploadImageNode(props: NodeProps) {
  return (
    <BaseNode {...props} Width="220px" >
      {/* Handles row */}
      <div className="relative flex px-4 h-7 w-full items-center justify-end">
        <div className="flex items-center h-full">
          <LabelRenderer htmlFor="image-output" tone="dark">Output</LabelRenderer>
          <HandlerRenderer
            label="Image output"
            id="image-output"
            handleType="source"
            handlerDataType="string"
            description="The uploaded image URL"
            tone="blue"
            position={Position.Right}
          />
        </div>
      </div>

      {/* Content row */}
      <div className="px-3 flex gap-2 items-center">

      <LabelRenderer htmlFor="image-output" tone="dark">Image</LabelRenderer>
        <UploadImageRenderer
          id="image-input"
          tone="dark"
          fileType="image"
          placeholder="Add file"
        />
      </div>
    </BaseNode>
  );
}
