import type { NodeProps } from "reactflow";
import { Position } from "reactflow";
import { BaseNode } from "../base-node";
import TextareaRenderer from "../fields/renderers/textarea-renderer";
import HandlerRenderer from "../fields/renderers/handler-renderer";
import LabelRenderer from "../fields/renderers/label-renderer";
import CopyButton from "../fields/renderers/copy-button";
import UploadImageRenderer from "../fields/renderers/upload-file-renderer";
import PreviewRenderer from "../fields/renderers/preview-renderer";
import { LLMNodeIcon } from "@nextflow/ui";
import SelectorRenderer from "../fields/renderers/selector-renderer";

export function LLMNode(props: NodeProps) {
  return (
    <BaseNode {...props} Width="220px"  icon={LLMNodeIcon}>
      {/* Handles row: Input (Prompt, Image), Output (Text) */}
      <div className="relative flex px-4 h-7 w-full items-center justify-end">
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

      {/* Left: Input handles */}
      <div className="relative px-3 flex gap-2 items-center h-full">
        {/* Prompt Input */}
        <LabelRenderer htmlFor="prompt-input" tone="dark">
          System Prompt
        </LabelRenderer>
        <HandlerRenderer
          label="Prompt Input"
          id="llm-system-prompt-input"
          handleType="target"
          handlerDataType="string"
          description="Input prompt text"
          tone="yellow"
          position={Position.Left}
        />
      </div>
      {/* System prompt field */}
      <div className="px-3 p-1">
        <TextareaRenderer
          id="system-prompt"
          tone="dark"
          initialValue={props.data.systemPrompt}
          placeholder="You are a helpful assistant..."

        />
      </div>



      {/* Left: Input handles */}
      <div className="relative px-3 flex gap-2 items-center h-full">
        {/* Prompt Input */}
        <LabelRenderer htmlFor="prompt-input" tone="dark">
          User Prompt
        </LabelRenderer>
        <HandlerRenderer
          label="User Prompt Input"
          id="llm-user-prompt-input"
          handleType="target"
          handlerDataType="string"
          description="Input prompt text"
          tone="yellow"
          position={Position.Left}
        />
      </div>

      {/* User prompt field */}
      <div className="px-3 p-1">
        <TextareaRenderer
          id="user-prompt"
          tone="dark"
          initialValue={props.data.prompt}
          placeholder="Enter the user prompt here..."

        />
      </div>
      
      <div className="flex px-3 justify-between items-center gap-5">



        <div className="flex items-center gap-2 h-full flex-1">
          <LabelRenderer htmlFor="image-input" tone="dark">
            Model
          </LabelRenderer>
          <SelectorRenderer
            id="model-input"
            tone="dark"
            value="gemini-3-flash-preview"
            options={[
              { label: "Gemini 3 Flash (Latest)", value: "gemini-3-flash-preview" },
              { label: "Nano Banana 2", value: "gemini-3.1-flash-image-preview" },
            ]}
          />

        </div>
      </div>
      <div className="relative flex items-center h-full px-3">
          <HandlerRenderer
            label="Image Input"
            id="image-input"
            handleType="target"
            handlerDataType="string"
            description="Image input"
            tone="blue"
            position={Position.Left}
          />
          <LabelRenderer htmlFor="image-input" tone="dark">
            Image
          </LabelRenderer>
        </div>
    </BaseNode>
  );
}
