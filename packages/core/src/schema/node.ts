import { z } from 'zod';
import { ControlDefinitionSchema } from './controls';

// 1. Define allowed data types flowing through the wires
export const DataTypeSchema = z.enum(['string', 'image','video', 'number', 'boolean', 'any']);

// 2. Define the exact shape of a Port (Handle)
export const PortDefinitionSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: DataTypeSchema,
  acceptsMultiple: z.boolean().default(false),
  required: z.boolean().default(false),
  description: z.string().optional(),
});

// 3. Define the Blueprint of a Node
export const NodeDefinitionSchema = z.object({
  type: z.string(), // e.g., 'llm_generate'
  title: z.string(),
  category: z.enum(['AI', 'Logic', 'Input', 'Output', 'Transform']),
  description: z.string(),
  inputs: z.array(PortDefinitionSchema),
  outputs: z.array(PortDefinitionSchema),
  controls: z.array(ControlDefinitionSchema).optional().default([]),
});

// Export the type specifically for your frontend to consume

// 4. Extract TypeScript Types automatically!
export type DataType = z.infer<typeof DataTypeSchema>;
export type PortDefinition = z.infer<typeof PortDefinitionSchema>;
export type NodeDefinition = z.infer<typeof NodeDefinitionSchema>;