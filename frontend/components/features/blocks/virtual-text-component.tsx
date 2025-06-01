"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import type { BlockType } from "@/lib/api/types/block";
import { SlashCommandMenu } from "./slash-command-menu";

interface VirtualTextBlockProps {
  onCreateBlock: (text: string) => void;
  onCreateBlockWithType: (blockType: BlockType) => void;
  onCancel: () => void;
}

export function VirtualTextBlock({
  onCreateBlock,
  onCreateBlockWithType,
  onCancel,
}: VirtualTextBlockProps) {
  const [text, setText] = useState("");
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleChange = (value: string) => {
    setText(value);

    // Check for slash command
    if (value === "/") {
      setShowSlashMenu(true);
      return;
    }

    // If user types something other than slash, create block immediately
    if (value && !value.startsWith("/")) {
      onCreateBlock(value);
      return;
    }

    // If slash menu is open and user continues typing after slash
    if (value.startsWith("/") && value.length > 1) {
      setShowSlashMenu(true);
    } else if (!value.startsWith("/")) {
      setShowSlashMenu(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      // If slash menu is open, don't create block
      if (showSlashMenu) {
        return;
      }

      // Create block with current text (even if empty)
      onCreateBlock(text);
    }

    if (e.key === "Escape") {
      if (showSlashMenu) {
        setShowSlashMenu(false);
        setText("");
      } else {
        onCancel();
      }
    }

    if (e.key === "Backspace" && text === "") {
      onCancel();
    }
  };

  const handleSlashMenuSelect = (blockType: BlockType) => {
    console.log("Slash menu select:", blockType); // Debug log
    setShowSlashMenu(false);
    onCreateBlockWithType(blockType);
  };

  const handleBlur = () => {
    if (!text.trim() && !showSlashMenu) {
      setTimeout(() => {
        if (!showSlashMenu) {
          onCancel();
        }
      }, 150);
    }
  };

  return (
    <div className="relative group flex items-start gap-2 rounded-md p-1 hover:bg-accent/50 transition-colors">
      {/* Placeholder for drag handle */}
      <div className="w-4 h-4 opacity-0" />

      {/* Input field */}
      <div className="flex-1 min-w-0 max-w-full relative">
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder="Введите '/' для команд или начните печатать..."
          className="min-h-[2.5rem] resize-none border-none bg-transparent p-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
          rows={1}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "auto";
            target.style.height = target.scrollHeight + "px";
          }}
        />

        {showSlashMenu && (
          <SlashCommandMenu
            onSelect={handleSlashMenuSelect}
            onClose={() => {
              setShowSlashMenu(false);
              setText("");
            }}
            filter={text.slice(1)}
          />
        )}
      </div>

      {/* Placeholder for delete button */}
      <div className="w-6 h-6 opacity-0" />
    </div>
  );
}
