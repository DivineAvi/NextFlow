import { NodeDefinitionSchema, NodeDefinition } from '../schema/node';

export const TextInputNodeDefinition: NodeDefinition = NodeDefinitionSchema.parse({
  type: 'text_node',
  title: 'Text',
  category: 'Input',
  description: 'Provides a static string block to the workflow',
  inputs: [], // Source node: no inputs!
  outputs: [
    { id: 'text_output', label: 'Text output', type: 'string', required: true },
  ],
  controls: [
    {
      type: 'text',
      id: 'text', // This exact ID maps to `props.data.text` in React Flow
      label: 'Text Content',
      defaultValue: '',
      placeholder: 'Enter text',
    }
  ]
});