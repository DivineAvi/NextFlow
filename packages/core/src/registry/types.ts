export type NodeType = 
  | "text_node" 
  | "upload_image" 
  | "upload_video" 
  | "llm_node" 
  | "crop_image" 
  | "extract_frame";

export type DataType = "string" | "image_url" | "video_url" | "any";

export type ExecutionStatus = "idle" | "running" | "success" | "error";

export type ControlType = "text" | "textarea" | "number" | "slider" | "select" | "file" | "none";

export type PreviewType = "text" | "image" | "video" | "none";