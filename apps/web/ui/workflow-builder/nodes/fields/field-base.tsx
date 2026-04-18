import { useId } from "react";
import type { BaseFieldProps } from "./types";

export type { BaseFieldProps };
export type { FieldHandleProps, FieldHandleLayout, RendererType, FieldType } from "./types";

/**
 * Primitive wrapper that gives every node field a stable, unique DOM id.
 *
 * - Callers may pass an explicit `id` (e.g. to bind a label's `htmlFor`).
 * - When omitted, `useId()` guarantees a server-safe, stable identifier.
 */
export default function FieldBase({
  id,
  type,
  children,
}: Pick<BaseFieldProps, "id" | "type" | "children">) {
  const autoId = useId();
  const resolvedId = id ?? `${String(type ?? "field")}-${autoId}`;
  return <div id={resolvedId}>{children}</div>;
}
