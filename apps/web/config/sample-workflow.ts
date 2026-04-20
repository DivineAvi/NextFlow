import type { Node, Edge } from "reactflow";

/**
 * Product Marketing Kit Generator — the required sample workflow.
 *
 * Topology:
 *
 *  [Upload Image] ──────────────► [Crop Image] ──► [LLM #1] ──────────────┐
 *  [Text: SysPrompt 1] ──────────────────────────► [LLM #1]               │
 *  [Text: Product Details] ──────────────────────► [LLM #1]               ▼
 *                                                              [Text: SysPrompt 2] ► [LLM #2 (Final)]
 *  [Upload Video] ──► [Extract Frame] ────────────────────────────────────►[LLM #2]
 *                                       (cropped image also feeds LLM #2)
 *
 * Branch A (left)  and Branch B (right) execute in parallel.
 * LLM #2 waits for both branches to complete before running.
 */

export function createSampleWorkflow(): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [
    // ── Branch A ──────────────────────────────────────────────────────
    {
      id: "node-upload-image",
      type: "upload_image_node",
      position: { x: 60, y: 160 },
      data: { label: "Upload Image", status: "PENDING" },
    },
    {
      id: "node-crop",
      type: "image_crop_node",
      position: { x: 320, y: 160 },
      data: { label: "Crop Image", x: 10, y: 10, width: 80, height: 80, status: "PENDING" },
    },
    {
      id: "node-sys-prompt-1",
      type: "text_node",
      position: { x: 60, y: 380 },
      data: {
        label: "System Prompt A",
        text: "You are a professional marketing copywriter. Generate a compelling one-paragraph product description.",
        status: "PENDING",
      },
    },
    {
      id: "node-product-details",
      type: "text_node",
      position: { x: 60, y: 540 },
      data: {
        label: "Product Details",
        text: "Product: Wireless Bluetooth Headphones. Features: Noise cancellation, 30-hour battery, foldable design. Target audience: remote workers and audiophiles.",
        status: "PENDING",
      },
    },
    {
      id: "node-llm-1",
      type: "llm_node",
      position: { x: 580, y: 220 },
      data: { label: "Product Description LLM", model: "gemini-2.5-flash", status: "PENDING" },
    },

    // ── Branch B ──────────────────────────────────────────────────────
    {
      id: "node-upload-video",
      type: "upload_video_node",
      position: { x: 60, y: 760 },
      data: { label: "Upload Video", status: "PENDING" },
    },
    {
      id: "node-extract-frame",
      type: "extract_frame_node",
      position: { x: 320, y: 760 },
      data: { label: "Extract Frame", timestamp: 0, status: "PENDING" },
    },

    // ── Convergence ────────────────────────────────────────────────────
    {
      id: "node-sys-prompt-2",
      type: "text_node",
      position: { x: 580, y: 700 },
      data: {
        label: "System Prompt B",
        text: "You are a social media manager. Create a tweet-length marketing post (≤280 chars) based on the product image and video frame provided.",
        status: "PENDING",
      },
    },
    {
      id: "node-llm-2",
      type: "llm_node",
      position: { x: 900, y: 460 },
      data: { label: "Final Marketing LLM", model: "gemini-2.5-flash", status: "PENDING" },
    },
  ];

  const edges: Edge[] = [
    // Branch A connections
    {
      id: "e-upload-image-crop",
      source: "node-upload-image",
      target: "node-crop",
      sourceHandle: "image_output",
      targetHandle: "image_input",
      type: "default",
      data: { tone: "blue" },
    },
    {
      id: "e-crop-llm1",
      source: "node-crop",
      target: "node-llm-1",
      sourceHandle: "image_output",
      targetHandle: "image_input",
      type: "default",
      data: { tone: "blue" },
    },
    {
      id: "e-sys1-llm1",
      source: "node-sys-prompt-1",
      target: "node-llm-1",
      sourceHandle: "text_output",
      targetHandle: "system_prompt",
      type: "default",
      data: { tone: "yellow" },
    },
    {
      id: "e-details-llm1",
      source: "node-product-details",
      target: "node-llm-1",
      sourceHandle: "text_output",
      targetHandle: "user_prompt",
      type: "default",
      data: { tone: "yellow" },
    },

    // Branch B connections
    {
      id: "e-upload-video-extract",
      source: "node-upload-video",
      target: "node-extract-frame",
      sourceHandle: "video_output",
      targetHandle: "video_input",
      type: "default",
      data: { tone: "pink" },
    },

    // Convergence connections
    {
      id: "e-llm1-llm2",
      source: "node-llm-1",
      target: "node-llm-2",
      sourceHandle: "text_output",
      targetHandle: "user_prompt",
      type: "default",
      data: { tone: "yellow" },
    },
    {
      id: "e-crop-llm2",
      source: "node-crop",
      target: "node-llm-2",
      sourceHandle: "image_output",
      targetHandle: "image_input",
      type: "default",
      data: { tone: "blue" },
    },
    {
      id: "e-frame-llm2",
      source: "node-extract-frame",
      target: "node-llm-2",
      sourceHandle: "image_output",
      targetHandle: "image_input",
      type: "default",
      data: { tone: "blue" },
    },
    {
      id: "e-sys2-llm2",
      source: "node-sys-prompt-2",
      target: "node-llm-2",
      sourceHandle: "text_output",
      targetHandle: "system_prompt",
      type: "default",
      data: { tone: "yellow" },
    },
  ];

  return { nodes, edges };
}
