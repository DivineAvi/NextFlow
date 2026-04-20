import type { NodeProps } from "reactflow";
import { Position } from "reactflow";
import { BaseNode } from "../base-node";
import { UploadFileRenderer, HandlerRenderer, LabelRenderer } from "../renderers";
import type { FileUploadControlDef } from "@nextflow/core";
import { VideoIcon } from "lucide-react";
import { NODE_DEFINATIONS } from "../../type";

export function UploadVideoNode(props: NodeProps) {
  const definition = NODE_DEFINATIONS.UploadVideoNodeDefination;
  const videoOutput = definition.outputs.find((o) => o.id === "video_output")!;

  const rawControl = definition.controls?.find((c) => c.id === "video_file");
  const videoControl = rawControl?.type === "file_upload" ? (rawControl as FileUploadControlDef) : null;

  const videoUrl: string | undefined =
    props.data.video_file && !props.data.video_file.startsWith("data:")
      ? props.data.video_file
      : undefined;

  const preview = videoUrl ? (
    <video
      src={videoUrl}
      className="w-full block max-h-40 bg-black"
      controls={false}
      muted
      preload="metadata"
    />
  ) : null;

  return (
    <BaseNode {...props} Width="220px" icon={VideoIcon} tone="pink" preview={preview}>
      {/* Output handle */}
      <div className="relative flex px-4 h-7 w-full items-center justify-end">
        <LabelRenderer htmlFor={videoOutput.id} tone="dark">
          {videoOutput.label}
        </LabelRenderer>
        <HandlerRenderer
          label={videoOutput.label}
          id={videoOutput.id}
          handleType="source"
          handlerDataType={videoOutput.type}
          description={videoOutput.description ?? "The uploaded video"}
          tone="pink"
          position={Position.Right}
        />
      </div>

      {/* File picker */}
      <div className="px-3 pb-3">
        {videoControl && (
          <UploadFileRenderer
            id={videoControl.id}
            nodeId={props.id}
            tone="dark"
            fileType={videoControl.fileType}
            placeholder={videoControl.placeholder ?? "Add Video"}
            initialValue={props.data[videoControl.id]}
          />
        )}
      </div>
    </BaseNode>
  );
}
