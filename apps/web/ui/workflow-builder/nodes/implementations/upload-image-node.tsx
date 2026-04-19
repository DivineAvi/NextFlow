import type { NodeProps } from "reactflow";
import { Position } from "reactflow";
import { BaseNode } from "../base-node";
import { NodeRegistry, type FileUploadControlDef } from "@nextflow/core";


import { HandlerRenderer, LabelRenderer, UploadFileRenderer } from "../renderers";
import { Image as ImageIcon } from "lucide-react"; // Fallback icon if needed
import { NODE_DEFINATIONS } from "../../type";

export function UploadImageNode(props: NodeProps) {
  // Get Node Definition
  const definition = NODE_DEFINATIONS.UploadImageNodeDefination;

  // Extract outputs
  const imageOutput = definition.outputs.find(o => o.id === 'image_output');

  // Extract file upload control
  const rawUploadControl = definition.controls?.find(c => c.id === 'image_file');
  const uploadControl = rawUploadControl?.type === 'file_upload' ? rawUploadControl : null;

  return (
    <BaseNode {...props} Width="220px" icon={ImageIcon}>
      {/* Handles row */}
      <div className="relative flex px-4 h-7 w-full items-center justify-end ">
        <div className="flex items-center h-full">
          <LabelRenderer htmlFor={imageOutput!.id} tone="dark">
            {imageOutput!.label}
          </LabelRenderer>
          <HandlerRenderer
            label={imageOutput!.label}
            id={imageOutput!.id}
            handleType="source"
            handlerDataType={imageOutput!.type}
            description={imageOutput!.description || "The uploaded image URL"}
            tone="blue"
            position={Position.Right}

          />
        </div>
      </div>

      {/* Content row */}
      <div className="px-3 pt-1 flex gap-2 items-center">
        {uploadControl && (
          <>
            <LabelRenderer htmlFor={uploadControl.id} tone="dark">
              {uploadControl.label}
            </LabelRenderer>
            <div className="flex-1">
              <UploadFileRenderer
                id={uploadControl.id}
                nodeId={props.id}
                tone="dark"
                // Passes 'image' so your renderer knows to set accept="image/*"
                fileType={uploadControl.fileType}
                placeholder={uploadControl.placeholder}
              />
            </div>
          </>
        )}
      </div>
    </BaseNode>
  );
}