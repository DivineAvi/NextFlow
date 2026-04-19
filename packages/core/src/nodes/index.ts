import { ExtractFrameDefinition } from './extract-frame';
import { ImageCropDefinition } from './image-crop';
import { LLMGenerateDefinition } from './llm';
import { TextInputDefinition } from './text';
import { UploadImageDefinition } from './upload-image';
import { UploadVideoDefinition } from './upload-video';
// The Master Dictionary
export const NodeRegistry = {
  llm_generate: LLMGenerateDefinition,
  text_input: TextInputDefinition,
  image_crop: ImageCropDefinition,
  extract_frame: ExtractFrameDefinition,
  upload_image: UploadImageDefinition,
  upload_video: UploadVideoDefinition,
  // Add new nodes here as you build them
} as const;

// Create a type for strictly validating node types in your application
export type RegistryNodeType = keyof typeof NodeRegistry;

// Export an array version for easily mapping over them in UI Sidebars
export const AvailableNodesList = Object.values(NodeRegistry);