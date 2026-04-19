import { NodeDefinitionSchema, type NodeDefinition } from "../schema/node";

// We use .parse() to ensure this definition strictly adheres to our schema
export const LLMNodeDefinition: NodeDefinition = NodeDefinitionSchema.parse({
  type: 'llm_node',
  title: 'LLM',
  category: 'AI',
  description: 'Generates text using a language model',
  inputs: [
    { id: 'system_prompt', label: 'System Prompt', type: 'string', acceptsMultiple: false, required: true },
    { id: 'user_prompt', label: 'User Prompt', type: 'string', acceptsMultiple: false, required: true },
    { id: 'image_input', label: 'Image', type: 'image', acceptsMultiple: true, required: false },
  ],
  outputs: [
    { id: 'text_output', label: 'Output', type: 'string', required: true },
  ],
  controls: [
    {
      type: 'select',
      id: 'model',
      label: 'Model',
      defaultValue: 'gpt-4o',
      options: [
        { label: 'GPT-4o (OpenAI)', value: 'gpt-4o' },
        { label: 'Claude 3.5 Sonnet', value: 'claude-3-5-sonnet' },
        { label: 'Llama 3 (Meta)', value: 'llama-3' }
      ]
    }
  ]
});