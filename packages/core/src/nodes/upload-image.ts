import { NodeDefinitionSchema, NodeDefinition } from '../schema/node'; // Adjust path if needed

export const UploadImageNodeDefinition: NodeDefinition = NodeDefinitionSchema.parse({
  type: 'upload_image_node',
  title: 'Image',
  category: 'Input',
  description: 'Uploads a local image file and provides it to the workflow',
  inputs: [],
  outputs: [
    // Change 'image_url' to 'image' here to match your Zod enum!
    { id: 'image_output', label: 'Image Output', type: 'image', required: true } 
  ],
  controls: [
    {
      type: 'file_upload',
      id: 'image_file',
      label: 'Image',
      fileType: 'image',
      placeholder: 'Add Image'
    }
  ]
});