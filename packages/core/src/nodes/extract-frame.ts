import { NodeDefinitionSchema, NodeDefinition } from '../schema/node';

export const ExtractFrameDefinition: NodeDefinition = NodeDefinitionSchema.parse({
  type: 'extract_frame',
  title: 'Extract Frame',
  category: 'Transform',
  description: 'Extracts a single image frame from a video at a specific timestamp',
  inputs: [
    { id: 'video_input', label: 'Video Input', type: 'video', required: true }
  ],
  outputs: [
    { id: 'image_output', label: 'Extracted Frame', type: 'image', required: true }
  ],
  controls: [
    { 
      type: 'number', 
      id: 'timestamp', 
      label: 'Timestamp (seconds)', 
      defaultValue: 0, 
      placeholder: '0.0' 
    }
  ]
});