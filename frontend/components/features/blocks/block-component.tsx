"use client";

import type React from "react";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import type { Block, BlockType } from "@/lib/api/types/block";
import { PlainTextBlock } from "./plaintext";
import { CheckboxBlock } from "./checkbox";
import { ImageBlock } from "./image";
import { CodeBlock } from "./code";
import { Button } from "@/components/ui/button";

interface BlockComponentProps {
  block: Block;
  onUpdate: (content: Record<string, any>) => void;
  onDelete: () => void;
  onUpdateType: (blockType: BlockType) => void;
  onCreateBlockAfter: () => void;
  onFocus?: (element: HTMLElement) => void;
  isMobile?: boolean;
}

export function BlockComponent({
  block,
  onUpdate,
  onDelete,
  onUpdateType,
  onCreateBlockAfter,
  onFocus,
  isMobile = false,
}: BlockComponentProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: block.id,
    data: {
      type: "block",
      block,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    width: isDragging ? "auto" : undefined,
    height: isDragging ? "auto" : undefined,
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Delete button clicked for block:", block.id);
    onDelete();
  };

  const renderBlock = () => {
    switch (block.block_type) {
      case "PlainText":
        return (
          <PlainTextBlock
            block={block}
            onUpdate={onUpdate}
            onUpdateType={onUpdateType}
            onCreateBlockAfter={onCreateBlockAfter}
            onFocus={onFocus}
            isMobile={isMobile}
          />
        );
      case "Checkbox":
        return (
          <CheckboxBlock
            block={block}
            onUpdate={onUpdate}
            onFocus={onFocus}
            isMobile={isMobile}
          />
        );
      case "Image":
        return (
          <ImageBlock
            block={block}
            onUpdate={onUpdate}
            onFocus={onFocus}
            isMobile={isMobile}
          />
        );
      case "Code":
        return (
          <CodeBlock
            block={block}
            onUpdate={onUpdate}
            onFocus={onFocus}
            isMobile={isMobile}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-block-id={block.id}
      className={`group relative flex items-start gap-2 rounded-md p-1 hover:bg-accent/50 transition-colors ${
        isDragging ? "z-50 bg-background border border-border shadow-lg" : ""
      } ${isMobile ? "touch-manipulation" : ""}`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className={`drag-handle flex cursor-grab active:cursor-grabbing items-center transition-opacity text-muted-foreground hover:text-foreground ${
          isMobile
            ? "opacity-100 w-6 h-6 touch-manipulation"
            : "opacity-0 group-hover:opacity-100 w-4 h-4"
        }`}
      >
        <GripVertical className={isMobile ? "h-5 w-5" : "h-4 w-4"} />
      </div>

      {/* Block Content */}
      <div className="flex-1 min-w-0 max-w-full">{renderBlock()}</div>

      {/* Delete Button */}
      <Button
        variant="ghost"
        size="icon"
        className={`transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10 ${
          isMobile
            ? "opacity-100 h-8 w-8"
            : "opacity-0 group-hover:opacity-100 h-6 w-6"
        }`}
        onClick={handleDelete}
      >
        <Trash2 className={isMobile ? "h-4 w-4" : "h-3 w-3"} />
      </Button>
    </div>
  );
}
