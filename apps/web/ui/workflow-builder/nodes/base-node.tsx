import { NodeProps } from 'reactflow';
import { LucideIcon, Sparkles } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@nextflow/ui';
import { useState } from 'react';

interface StyleProps {
  borderColor?: string;
  selectedBorderColor?: string;
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: string;
  borderWidth?: string;
}

interface BaseNodeProps extends NodeProps, StyleProps {
  children?: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
  style?: React.CSSProperties;
  minWidth?: string;
  minHeight?: string;

}

export function BaseNode({
  data,
  type,
  children,
  selected,
  icon,
  minWidth = 'min-w-[180px]',
  minHeight = 'min-h-[100px]',
  borderColor = 'border-zinc-800',
  selectedBorderColor = 'border-blue-500',
  backgroundColor = 'bg-[#262626]',
  textColor = 'text-[#737373]',
  borderRadius = 'rounded-[12px]',
  borderWidth = 'border-2',
}: BaseNodeProps) {
  const Icon = icon || Sparkles;

  const [label, setLabel] = useState(data.label);
  return (
    <div className={`flex flex-col ${minWidth} ${minHeight}`}>
      {/* 1. Header Area */}

      <div className="flex items-center gap-1 px-1/2 w-fit h-5">
        <Icon size={16} />
        <div className="relative h-full">
          <input value={label} onChange={(e) => setLabel(e.target.value)} className={`nodrag nopan absolute z-10 left-0 top-1/2 -translate-y-1/2 outline-none text-xs ${textColor} px-1 py-0.5 rounded-md cursor-text tracking-tight `} />
          {/* <span className="absolute z-9 left-0 top-1/2 -translate-y-1/2 text-xs text-transparent tracking-tight hover:bg-black/50 px-1 py-0.5 rounded-md cursor-text whitespace-nowrap">{label}</span> */}
        </div>
      </div>

      <div
        className={`
      ${borderRadius} ${borderWidth} ${backgroundColor} ${textColor} w-full h-full flex-1 transition-all duration-300
      ${selected ? selectedBorderColor : borderColor}
      `}
      >

        {/* Content Area along with the handles */}
        <div className="flex flex-col flex-1 w-full h-full pb-4">
          {children}
        </div>

      </div>
    </div>
  );
}