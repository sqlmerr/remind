"use client";

import type React from "react";

import { useState, useEffect, useRef, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import {
  type Block,
  type PlainTextContent,
  type BlockType,
  type BlockContent,
  defaultContent,
} from "@/lib/api/types/block";
import { SlashCommandMenu } from "./slash-command-menu";
import { useBlockUpdate } from "@/hooks/use-block-update";

interface PlainTextBlockProps {
  block: Block;
  onUpdate: (content: BlockContent) => void;
  onUpdateType: (blockType: BlockType) => void;
  onCreateBlockAfter: () => void;
  onFocus?: (element: HTMLElement) => void;
  isMobile?: boolean;
}

export function PlainTextBlock({
  block,
  onUpdate,
  onUpdateType,
  onCreateBlockAfter,
  onFocus,
  isMobile = false,
}: PlainTextBlockProps) {
  const content = block.content as PlainTextContent;
  const [text, setText] = useState(content.text);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashPosition, setSlashPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { updateContent, updateType, forceSave, hasPendingChanges } =
    useBlockUpdate(block.id, block.note_id);

  useEffect(() => {
    if (content.text !== text) {
      setText(content.text);
    }
  }, [content.text]);

  const handleChange = (value: string) => {
    setText(value);
    updateContent({ type: "PlainText", text: value });

    const cursorPosition = textareaRef.current?.selectionStart || 0;
    const textBeforeCursor = value.slice(0, cursorPosition);
    const lastSlashIndex = textBeforeCursor.lastIndexOf("/");

    if (lastSlashIndex !== -1) {
      const textAfterSlash = textBeforeCursor.slice(lastSlashIndex + 1);
      const isValidSlashPosition =
        (lastSlashIndex === 0 ||
          /\s/.test(textBeforeCursor[lastSlashIndex - 1])) &&
        !textAfterSlash.includes(" ");

      if (isValidSlashPosition) {
        setSlashPosition(lastSlashIndex);
        setShowSlashMenu(true);
      } else {
        setShowSlashMenu(false);
      }
    } else {
      setShowSlashMenu(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      if (showSlashMenu) {
        return;
      }
      if (hasPendingChanges) {
        forceSave();
      }

      onCreateBlockAfter();
    }

    if (e.key === "Escape") {
      setShowSlashMenu(false);
    }
  };

  const handleFocus = () => {
    if (onFocus && textareaRef.current) {
      onFocus(textareaRef.current);
    }
  };

  const handleSlashCommand = useCallback(
    (blockType: BlockType) => {
      const beforeSlash = text.slice(0, slashPosition);
      const afterSlash = text.slice(textareaRef.current?.selectionStart || 0);

      const newText = beforeSlash + afterSlash;

      if (newText.trim() === "") {
        onUpdateType(blockType);
        updateType(blockType);
      }

      setShowSlashMenu(false);
    },
    [text, slashPosition, onUpdateType, updateType]
  );

  const handleBlur = () => {
    if (hasPendingChanges) {
      forceSave();
    }
  };

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="Enter '/' for commands or start typing"
        className={`resize-none border-none bg-transparent p-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 ${
          isMobile ? "min-h-[3rem] text-base" : "min-h-[2.5rem] text-sm"
        } ${
          hasPendingChanges ? "border-l-2 border-l-amber-400 pl-2 -ml-2" : ""
        }`}
        rows={1}
        onInput={(e) => {
          const target = e.target as HTMLTextAreaElement;
          target.style.height = "auto";
          target.style.height = target.scrollHeight + "px";
        }}
      />

      {showSlashMenu && (
        <SlashCommandMenu
          onSelect={handleSlashCommand}
          onClose={() => setShowSlashMenu(false)}
          filter={text.slice(
            slashPosition + 1,
            textareaRef.current?.selectionStart || 0
          )}
          isMobile={isMobile}
        />
      )}
    </div>
  );
}
