import { NodeDefinitionSchema, NodeDefinition } from '../schema/node';

export const ImageCropDefinition: NodeDefinition = NodeDefinitionSchema.parse({
  type: 'image_crop',
  title: 'Crop Image',
  category: 'Transform',
  description: 'Crops an image based on percentage coordinates and dimensions',
  inputs: [
    { id: 'image_input', label: 'Image Input', type: 'image', required: true }
  ],
  outputs: [
    { id: 'image_output', label: 'Cropped Output', type: 'image', required: true }
  ],
  controls: [
    { type: 'number', id: 'x', label: 'X Coordinate (%)', defaultValue: 0, placeholder: '0' },
    { type: 'number', id: 'y', label: 'Y Coordinate (%)', defaultValue: 0, placeholder: '0' },
    { type: 'number', id: 'width', label: 'Width (%)', defaultValue: 100, placeholder: '100' },
    { type: 'number', id: 'height', label: 'Height (%)', defaultValue: 100, placeholder: '100' }
  ]
});