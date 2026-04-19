import { ExtractFrameNodeDefinition } from './extract-frame';
import { ImageCropNodeDefinition } from './image-crop';
import { LLMNodeDefinition } from './llm';
import { TextInputNodeDefinition } from './text';
import { UploadImageNodeDefinition } from './upload-image';
import { UploadVideoNodeDefinition } from './upload-video';
// The Master Dictionary
export const NodeRegistry = {
  llm_node: LLMNodeDefinition,
  text_node: TextInputNodeDefinition,
  image_crop_node: ImageCropNodeDefinition,
  extract_frame_node: ExtractFrameNodeDefinition,
  upload_image_node: UploadImageNodeDefinition,
  upload_video_node: UploadVideoNodeDefinition,
  // Add new nodes here as you build them
} as const;

// Create a type for strictly validating node types in your application
export type RegistryNodeType = keyof typeof NodeRegistry;

// Export an array version for easily mapping over them in UI Sidebars
export const AvailableNodesList = Object.values(NodeRegistry);