import { z } from "zod";
import type { NodeType, DataType, ControlType, PreviewType } from "../types";

export interface NodeInput {
  id: string;
  label: string;
  dataType: DataType;
  hasHandle: boolean;
  acceptsMultiple?: boolean; // Required for the LLM Node images!
  control: ControlType;
  options?: string[]; 
  defaultValue?: any;
  required?: boolean; // Helps frontend know if it should show a red asterisk
}

export interface NodeOutput {
  id: string;
  label: string;
  dataType: DataType;
}

export interface CoreNodeDefinition{
  type: NodeType;
  label: string;
  description: string;
  configSchema: z.ZodObject<any>;
  inputs: NodeInput[];
  outputs: NodeOutput[];
  previewType: PreviewType;
  triggerTaskName?: string;
}