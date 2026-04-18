import React, { useState } from "react";

export type PreviewType = "image" | "video" | "audio" | "text" | "other";

export interface PreviewRendererProps {
  id: string;
  sourceId: string;
  value: string;
  urls: string[];
  type: PreviewType;
}

export default function PreviewRenderer({ id, value, urls, type }: PreviewRendererProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!urls || urls.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-64 bg-gray-100 text-gray-500 rounded-lg">
        No media available
      </div>
    );
  }

  const hasMultiple = urls.length > 1;

  const handlePrev = () =>
    setCurrentIndex((prev) => (prev === 0 ? urls.length - 1 : prev - 1));
  const handleNext = () =>
    setCurrentIndex((prev) => (prev === urls.length - 1 ? 0 : prev + 1));

  function renderMedia(url: string) {
    switch (type) {
      case "image":
        return <img src={url} alt={`Preview ${id}`} className="w-full h-full object-cover" />;
      case "video":
        return <video src={url} controls className="w-full h-full bg-black object-contain" />;
      case "audio":
        return (
          <div className="flex items-center justify-center w-full h-full bg-gray-900 p-8">
            <audio src={url} controls className="w-full max-w-md" />
          </div>
        );
      case "text":
      case "other":
      default:
        return (
          <div className="flex items-center justify-center w-full h-full bg-gray-800 text-white p-6">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 hover:text-blue-400 transition-colors"
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <span>View File: {value || "Document"}</span>
            </a>
          </div>
        );
    }
  }

  return (
    <div className="relative w-full h-full min-h-[400px] bg-black rounded-lg overflow-hidden shadow-lg group">
      {/* Top Navigation Overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent z-10 text-white transition-opacity duration-300">
        <div className="flex items-center space-x-3 text-lg font-medium">
          {hasMultiple ? (
            <>
              <button onClick={handlePrev} className="p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer" aria-label="Previous media">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              <span className="min-w-[3rem] text-center">{currentIndex + 1} / {urls.length}</span>
              <button onClick={handleNext} className="p-1.5 hover:bg-white/20 rounded-full transition-colors cursor-pointer" aria-label="Next media">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            </>
          ) : (
            <span className="pl-2">1 / 1</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <a href={urls[currentIndex]} download className="p-2 hover:bg-white/20 rounded-full transition-colors" title="Download">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
          </a>
          <button className="p-2 hover:bg-white/20 rounded-full transition-colors" title="Expand">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6" /><path d="M9 21H3v-6" /><path d="M21 3l-7 7" /><path d="M3 21l7-7" /></svg>
          </button>
        </div>
      </div>
      <div className="w-full h-full flex items-center justify-center">
        {renderMedia(urls[currentIndex])}
      </div>
    </div>
  );
}
