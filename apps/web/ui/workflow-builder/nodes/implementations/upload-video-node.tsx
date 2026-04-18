import type { NodeProps } from "reactflow";
import { Position } from "reactflow";
import { BaseNode } from "../base-node";
import UploadImageRenderer from "../fields/renderers/upload-file-renderer";
import HandlerRenderer from "../fields/renderers/handler-renderer";
import LabelRenderer from "../fields/renderers/label-renderer";
import CopyButton from "../fields/renderers/copy-button";

export function UploadVideoNode(props: NodeProps) {
  return (
    <BaseNode {...props} Width="220px" >
      {/* Handles row */}
      <div className="relative flex px-4 h-7 w-full items-center justify-end">
        <div className="flex items-center h-full">
          <LabelRenderer htmlFor="video-output" tone="dark">Output</LabelRenderer>
          <HandlerRenderer
            label="Video output"
            id="video-output"
            handleType="source"
            handlerDataType="string"
            description="The uploaded video URL"
            tone="pink"
            position={Position.Right}
          />
        </div>
      </div>
      <div className="px-3 flex gap-2 items-center">
        <LabelRenderer htmlFor="video-output" tone="dark">Video</LabelRenderer>
      {/* Content row */}
        <UploadImageRenderer
          id="video-input"
          tone="dark"
          fileType="video"
          placeholder="Add Video"
        />

      </div>
    </BaseNode>
  );
}
