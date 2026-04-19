import { z } from "zod";
// 1. Define the possible UI Controls
export const SelectControlSchema = z.object({
  type: z.literal('select'),
  id: z.string(),
  label: z.string(),
  options: z.array(z.object({ label: z.string(), value: z.string() })),
  defaultValue: z.string(),
});

export const TextControlSchema = z.object({
  type: z.literal('text'),
  id: z.string(),
  label: z.string(),
  defaultValue: z.string(),
  placeholder: z.string(),
});

// 1. Define the Number Control
export const NumberControlSchema = z.object({
  type: z.literal('number'),
  id: z.string(),
  label: z.string(),
  defaultValue: z.number(),
  placeholder: z.string().optional(),
});

export const FileUploadControlSchema = z.object({
  type: z.literal('file_upload'),
  id: z.string(),
  label: z.string(),
  // Strict file typing ensures users can't upload a PDF into an Image node
  fileType: z.enum(['image', 'video', 'document', 'any']).default('any'), 
  placeholder: z.string().optional(),
});

// 2. Add it to the Union
export const ControlDefinitionSchema = z.discriminatedUnion('type', [
  SelectControlSchema,
  TextControlSchema,
  NumberControlSchema,
  FileUploadControlSchema, // <-- Add it here!
]);

// 3. Export the explicit type
export type FileUploadControlDef = z.infer<typeof FileUploadControlSchema>;
export type NumberControlDef = z.infer<typeof NumberControlSchema>;
export type TextControlDef = z.infer<typeof TextControlSchema>;
export type SelectControlDef = z.infer<typeof SelectControlSchema>;