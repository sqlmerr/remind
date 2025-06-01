"use client";

import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Copy, Eye, Edit } from "lucide-react";
import type { Block, BlockContent, CodeContent } from "@/lib/api/types/block";
import { useTheme } from "next-themes";
import { codeToHtml, BundledLanguage, bundledLanguages } from "shiki";
import { useBlockUpdate } from "@/hooks/use-block-update";

interface CodeBlockProps {
  block: Block;
  onUpdate: (content: BlockContent) => void;
  onFocus?: (element: HTMLElement) => void;
  isMobile?: boolean;
}

const languages = bundledLanguages;

export function CodeBlock({
  block,
  onUpdate,
  onFocus,
  isMobile = false,
}: CodeBlockProps) {
  const { theme, resolvedTheme } = useTheme();
  const content = block.content as CodeContent;
  const [code, setCode] = useState(content.code);
  const [language, setLanguage] = useState(content.language);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isDark = resolvedTheme === "dark";
  const { updateContent, forceSave, hasPendingChanges } = useBlockUpdate(
    block.id,
    block.note_id
  );

  useEffect(() => {
    if (content.code !== code) setCode(content.code);
    if (content.language !== language) setLanguage(content.language);
  }, [content.code, content.language]);

  const handleCodeChange = (value: string) => {
    setCode(value);
    updateContent({ ...content, code: value });
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    updateContent({ ...content, language: value });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const toggleEdit = () => {
    if (isEditing && hasPendingChanges) {
      forceSave();
    }
    setIsEditing(!isEditing);
  };

  const handleFocus = () => {
    if (onFocus && textareaRef.current) {
      onFocus(textareaRef.current);
    }
  };

  const handleBlur = () => {
    if (hasPendingChanges) {
      forceSave();
    }
  };

  const showEditor = isEditing || !code.trim();

  return (
    <div className="space-y-2">
      <div
        className={`flex items-center justify-between ${
          isMobile ? "flex-col gap-2" : ""
        }`}
      >
        <div className="flex items-center gap-2">
          <span
            className={`text-muted-foreground ${
              isMobile ? "text-sm" : "text-sm"
            }`}
          >
            Language:
          </span>
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger
              className={`bg-background border-border text-foreground ${
                isMobile ? "w-40 h-9" : "w-32 h-8"
              }`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {Object.keys(languages).map((lang) => (
                <SelectItem
                  key={lang}
                  value={lang}
                  className="text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {code.trim() && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleEdit}
              className={`text-muted-foreground hover:text-foreground hover:bg-accent ${
                isMobile ? "h-8 px-3" : "h-7 px-2"
              }`}
            >
              {isEditing ? (
                <Eye className="h-3 w-3" />
              ) : (
                <Edit className="h-3 w-3" />
              )}
              <span className={`ml-1 ${isMobile ? "text-sm" : "text-xs"}`}>
                {isEditing ? "Preview" : "Edit"}
              </span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className={`text-muted-foreground hover:text-foreground hover:bg-accent ${
                isMobile ? "h-8 px-3" : "h-7 px-2"
              }`}
            >
              <Copy className="h-3 w-3" />
              <span className={`ml-1 ${isMobile ? "text-sm" : "text-xs"}`}>
                {copied ? "Copied!" : "Copy"}
              </span>
            </Button>
          </div>
        )}
      </div>

      <div
        className={`relative rounded-md border border-border bg-muted/30 overflow-hidden ${
          hasPendingChanges ? "border-l-amber-400 border-l-2" : ""
        }`}
      >
        {showEditor ? (
          <div className={isMobile ? "p-4" : "p-3"}>
            <Textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              onFocus={handleFocus}
              placeholder={`Enter your ${language} code...`}
              className={`border-none bg-transparent p-0 font-mono text-foreground placeholder:text-muted-foreground focus-visible:ring-0 resize-none ${
                isMobile ? "min-h-[120px] text-base" : "min-h-[100px] text-sm"
              }`}
              rows={4}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height =
                  Math.max(isMobile ? 120 : 100, target.scrollHeight) + "px";
              }}
              onBlur={handleBlur}
            />
          </div>
        ) : (
          <div className={`relative overflow-auto ${isMobile ? "p-4" : "p-3"}`}>
            <pre
              className={`font-mono whitespace-pre-wrap ${
                isMobile ? "text-base" : "text-sm"
              }`}
            >
              {codeToHtml(code, {
                lang: language,
                theme: isDark ? "min-dark" : "min-light",
              })}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
