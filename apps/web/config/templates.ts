import type { Node, Edge } from "reactflow";

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  gradient: string;
  icon: string;
  nodes: Node[];
  edges: Edge[];
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: "product-marketing-kit",
    name: "Product Marketing Kit",
    description: "Generate product descriptions and social posts from image + video",
    gradient: "from-blue-950 to-violet-950",
    icon: "🎯",
    nodes: [
      { id: "n-upload-img", type: "upload_image_node", position: { x: 60, y: 160 }, data: { label: "Upload Image", status: "PENDING" } },
      { id: "n-crop", type: "image_crop_node", position: { x: 320, y: 160 }, data: { label: "Crop Image", x: 10, y: 10, width: 80, height: 80, status: "PENDING" } },
      { id: "n-sys1", type: "text_node", position: { x: 60, y: 380 }, data: { label: "System Prompt A", text: "You are a professional marketing copywriter. Generate a compelling one-paragraph product description.", status: "PENDING" } },
      { id: "n-details", type: "text_node", position: { x: 60, y: 540 }, data: { label: "Product Details", text: "Product: Wireless Bluetooth Headphones. Features: Noise cancellation, 30-hour battery, foldable design.", status: "PENDING" } },
      { id: "n-llm1", type: "llm_node", position: { x: 580, y: 220 }, data: { label: "Product Description", model: "gemini-2.5-flash", status: "PENDING" } },
      { id: "n-upload-vid", type: "upload_video_node", position: { x: 60, y: 760 }, data: { label: "Upload Video", status: "PENDING" } },
      { id: "n-frame", type: "extract_frame_node", position: { x: 320, y: 760 }, data: { label: "Extract Frame", timestamp: 0, status: "PENDING" } },
      { id: "n-sys2", type: "text_node", position: { x: 580, y: 700 }, data: { label: "System Prompt B", text: "You are a social media manager. Create a tweet-length marketing post (≤280 chars) based on the product image and video frame.", status: "PENDING" } },
      { id: "n-llm2", type: "llm_node", position: { x: 900, y: 460 }, data: { label: "Final Marketing Copy", model: "gemini-2.5-flash", status: "PENDING" } },
    ],
    edges: [
      { id: "e1", source: "n-upload-img", target: "n-crop", sourceHandle: "image_output", targetHandle: "image_input", type: "default", data: { tone: "blue" } },
      { id: "e2", source: "n-crop", target: "n-llm1", sourceHandle: "image_output", targetHandle: "image_input", type: "default", data: { tone: "blue" } },
      { id: "e3", source: "n-sys1", target: "n-llm1", sourceHandle: "text_output", targetHandle: "system_prompt", type: "default", data: { tone: "yellow" } },
      { id: "e4", source: "n-details", target: "n-llm1", sourceHandle: "text_output", targetHandle: "user_prompt", type: "default", data: { tone: "yellow" } },
      { id: "e5", source: "n-upload-vid", target: "n-frame", sourceHandle: "video_output", targetHandle: "video_input", type: "default", data: { tone: "pink" } },
      { id: "e6", source: "n-llm1", target: "n-llm2", sourceHandle: "text_output", targetHandle: "user_prompt", type: "default", data: { tone: "yellow" } },
      { id: "e7", source: "n-crop", target: "n-llm2", sourceHandle: "image_output", targetHandle: "image_input", type: "default", data: { tone: "blue" } },
      { id: "e8", source: "n-frame", target: "n-llm2", sourceHandle: "image_output", targetHandle: "image_input", type: "default", data: { tone: "blue" } },
      { id: "e9", source: "n-sys2", target: "n-llm2", sourceHandle: "text_output", targetHandle: "system_prompt", type: "default", data: { tone: "yellow" } },
    ],
  },
  {
    id: "image-analyzer",
    name: "Image Analyzer",
    description: "Upload an image and get a detailed AI description",
    gradient: "from-blue-950 to-cyan-950",
    icon: "🖼️",
    nodes: [
      { id: "n-upload", type: "upload_image_node", position: { x: 80, y: 200 }, data: { label: "Upload Image", status: "PENDING" } },
      { id: "n-prompt", type: "text_node", position: { x: 80, y: 380 }, data: { label: "Prompt", text: "Describe this image in detail. Include colors, objects, mood, and any text you see.", status: "PENDING" } },
      { id: "n-llm", type: "llm_node", position: { x: 380, y: 280 }, data: { label: "Image Analysis", model: "gemini-2.5-flash", status: "PENDING" } },
    ],
    edges: [
      { id: "e1", source: "n-upload", target: "n-llm", sourceHandle: "image_output", targetHandle: "image_input", type: "default", data: { tone: "blue" } },
      { id: "e2", source: "n-prompt", target: "n-llm", sourceHandle: "text_output", targetHandle: "user_prompt", type: "default", data: { tone: "yellow" } },
    ],
  },
  {
    id: "video-frame-captioner",
    name: "Video Frame Captioner",
    description: "Extract a frame from a video and generate a caption",
    gradient: "from-pink-950 to-rose-950",
    icon: "🎬",
    nodes: [
      { id: "n-video", type: "upload_video_node", position: { x: 80, y: 200 }, data: { label: "Upload Video", status: "PENDING" } },
      { id: "n-frame", type: "extract_frame_node", position: { x: 340, y: 200 }, data: { label: "Extract Frame", timestamp: 5, status: "PENDING" } },
      { id: "n-sys", type: "text_node", position: { x: 80, y: 400 }, data: { label: "System Prompt", text: "You are a professional video captioner. Write a concise, engaging caption for this frame.", status: "PENDING" } },
      { id: "n-llm", type: "llm_node", position: { x: 620, y: 280 }, data: { label: "Caption Generator", model: "gemini-2.5-flash", status: "PENDING" } },
    ],
    edges: [
      { id: "e1", source: "n-video", target: "n-frame", sourceHandle: "video_output", targetHandle: "video_input", type: "default", data: { tone: "pink" } },
      { id: "e2", source: "n-frame", target: "n-llm", sourceHandle: "image_output", targetHandle: "image_input", type: "default", data: { tone: "blue" } },
      { id: "e3", source: "n-sys", target: "n-llm", sourceHandle: "text_output", targetHandle: "system_prompt", type: "default", data: { tone: "yellow" } },
    ],
  },
  {
    id: "image-crop-and-describe",
    name: "Crop & Describe",
    description: "Crop a region of an image and get an AI description of that area",
    gradient: "from-emerald-950 to-teal-950",
    icon: "✂️",
    nodes: [
      { id: "n-upload", type: "upload_image_node", position: { x: 80, y: 200 }, data: { label: "Upload Image", status: "PENDING" } },
      { id: "n-crop", type: "image_crop_node", position: { x: 340, y: 200 }, data: { label: "Crop Region", x: 20, y: 20, width: 60, height: 60, status: "PENDING" } },
      { id: "n-prompt", type: "text_node", position: { x: 80, y: 400 }, data: { label: "Prompt", text: "What is shown in this cropped region? Be specific and detailed.", status: "PENDING" } },
      { id: "n-llm", type: "llm_node", position: { x: 620, y: 280 }, data: { label: "Region Analyzer", model: "gemini-2.5-flash", status: "PENDING" } },
    ],
    edges: [
      { id: "e1", source: "n-upload", target: "n-crop", sourceHandle: "image_output", targetHandle: "image_input", type: "default", data: { tone: "blue" } },
      { id: "e2", source: "n-crop", target: "n-llm", sourceHandle: "image_output", targetHandle: "image_input", type: "default", data: { tone: "blue" } },
      { id: "e3", source: "n-prompt", target: "n-llm", sourceHandle: "text_output", targetHandle: "user_prompt", type: "default", data: { tone: "yellow" } },
    ],
  },
  {
    id: "text-transformer",
    name: "Text Transformer",
    description: "Transform text with a custom AI prompt and system instruction",
    gradient: "from-amber-950 to-orange-950",
    icon: "✍️",
    nodes: [
      { id: "n-sys", type: "text_node", position: { x: 80, y: 160 }, data: { label: "System Prompt", text: "You are an expert editor. Rewrite the provided text to be more concise and professional.", status: "PENDING" } },
      { id: "n-input", type: "text_node", position: { x: 80, y: 340 }, data: { label: "Input Text", text: "Paste your text here that you want to transform...", status: "PENDING" } },
      { id: "n-llm", type: "llm_node", position: { x: 400, y: 240 }, data: { label: "Text Transformer", model: "gemini-2.5-flash", status: "PENDING" } },
    ],
    edges: [
      { id: "e1", source: "n-sys", target: "n-llm", sourceHandle: "text_output", targetHandle: "system_prompt", type: "default", data: { tone: "yellow" } },
      { id: "e2", source: "n-input", target: "n-llm", sourceHandle: "text_output", targetHandle: "user_prompt", type: "default", data: { tone: "yellow" } },
    ],
  },
];
