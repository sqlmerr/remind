"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import type {
  Block,
  BlockContent,
  CheckboxContent,
} from "@/lib/api/types/block";
import { useBlockUpdate } from "@/hooks/use-block-update";

interface CheckboxBlockProps {
  block: Block;
  onUpdate: (content: BlockContent) => void;
  onFocus?: (element: HTMLElement) => void;
  isMobile?: boolean;
}

export function CheckboxBlock({
  block,
  onUpdate,
  onFocus,
  isMobile = false,
}: CheckboxBlockProps) {
  const content = block.content as CheckboxContent;
  const [text, setText] = useState(content.text);
  const [checked, setChecked] = useState(content.status);
  const inputRef = useRef<HTMLInputElement>(null);

  const { updateContent, forceSave, hasPendingChanges } = useBlockUpdate(
    block.id,
    block.note_id
  );

  useEffect(() => {
    if (content.text !== text) {
      setText(content.text);
    }
  }, [content.text]);
  const handleTextChange = (value: string) => {
    setText(value);
    updateContent({ type: "Checkbox", text: value, status: checked });
  };

  const handleCheckboxToggle = async () => {
    updateContent({ type: "Checkbox", text, status: !checked });
    setChecked(!checked);
    console.log("checkbox toggled", checked);
  };

  const handleFocus = () => {
    if (onFocus && inputRef.current) {
      onFocus(inputRef.current);
    }
  };

  const handleBlur = async () => {
    if (hasPendingChanges) {
      forceSave();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCheckboxToggle}
        className={`flex-shrink-0 mt-1 flex items-center justify-center transition-colors rounded border border-border ${
          isMobile ? "w-5 h-5" : "w-4 h-4"
        } ${
          checked
            ? "bg-primary border-primary"
            : "bg-background hover:bg-accent"
        }`}
      >
        {checked && <span className="text-primary-foreground text-xs">✓</span>}
      </button>
      <Input
        ref={inputRef}
        value={text}
        onChange={(e) => handleTextChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="Add a task..."
        className={`border-none bg-transparent p-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 ${
          checked ? "line-through text-muted-foreground" : ""
        } ${isMobile ? "text-base" : "text-sm"} ${
          hasPendingChanges ? "border-l-2 border-l-amber-400 pl-2 -ml-2" : ""
        }`}
      />
    </div>
  );
}
