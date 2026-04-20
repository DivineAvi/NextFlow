import { NodeDefinitionSchema, type NodeDefinition } from "../schema/node";

export const LLMNodeDefinition: NodeDefinition = NodeDefinitionSchema.parse({
  type: 'llm_node',
  title: 'LLM',
  category: 'AI',
  description: 'Generates text using a Google Gemini language model',
  inputs: [
    { id: 'system_prompt', label: 'System Prompt', type: 'string', acceptsMultiple: false, required: false, description: 'Optional system instructions for the model' },
    { id: 'user_prompt',   label: 'User Prompt',   type: 'string', acceptsMultiple: false, required: true,  description: 'The user message to send to the model' },
    { id: 'image_input',   label: 'Image',          type: 'image',  acceptsMultiple: true,  required: false, description: 'Optional image(s) for multimodal generation' },
  ],
  outputs: [
    { id: 'text_output', label: 'Output', type: 'string', required: true, description: 'The LLM-generated text response' },
  ],
  controls: [
    {
      type: 'select',
      id: 'model',
      label: 'Model',
      defaultValue: 'gemini-2.5-flash',
      options: [
        { label: 'Gemini 2.5 Flash',   value: 'gemini-2.5-flash' },
        { label: 'Gemini 3 Flash Preview', value: 'gemini-3-flash-preview' },
        { label: 'Gemini 2.5 Pro', value: 'gemini-2.5-pro' },
        { label: 'Gemini 3.1 Flash Lite Preview', value: 'gemini-3.1-flash-lite-preview' },
        { label: 'Gemini 2.5 Flash Lite', value: 'gemini-2.5-flash-lite' },
        { label: 'Gemini 2.0 Flash', value: 'gemini-2.0-flash' },
        { label: 'Gemini 2.0 Flash Lite', value: 'gemini-2.0-flash-lite' },
      ],
    },
    {
      type: "text",
      id: "user_prompt",
      label: "User Prompt",
      defaultValue: "",
      placeholder: "Enter user prompt",
    },
    {
      type: "text",
      id: "system_prompt",
      label: "System Prompt",
      defaultValue: "",
      placeholder: "Enter system prompt",
    }
    
  ],
});
