import type { NodeProps } from "reactflow";
import { Position } from "reactflow";
import { BaseNode } from "../base-node";
import { TextareaRenderer, LabelRenderer, HandlerRenderer, SelectorRenderer } from "../renderers";
import { LLMNodeIcon } from "@nextflow/ui";
import { NODE_DEFINATIONS } from "../../type";
import { CopyButton } from "../renderers";

export function LLMNode(props: NodeProps) {
  const definition = NODE_DEFINATIONS.LLMNodeDefination;

  const textOutput      = definition.outputs.find((o) => o.id === "text_output")!;
  const systemPromptIn  = definition.inputs.find((i) => i.id === "system_prompt")!;
  const userPromptIn    = definition.inputs.find((i) => i.id === "user_prompt")!;
  const imageIn         = definition.inputs.find((i) => i.id === "image_input")!;

  const rawModel = definition.controls?.find((c) => c.id === "model");
  const modelControl = rawModel?.type === "select" ? rawModel : null;

  const output: string | undefined = props.data.output;

  return (
    <BaseNode {...props} minWidth="240px" icon={LLMNodeIcon} tone="yellow">
      {/* ── Output handle row ─────────────────────────────────────────── */}
      <div className="relative flex px-4 h-7 w-full items-center justify-end">
        <LabelRenderer htmlFor={textOutput.id} tone="dark">
          {textOutput.label}
        </LabelRenderer>
        <HandlerRenderer
          label={textOutput.label}
          id={textOutput.id}
          handleType="source"
          handlerDataType={textOutput.type}
          description={textOutput.description || "The LLM-generated text"}
          tone="yellow"
          position={Position.Right}
        />
      </div>

      {/* ── System Prompt ─────────────────────────────────────────────── */}
      <div className="relative flex px-3 gap-2 items-center h-7">
        <HandlerRenderer
          label={systemPromptIn.label}
          id={systemPromptIn.id}
          handleType="target"
          handlerDataType={systemPromptIn.type}
          description={systemPromptIn.description}
          tone="yellow"
          position={Position.Left}
        />
        <LabelRenderer htmlFor={systemPromptIn.id} tone="dark">
          {systemPromptIn.label}
        </LabelRenderer>
      </div>
      <div className="px-3 pb-1">
        <TextareaRenderer
          id={systemPromptIn.id}
          nodeId={props.id}
          tone="dark"
          initialValue={props.data[systemPromptIn.id]}
          placeholder="You are a helpful assistant…"
        />
      </div>

      {/* ── User Prompt ───────────────────────────────────────────────── */}
      <div className="relative flex px-3 gap-2 items-center h-7">
        <HandlerRenderer
          label={userPromptIn.label}
          id={userPromptIn.id}
          handleType="target"
          handlerDataType={userPromptIn.type}
          description={userPromptIn.description}
          tone="yellow"
          position={Position.Left}
        />
        <LabelRenderer htmlFor={userPromptIn.id} tone="dark">
          {userPromptIn.label}
        </LabelRenderer>
      </div>
      <div className="px-3 pb-1">
        <TextareaRenderer
          nodeId={props.id}
          id={userPromptIn.id}
          tone="dark"
          initialValue={props.data[userPromptIn.id]}
          placeholder="Enter the user prompt here…"
        />
      </div>

      {/* ── Model selector + Image handle ─────────────────────────────── */}
      <div className="relative flex px-3 items-center gap-3">
        <div className=" flex items-center gap-2">
          <HandlerRenderer
            label={imageIn.label}
            id={imageIn.id}
            handleType="target"
            handlerDataType={imageIn.type}
            description={imageIn.description}
            tone="blue"
            position={Position.Left}
          />
          <LabelRenderer htmlFor={imageIn.id} tone="dark">
            {imageIn.label}
          </LabelRenderer>
        </div>

        {modelControl && (
          <div className="flex items-center gap-2 ml-auto">
            <LabelRenderer htmlFor={modelControl.id} tone="dark">
              {modelControl.label}
            </LabelRenderer>
            <SelectorRenderer
              id={modelControl.id}
              nodeId={props.id}
              tone="dark"
              value={modelControl.defaultValue}
              options={modelControl.options}
            />
          </div>
        )}
      </div>

      {/* ── Inline output (shown after execution) ─────────────────────── */}
      {output && (
        <div className="nodrag nopan mx-3 mb-3 rounded-md border border-[var(--wf-border-subtle)] bg-[var(--wf-bg-input)] overflow-hidden max-w-[240px] overflow-y-scroll">
          <div className="flex items-center justify-between px-2 py-1 border-b border-[var(--wf-border-subtle)]">
            <span className="text-[9px] uppercase tracking-widest text-[var(--wf-text-muted)] font-semibold">
              Output
            </span>
            <CopyButton value={output} />
          </div>
          <div className="p-2 max-h-40 overflow-y-auto text-[11px] text-[var(--wf-text-secondary)] whitespace-pre-wrap leading-relaxed">
            {output}
          </div>
        </div>
      )}
    </BaseNode>
  );
}
