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
