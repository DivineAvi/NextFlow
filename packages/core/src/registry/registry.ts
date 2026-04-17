import { textNodeDefinition } from "./nodes/text";
import { uploadImageNodeDefinition } from "./nodes/upload-image";
import { uploadVideoNodeDefinition } from "./nodes/upload-video";
import { llmNodeDefinition } from "./nodes/llm";
import { cropImageNodeDefinition } from "./nodes/crop-image";
import { extractFrameNodeDefinition } from "./nodes/extract-frame";
import { NodeType } from "./types";
import { CoreNodeDefinition} from "./nodes/base";

// 1. We remove the explicit Type declaration on the variable...
export const NODES_REGISTRY = {
  text_node: textNodeDefinition,
  upload_image: uploadImageNodeDefinition,
  upload_video: uploadVideoNodeDefinition,
  llm_node: llmNodeDefinition,
  crop_image: cropImageNodeDefinition,
  extract_frame: extractFrameNodeDefinition,
} satisfies Record<NodeType,CoreNodeDefinition>; 


