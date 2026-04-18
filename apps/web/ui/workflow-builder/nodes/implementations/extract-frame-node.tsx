import type { NodeProps } from "reactflow";
import { Position } from "reactflow";
import { BaseNode } from "../base-node";
import HandlerRenderer from "../fields/renderers/handler-renderer";
import LabelRenderer from "../fields/renderers/label-renderer";
import TextFieldRenderer from "../fields/renderers/textfield-renderer";
import CopyButton from "../fields/renderers/copy-button";

export function ExtractFrameNode(props: NodeProps) {
  return (
    <BaseNode {...props} Width="220px" Height="100px" tone="yellow">
      {/* Top handles row: Input & Output */}
      <div className="relative flex px-4 h-7 w-full items-center justify-between">
        <div className="flex items-center h-full gap-2">
          <HandlerRenderer
            label="Video Input"
            id="video-input"
            handleType="target"
            handlerDataType="string"
            description="Video to extract frame from"
            tone="pink"
            position={Position.Left}
          />
          <LabelRenderer htmlFor="video-input" tone="dark">Video</LabelRenderer>
        </div>
        <div className="flex items-center h-full">
          <LabelRenderer htmlFor="image-output" tone="dark">Frame</LabelRenderer>
          <HandlerRenderer
            label="Extracted Frame Output"
            id="image-output"
            handleType="source"
            handlerDataType="string"
            description="The extracted frame image"
            tone="blue"
            position={Position.Right}
          />
        </div>
      </div>

      {/* Config fields with timestamp input handle */}
      <div className="flex flex-col px-3 gap-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1 w-full">
            <LabelRenderer htmlFor="timestamp" tone="dark">Timestamp (seconds)</LabelRenderer>
            <TextFieldRenderer
              id="timestamp"
              tone="dark"
              initialValue={props.data?.timestamp ?? "0.0"}
              placeholder="0.0"
            />
          </div>
        </div>
      </div>

    </BaseNode>
  );
}
