"use client";

import { useState } from "react";
import { Search } from "lucide-react";

interface Props {
  onSearch: (q: string) => void;
}

export function WorkflowSearch({ onSearch }: Props) {
  const [value, setValue] = useState("");

  return (
    <div className="relative">
      <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
      <input
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onSearch(e.target.value);
        }}
        placeholder="Search workflows..."
        className="h-8 w-20 sm:w-52 rounded-lg bg-zinc-900 border border-zinc-800 pl-8 pr-3 text-xs text-zinc-300 placeholder:text-zinc-600 outline-none focus:border-zinc-600 transition-colors"
   
      />
    </div>
  );
}
