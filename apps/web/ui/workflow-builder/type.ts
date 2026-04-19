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

// Map from Registry output type → edge tone so connected edges pick the right color.
export const HANDLER_TYPE_TO_TONE: Record<string, EdgeTone> = {
    string: "yellow",
    text: "yellow",
    image: "blue",
    video: "pink",
    number: "orange",
    boolean: "orange",
    any: "yellow"
};