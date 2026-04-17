import { useState, useEffect } from "react";

const MIN_WIDTH = 110;
const MAX_WIDTH = 300;
const COLLAPSED_WIDTH = 52;
const SNAP_THRESHOLD = 30;

export function useSidebarResize(defaultWidth = 260) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      let newWidth = e.clientX;

      if (newWidth < SNAP_THRESHOLD) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
        if (newWidth > MAX_WIDTH) newWidth = MAX_WIDTH;
        if (newWidth < MIN_WIDTH) newWidth = MIN_WIDTH;
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "default";
      document.body.style.userSelect = "auto";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const currentWidth = isCollapsed ? COLLAPSED_WIDTH : width;

  return {
    currentWidth,
    isCollapsed,
    isResizing,
    startResizing,
    toggleCollapse,
  };
}