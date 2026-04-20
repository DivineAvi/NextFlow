import { useState, useEffect, useRef, useCallback } from "react";

const MIN_WIDTH = 110;
const MAX_WIDTH = 300;
const COLLAPSED_WIDTH = 52;
const SNAP_THRESHOLD = 30;

interface SidebarResizeState {
  currentWidth: number;
  isCollapsed: boolean;
  isResizing: boolean;
  startResizing: (e: React.MouseEvent) => void;
  toggleCollapse: () => void;
}

export function useSidebarResize(defaultWidth = 300): SidebarResizeState {
  const [isCollapsed, setIsCollapsed] = useState(() => window?.innerWidth >= 768);
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);

  // Track pending animation frame to avoid stacking updates per pixel.
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        let newWidth = e.clientX;

        if (newWidth < SNAP_THRESHOLD) {
          setIsCollapsed(true);
        } else {
          setIsCollapsed(false);
          newWidth = Math.min(Math.max(newWidth, MIN_WIDTH), MAX_WIDTH);
          setWidth(newWidth);
        }
      });
    };

    const handleMouseUp = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      setIsResizing(false);
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isResizing]);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  const toggleCollapse = useCallback(() => setIsCollapsed((c) => !c), []);

  return {
    currentWidth: isCollapsed ? COLLAPSED_WIDTH : width,
    isCollapsed,
    isResizing,
    startResizing,
    toggleCollapse,
  };
}
