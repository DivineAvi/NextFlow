import type { NodeProps } from "reactflow";
import { Position } from "reactflow";
import { BaseNode } from "../base-node";
import TextareaRenderer from "../fields/renderers/textarea-renderer";
import HandlerRenderer from "../fields/renderers/handler-renderer";
import LabelRenderer from "../fields/renderers/label-renderer";
import CopyButton from "../fields/renderers/copy-button";
import UploadImageRenderer from "../fields/renderers/upload-image-renderer";
import PreviewRenderer from "../fields/renderers/preview-renderer";

export function LLMNode(props: NodeProps) {
  return (
    <BaseNode {...props} minWidth="min-w-[220px]" minHeight="min-h-fit">
      {/* Handles row: Input (Prompt, Image), Output (Text) */}
      <div className="relative flex px-4 h-7 w-full items-center justify-between">
        {/* Left: Input handles */}
        <div className="flex gap-2 items-center h-full">
          {/* Prompt Input */}
          <LabelRenderer htmlFor="prompt-input" tone="dark">
            Prompt
          </LabelRenderer>
          <HandlerRenderer
            label="Prompt Input"
            id="prompt-input"
            handleType="target"
            handlerDataType="string"
            description="Input prompt text"
            tone="yellow"
            position={Position.Left}
          />
        </div>
        {/* Right: Output handle */}
        <div className="flex items-center h-full">
          <LabelRenderer htmlFor="llm-text-output" tone="dark">
            Output
          </LabelRenderer>
          <HandlerRenderer
            label="LLM Text Output"
            id="llm-text-output"
            handleType="source"
            handlerDataType="string"
            description="The LLM-generated text"
            tone="yellow"
            position={Position.Right}
          />
        </div>
      </div>

      {/* Copy button row */}
      <div className="flex justify-end px-3 h-7">
        <CopyButton value={props.data && props.data.output} />
      </div>

      {/* Content fields */}
      <div className="flex flex-col px-3 gap-3">
        {/* System prompt field */}
        <div className="flex flex-col gap-1">
          <LabelRenderer htmlFor="system-prompt" tone="dark">
            System Prompt
          </LabelRenderer>
          <TextareaRenderer
            id="system-prompt"
            tone="dark"
            initialValue={props.data.systemPrompt}
            placeholder="You are a helpful assistant..."

          />
        </div>
        {/* User prompt field */}
        <div className="flex flex-col gap-1">
          <LabelRenderer htmlFor="user-prompt" tone="dark">
            User Prompt
          </LabelRenderer>
          <TextareaRenderer
            id="user-prompt"
            tone="dark"
            initialValue={props.data.prompt}
            placeholder="Enter the user prompt here..."

          />
        </div>
        {/* Reference image placeholder */}
        <div className="flex flex-col gap-1">

          <UploadImageRenderer
            id="image-input"
            tone="dark"
            onChange={(file) => {
              if (props.data && props.data.onImageChange) {
                props.data.onImageChange(file);
              }
            }}
          />
          {props.data?.imageUrl && (
            <div className="mt-2">
              <PreviewRenderer
                urls={[]}
                id="image-preview"
                sourceId="llm-text-output"
                value="Image"
                type="text"
              />
            </div>
          )}
        </div>

 
      </div>

      <div className=" relative flex items-center h-full p-4">
          <HandlerRenderer
            label="Image Input"
            id="image-input"
            handleType="target"
            handlerDataType="string"
            description="Image input"
            tone="yellow"
            position={Position.Left}
          />
          <LabelRenderer htmlFor="image-input" tone="dark">
            Image
          </LabelRenderer>
          </div>
    </BaseNode>
  );
}
