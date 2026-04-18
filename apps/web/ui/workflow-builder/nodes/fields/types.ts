import { Position } from "reactflow";

// ---------------------------------------------------------------------------
// Handle types
// ---------------------------------------------------------------------------

export interface FieldHandleProps {
  id: string;
  /** Text beside the handle; omit, `null`, or `""` to hide. */
  label?: string | null;
  type: "target" | "source";
  position: Position;
}

/**
 * - `inline`  : field label + control on one row; handles sit left/right of the control.
 * - `stacked` : one row for handles (inputs left, outputs right), then the field below.
 */
export type FieldHandleLayout = "inline" | "stacked";

// ---------------------------------------------------------------------------
// Field types
// ---------------------------------------------------------------------------

export type RendererType = "text" | "textarea" | "handler" | "preview" | "options";
export type FieldType = RendererType;

// ---------------------------------------------------------------------------
// BaseField props
// ---------------------------------------------------------------------------

export interface BaseFieldProps {
  id?: string;
  type?: FieldType;
  label?: string;
  description?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  style?: React.CSSProperties;
  className?: string;
  acceptsMultiple?: boolean;
  maxLimit?: number;
  /** @default "inline" */
  handleLayout?: FieldHandleLayout;
  inputHandles?: FieldHandleProps[];
  outputHandles?: FieldHandleProps[];
  children?: React.ReactNode;
}
