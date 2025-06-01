"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import type { BlockType } from "@/lib/api/types/block";
import { Type, CheckSquare, ImageIcon, Code } from "lucide-react";

interface SlashCommandMenuProps {
  onSelect: (blockType: BlockType) => void;
  onClose: () => void;
  filter: string;
  isMobile?: boolean;
}

const commands = [
  {
    type: "PlainText" as BlockType,
    label: "Text",
    description: "Default text block",
    icon: Type,
    keywords: ["text", "paragraph"],
  },
  {
    type: "Checkbox" as BlockType,
    label: "Checkbox",
    description: "Track tasks with checkboxes",
    icon: CheckSquare,
    keywords: ["list", "todo", "task", "checkbox"],
  },
  {
    type: "Code" as BlockType,
    label: "Code",
    description: "Block for code",
    icon: Code,
    keywords: ["code", "programming"],
  },
  {
    type: "Image" as BlockType,
    label: "Image",
    description: "Paste a link for an image",
    icon: ImageIcon,
    keywords: ["image", "picture", "photo"],
  },
];

export function SlashCommandMenu({
  onSelect,
  onClose,
  filter,
  isMobile = false,
}: SlashCommandMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const commandRef = useRef<HTMLDivElement>(null);

  const filteredCommands = commands.filter((command) => {
    if (!filter) return true;
    const searchText = filter.toLowerCase();
    return (
      command.label.toLowerCase().includes(searchText) ||
      command.description.toLowerCase().includes(searchText) ||
      command.keywords.some((keyword) => keyword.includes(searchText))
    );
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [filter]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(
          (prev) =>
            (prev - 1 + filteredCommands.length) % filteredCommands.length
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          onSelect(filteredCommands[selectedIndex].type);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, filteredCommands, onSelect, onClose]);

  if (filteredCommands.length === 0) {
    return null;
  }

  return (
    <Card
      className={`absolute top-full left-0 z-50 mt-1 border border-border bg-popover shadow-lg ${
        isMobile ? "w-full max-w-sm" : "w-80"
      }`}
    >
      <div className={isMobile ? "p-3" : "p-2"}>
        <div
          className={`text-xs text-muted-foreground mb-2 px-2 ${
            isMobile ? "text-sm" : ""
          }`}
        >
          Core blocks
        </div>
        <div className="space-y-1">
          {filteredCommands.map((command, index) => {
            const Icon = command.icon;
            return (
              <div
                key={command.type}
                className={`flex items-center gap-3 rounded-md cursor-pointer transition-colors ${
                  isMobile ? "px-3 py-3" : "px-2 py-2"
                } ${
                  index === selectedIndex
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/50"
                }`}
                onClick={() => onSelect(command.type)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="flex-shrink-0">
                  <Icon
                    className={`text-muted-foreground ${
                      isMobile ? "h-5 w-5" : "h-4 w-4"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={`font-medium text-foreground ${
                      isMobile ? "text-base" : "text-sm"
                    }`}
                  >
                    {command.label}
                  </div>
                  <div
                    className={`text-muted-foreground truncate ${
                      isMobile ? "text-sm" : "text-xs"
                    }`}
                  >
                    {command.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div
          className={`text-muted-foreground mt-2 px-2 border-t border-border pt-2 ${
            isMobile ? "text-sm" : "text-xs"
          }`}
        >
          {isMobile
            ? "Press to select"
            : "↑↓ navigation • ↵ select • esc close"}
        </div>
      </div>
    </Card>
  );
}
