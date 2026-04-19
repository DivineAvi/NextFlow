import type { NodeProps } from "reactflow";
import { Position } from "reactflow";
import { BaseNode } from "../base-node";
import { TextareaRenderer, LabelRenderer, HandlerRenderer, SelectorRenderer } from "../renderers";
import { LLMNodeIcon } from "@nextflow/ui";
import { NodeRegistry } from "@nextflow/core";
import { NODE_DEFINATIONS } from "../../type";

export function LLMNode(props: NodeProps) {
  // Get Node Definition
  const definition = NODE_DEFINATIONS.LLMNodeDefination;

  // Extract inputs and outputs
  const textOutput = definition.outputs.find(o => o.id === 'text_output');
  const systemPromptInput = definition.inputs.find(i => i.id === 'system_prompt');
  const userPromptInput = definition.inputs.find(i => i.id === 'user_prompt');
  const imageInput = definition.inputs.find(i => i.id === 'image_input');

  // Extract model control
  const rawModelControl = definition.controls?.find(c => c.id === 'model');
  const modelControl = rawModelControl?.type === 'select' ? rawModelControl : null;

  return (
    <BaseNode {...props} minWidth="220px" icon={LLMNodeIcon}>
      {/* Handles row: Input (Prompt, Image), Output (Text) */}
      <div className="relative flex px-4 h-7 w-full items-center justify-end">
        {/* Right: Output handle */}
        <div className="flex items-center h-full">
          <LabelRenderer htmlFor={textOutput!.id} tone="dark">
            {textOutput!.label}
          </LabelRenderer>
          <HandlerRenderer
            label={textOutput!.label}
            id={textOutput!.id}
            handleType="source"
            handlerDataType={textOutput!.type}
            description={textOutput!.description || "The LLM-generated text"}
            tone="yellow"
            position={Position.Right}
          />
        </div>
      </div>

      {/* Left: Input handles */}
      <div className="relative px-3 flex gap-2 items-center h-full">
        {/* Prompt Input */}
        <LabelRenderer htmlFor={systemPromptInput!.id} tone="dark">
          {systemPromptInput!.label}
        </LabelRenderer>
        <HandlerRenderer
          label={systemPromptInput!.label}
          id={systemPromptInput!.id}
          handleType="target"
          handlerDataType={systemPromptInput!.type}
          description={systemPromptInput!.description || "Input prompt text"}
          tone="yellow"
          position={Position.Left}
        />
      </div>
      {/* System prompt field */}
      <div className="px-3 p-1">
        <TextareaRenderer
          id={systemPromptInput!.id}
          nodeId={props.id}
          tone="dark"
          initialValue={props.data[systemPromptInput!.id]}
          placeholder="You are a helpful assistant..."
        />
      </div>

      {/* Left: Input handles */}
      <div className="relative px-3 flex gap-2 items-center h-full">
        {/* Prompt Input */}
        <LabelRenderer htmlFor={userPromptInput!.id} tone="dark">
          {userPromptInput!.label}
        </LabelRenderer>
        <HandlerRenderer
          label={userPromptInput!.label}
          id={userPromptInput!.id}
          handleType="target"
          handlerDataType={userPromptInput!.type}
          description={userPromptInput!.description || "Input prompt text"}
          tone="yellow"
          position={Position.Left}
        />
      </div>

      {/* User prompt field */}
      <div className="px-3 p-1">
        <TextareaRenderer
          nodeId={props.id}
          id={userPromptInput!.id}
          tone="dark"
          initialValue={props.data[userPromptInput!.id]}
          placeholder="Enter the user prompt here..."
        />
      </div>

      <div className="flex px-3 justify-between items-center gap-5">
        <div className="flex items-center gap-2 h-full flex-1">
          {modelControl && (
            <>
              <LabelRenderer htmlFor={modelControl.id} tone="dark">
                {modelControl.label}
              </LabelRenderer>
              <SelectorRenderer
                id={modelControl.id}
                nodeId={props.id}
                tone="dark"
                value={props.data[modelControl.id] || modelControl.defaultValue}
                options={modelControl.options}
              />
            </>
          )}
        </div>
      </div>

      <div className="relative flex items-center h-full px-3 p-1">
        <HandlerRenderer
          label={imageInput!.label}
          id={imageInput!.id}
          handleType="target"
          handlerDataType={imageInput!.type}
          description={imageInput!.description || "Image input"}
          tone="blue"
          position={Position.Left}
        />
        <LabelRenderer htmlFor={imageInput!.id} tone="dark">
          {imageInput!.label}
        </LabelRenderer>
      </div>
    </BaseNode>
  );
}