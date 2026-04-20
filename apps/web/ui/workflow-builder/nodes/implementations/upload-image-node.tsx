import type { NodeProps } from "reactflow";
import { Position } from "reactflow";
import { BaseNode } from "../base-node";
import { HandlerRenderer, LabelRenderer, UploadFileRenderer } from "../renderers";
import { Image as ImageIcon } from "lucide-react";
import { NODE_DEFINATIONS } from "../../type";
import type { FileUploadControlDef } from "@nextflow/core";

export function UploadImageNode(props: NodeProps) {
  const definition = NODE_DEFINATIONS.UploadImageNodeDefination;
  const imageOutput = definition.outputs.find((o) => o.id === "image_output")!;

  const rawUpload = definition.controls?.find((c) => c.id === "image_file");
  const uploadControl = rawUpload?.type === "file_upload" ? (rawUpload as FileUploadControlDef) : null;

  const status: string | undefined = props.data.status;
  // Use execution output if available, otherwise the uploaded CDN URL
  const previewUrl: string | undefined =
    props.data.output || (props.data.image_file && !props.data.image_file.startsWith("data:") ? props.data.image_file : undefined);

  const preview = previewUrl ? (
    <img src={previewUrl} alt="Uploaded image" className="w-full block object-cover max-h-40" />
  ) : status === "RUNNING" ? (
    <div className="h-20 bg-zinc-800 animate-pulse" />
  ) : null;

  return (
    <BaseNode {...props} Width="220px" icon={ImageIcon} tone="blue" preview={preview}>
      {/* Output handle */}
      <div className="relative flex px-4 h-7 w-full items-center justify-end">
        <LabelRenderer htmlFor={imageOutput.id} tone="dark">
          {imageOutput.label}
        </LabelRenderer>
        <HandlerRenderer
          label={imageOutput.label}
          id={imageOutput.id}
          handleType="source"
          handlerDataType={imageOutput.type}
          description={imageOutput.description ?? "The uploaded image"}
          tone="blue"
          position={Position.Right}
        />
      </div>

      {/* File picker */}
      <div className="px-3 pb-3">
        {uploadControl && (
          <UploadFileRenderer
            id={uploadControl.id}
            nodeId={props.id}
            tone="dark"
            fileType={uploadControl.fileType}
            placeholder={uploadControl.placeholder ?? "Add Image"}
            initialValue={props.data[uploadControl.id]}
          />
        )}
      </div>
    </BaseNode>
  );
}
