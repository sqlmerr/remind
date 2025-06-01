"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import type { Block, BlockContent, ImageContent } from "@/lib/api/types/block";
import { ImageIcon } from "lucide-react";
import { useBlockUpdate } from "@/hooks/use-block-update";

interface ImageBlockProps {
  block: Block;
  onUpdate: (content: BlockContent) => void;
  onFocus?: (element: HTMLElement) => void;
  isMobile?: boolean;
}

export function ImageBlock({
  block,
  onUpdate,
  onFocus,
  isMobile = false,
}: ImageBlockProps) {
  const content = block.content as ImageContent;
  const [url, setUrl] = useState(content.url);
  const [alt, setAlt] = useState(content.alt);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const { updateContent, forceSave, hasPendingChanges } = useBlockUpdate(
    block.id,
    block.note_id
  );

  useEffect(() => {
    if (content.url !== url) setUrl(content.url);
    if (content.alt !== alt) setAlt(content.alt);
  }, [content.url, content.alt]);

  const handleUrlChange = (value: string) => {
    setUrl(value);
    updateContent({ ...content, url: value });
  };

  const handleAltChange = (value: string) => {
    setAlt(value);
    updateContent({ ...content, alt: value });
  };

  const handleFocus = () => {
    if (onFocus && urlInputRef.current) {
      onFocus(urlInputRef.current);
    }
  };

  const handleBlur = () => {
    if (hasPendingChanges) {
      forceSave();
    }
  };

  return (
    <div className="space-y-2">
      {url ? (
        <div className="space-y-2">
          <img
            src={url || "/placeholder.svg"}
            alt={!alt ? undefined : alt}
            className="max-w-full rounded-md border border-border"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
            }}
          />
          {/* <Input
            value={caption}
            onChange={(e) => handleCaptionChange(e.target.value)}
            placeholder="Add a caption..."
            className={`border-none bg-transparent p-0 text-muted-foreground placeholder:text-muted-foreground focus-visible:ring-0 ${
              isMobile ? "text-base" : "text-sm"
            }`}
          /> */}
        </div>
      ) : (
        <div className="space-y-2">
          <div
            className={`flex items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/25 bg-muted/20 ${
              isMobile ? "p-12" : "p-8"
            }`}
          >
            <div className="text-center">
              <ImageIcon
                className={`mx-auto text-muted-foreground ${
                  isMobile ? "h-10 w-10" : "h-8 w-8"
                }`}
              />
              <p
                className={`mt-2 text-muted-foreground ${
                  isMobile ? "text-base" : "text-sm"
                }`}
              >
                Add an image
              </p>
            </div>
          </div>
          <Input
            ref={urlInputRef}
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Paste image URL..."
            className={`border-none bg-transparent p-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 ${
              isMobile ? "text-base" : "text-sm"
            } ${
              hasPendingChanges
                ? "border-l-2 border-l-amber-400 pl-2 -ml-2"
                : ""
            }`}
          />
          <Input
            value={!alt ? undefined : alt}
            onChange={(e) => handleAltChange(e.target.value)}
            onBlur={handleBlur}
            placeholder="Alt text..."
            className={`border-none bg-transparent p-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 ${
              isMobile ? "text-base" : "text-sm"
            } ${
              hasPendingChanges
                ? "border-l-2 border-l-amber-400 pl-2 -ml-2"
                : ""
            }`}
          />
        </div>
      )}
    </div>
  );
}
