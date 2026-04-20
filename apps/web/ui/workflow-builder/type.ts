import { NodeDefinition, NodeRegistry } from "@nextflow/core";
import { CropImageNode, ExtractFrameNode, LLMNode, TextNode, UploadImageNode, UploadVideoNode } from "./nodes";
import { EdgeTypes, NodeTypes } from "reactflow";
import { CustomEdge } from "./canvas/edges/custom-edge";
import { EdgeTone } from "@/ui/tones/tones";

export const NODE_DEFINATIONS: Record<string, NodeDefinition> = {
    LLMNodeDefination: NodeRegistry['llm_node'],
    TextNodeDefination: NodeRegistry['text_node'],
    ImageCropNodeDefination: NodeRegistry['image_crop_node'],
    ExtractFrameNodeDefination: NodeRegistry['extract_frame_node'],
    UploadImageNodeDefination: NodeRegistry['upload_image_node'],
    UploadVideoNodeDefination: NodeRegistry['upload_video_node'],
}

export const NODE_TYPES: NodeTypes = {
    [NODE_DEFINATIONS.LLMNodeDefination.type]: LLMNode,
    [NODE_DEFINATIONS.TextNodeDefination.type]: TextNode,
    [NODE_DEFINATIONS.ImageCropNodeDefination.type]: CropImageNode,
    [NODE_DEFINATIONS.ExtractFrameNodeDefination.type]: ExtractFrameNode,
    [NODE_DEFINATIONS.UploadImageNodeDefination.type]: UploadImageNode,
    [NODE_DEFINATIONS.UploadVideoNodeDefination.type]: UploadVideoNode,
};

export const EDGE_TYPES: EdgeTypes = {
    // One flexible component — tone comes from edge.data.tone
    string: CustomEdge,
    image: CustomEdge,
    video: CustomEdge,
    number: CustomEdge,
    default: CustomEdge,
};

import { TONE_TO_DATA_TYPE } from "@/ui/workflow-builder/tokens/data-type-colors";

// Derived from DATA_TYPE_COLORS: type → tone (inverse of TONE_TO_DATA_TYPE).
// Do not add colors here — update tokens/data-type-colors.ts instead.
const DATA_TYPE_TO_TONE: Record<string, EdgeTone> = Object.fromEntries(
  Object.entries(TONE_TO_DATA_TYPE).map(([tone, dataType]) => [dataType, tone as EdgeTone])
) as Record<string, EdgeTone>;

export const HANDLER_TYPE_TO_TONE: Record<string, EdgeTone> = {
  string:  DATA_TYPE_TO_TONE["string"]  ?? "yellow",
  text:    DATA_TYPE_TO_TONE["string"]  ?? "yellow",
  image:   DATA_TYPE_TO_TONE["image"]   ?? "blue",
  video:   DATA_TYPE_TO_TONE["video"]   ?? "pink",
  number:  DATA_TYPE_TO_TONE["number"]  ?? "orange",
  boolean: DATA_TYPE_TO_TONE["boolean"] ?? "orange",
  any:     "zinc",
};