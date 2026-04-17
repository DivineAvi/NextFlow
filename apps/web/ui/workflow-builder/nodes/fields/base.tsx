import { UUID } from "crypto";
import { stringify } from "querystring";
import { Position } from "reactflow";
import { v4 as uuidv4 } from 'uuid';

export interface FieldHandleProps {
    id: string;
    /** Text beside the handle; omit, `null`, or `""` to hide. */
    label?: string | null;
    type: "target" | "source";
    position: Position;
}

/**
 * - `inline`: field label + control on one row; handles (and their labels) sit left/right of the control.
 * - `stacked`: one row for all handles (inputs left, outputs right), then the field row below (`flex-col`).
 */
export type FieldHandleLayout = "inline" | "stacked";
export type RendererType = "text" | "textarea" | "handler" | "preview" | "options";
export type FieldType = RendererType;
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

export default function BaseField({ id, type, children }: BaseFieldProps) {
    const resolvedId = id ?? `${String(type ?? "field")}-${Math.random().toString(36).slice(2, 10)}`;
    return <div id={resolvedId}>{children}</div>;
}

