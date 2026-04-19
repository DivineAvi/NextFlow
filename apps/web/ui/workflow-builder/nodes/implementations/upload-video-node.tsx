import type { NodeProps } from "reactflow";
import { Position } from "reactflow";
import { BaseNode } from "../base-node";
import { UploadFileRenderer } from "../renderers";
import { HandlerRenderer, LabelRenderer } from "../renderers";
import { NodeRegistry, type FileUploadControlDef } from "@nextflow/core";
import { VideoIcon } from "lucide-react";

export function UploadVideoNode(props: NodeProps) {
  // Get Node Definition
  const defination = NodeRegistry['upload_video'];

  // Extract outputs
  const videoOutput = defination.outputs.find(o => o.id === 'video_output');
  const videoInput = defination.controls?.find(c => c.id === 'video_file');

  // Extract file upload control
  const videoControl = videoInput?.type === 'file_upload' ? videoInput : null;

  return (
    <BaseNode {...props} Width="220px" icon={VideoIcon}>
      {/* Handles row */}
      <div className="relative flex px-4 h-7 w-full items-center justify-end">
        <div className="flex items-center h-full">
          <LabelRenderer htmlFor={videoOutput!.id} tone="dark">{videoOutput!.label}</LabelRenderer>
          <HandlerRenderer
            label={videoOutput!.label}
            id={videoOutput!.id}
            handleType="source"
            handlerDataType={videoOutput!.type}
            description={videoOutput!.description || "The uploaded video URL"}
            tone="pink"
            position={Position.Right}
          />
        </div>
      </div>
      <div className="px-3 flex gap-2 items-center">
        <LabelRenderer htmlFor={videoControl!.id} tone="dark">
          {videoControl!.label}
        </LabelRenderer>
        {/* Content row */}
        <UploadFileRenderer
          id={videoControl!.id}
          nodeId={props.id}
          tone="dark"
          fileType={videoControl!.fileType}
          placeholder={videoControl!.placeholder}
        />

      </div>
    </BaseNode>
  );
}
