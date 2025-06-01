"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { BlockContent, BlockType } from "@/lib/api/types/block";
import { updateBlock } from "@/lib/api/client";
import { useAuth } from "@/context/auth";

export function useBlockUpdate(blockId: string, noteId: string | null) {
  const queryClient = useQueryClient();
  const [pendingContent, setPendingContent] = useState<BlockContent | null>(
    null
  );
  const [pendingType, setPendingType] = useState<BlockType | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef<boolean>(false);
  const auth = useAuth();

  const updateBlockMutation = useMutation({
    mutationFn: async ({
      blockId,
      data,
    }: {
      blockId: string;
      data: { content?: BlockContent; blockType?: BlockType };
    }) => await updateBlock(blockId, data, auth.token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["note", noteId] });
      isSavingRef.current = false;
    },
    onError: (error) => {
      console.error("Failed to update block:", error);
      isSavingRef.current = false;
    },
  });

  const saveChanges = useCallback(() => {
    if (isSavingRef.current) return;

    const currentContent = pendingContent;
    const currentType = pendingType;

    if (!currentContent && !currentType) return;

    const data: { content?: BlockContent; blockType?: BlockType } = {};
    if (currentContent) data.content = currentContent;
    if (currentType) data.blockType = currentType;

    isSavingRef.current = true;
    updateBlockMutation.mutate({ blockId, data });

    setPendingContent(null);
    setPendingType(null);
    updateBlockMutation.mutate({ blockId, data });
  }, [blockId, updateBlockMutation]);

  const updateContent = useCallback(
    (content: BlockContent) => {
      setPendingContent(content);

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveChanges();
        saveTimeoutRef.current = null;
      }, 5000);
    },
    [saveChanges]
  );

  const updateType = useCallback(
    (blockType: BlockType) => {
      setPendingType(blockType);

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }

      setTimeout(() => {
        saveChanges();
      }, 0);
    },
    [saveChanges]
  );

  const forceSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    if (pendingContent || pendingType) {
      setTimeout(() => {
        saveChanges();
      }, 0);
    }
  }, [saveChanges]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      if (pendingContent || pendingType) {
        saveChanges();
      }
    };
  }, [pendingContent, pendingType, saveChanges]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (pendingContent || pendingType) {
        saveChanges();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [pendingContent, pendingType, saveChanges]);

  return {
    updateContent,
    updateType,
    forceSave,
    isSaving: isSavingRef.current || updateBlockMutation.isPending,
    hasPendingChanges: !!pendingContent || !!pendingType,
  };
}
