import { NodeDefinitionSchema, NodeDefinition } from '../schema/node'; // Adjust path if needed

export const UploadVideoDefinition: NodeDefinition = NodeDefinitionSchema.parse({
  type: 'upload_video',
  title: 'Upload Video',
  category: 'Input',
  description: 'Uploads a local video file and provides it to the workflow',
  inputs: [],
  outputs: [
    // Change 'image_url' to 'image' here to match your Zod enum!
    { id: 'video_output', label: 'Video Output', type: 'video', required: true } 
  ],
  controls: [
    {
      type: 'file_upload',
      id: 'video_file',
      label: 'Video',
      fileType: 'video',
      placeholder: 'Add Video'
    }
  ]
});