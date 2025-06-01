"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Block,
  BlockContent,
  BlockType,
  CreateBlock,
  defaultContent,
  UpdateBlock,
} from "@/lib/api/types/block";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Note } from "@/lib/api/types/note";
import {
  addBlock,
  deleteBlock,
  reorderBlocks,
  updateBlock,
  updateNote,
} from "@/lib/api/client";
import { useAuth } from "@/context/auth";
import { toast } from "sonner";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { BlockComponent } from "../blocks/block-component";
import { VirtualTextBlock } from "../blocks/virtual-text-component";

export default function NoteEditor({ note }: { note: Note }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [activeBlock, setActiveBlock] = useState<Block | null>(null);
  const [showVirtualBlock, setShowVirtualBlock] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const blocksContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const auth = useAuth();

  const titleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [pendingTitle, setPendingTitle] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: isMobile ? 15 : 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const updateNoteMutation = useMutation({
    mutationFn: async ({
      noteId,
      title,
    }: {
      noteId: string;
      title: string;
    }) => {
      const response = await updateNote(noteId, { title }, auth.token!);
      if (response.statusCode !== 200 || "statusCode" in response.data) {
        throw new Error(
          "message" in response.data
            ? response.data.message
            : "Failed to update note"
        );
      }
      return response.data.ok;
    },
    onError: (e) => {
      toast.error("Error while updating note", {
        description: e.message,
      });
    },
    onSuccess: (ok) => {
      queryClient.invalidateQueries({ queryKey: ["note", note.id] });
    },
  });

  const createBlockMutation = useMutation({
    mutationFn: async (data: CreateBlock) => {
      const response = await addBlock(data, auth.token!);
      if (response.statusCode != 200 || "statusCode" in response.data) {
        console.log("create", response, data);
        throw new Error(
          "message" in response.data
            ? response.data.message
            : "Failed to create block"
        );
      }
      return response.data as Block;
    },
    onError: (e) => {
      toast.error("Error while creating block", {
        description: e.message,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["note", note.id] });
    },
  });

  const updateBlockMutation = useMutation({
    mutationFn: async ({
      blockId,
      data,
    }: {
      blockId: string;
      data: UpdateBlock;
    }) => {
      const response = await updateBlock(blockId, data, auth.token!);
      if (response.statusCode !== 200 || "statusCode" in response.data) {
        throw new Error(
          "message" in response.data
            ? response.data.message
            : "Failed to update block"
        );
      }
      return response.data.ok;
    },
    onError: (e) => {
      toast.error("Error while updating block", {
        description: e.message,
      });
    },
    onSuccess: (ok) => {
      queryClient.invalidateQueries({ queryKey: ["note", note.id] });
    },
  });

  const deleteBlockMutation = useMutation({
    mutationFn: async (blockId: string) => {
      const response = await deleteBlock(blockId, auth.token!);
      if (response.statusCode !== 200 || "statusCode" in response.data) {
        throw new Error(
          "message" in response.data
            ? response.data.message
            : "Failed to delete block"
        );
      }
      return response.data.ok;
    },
    onError: (e) => {
      toast.error("Error while deleting block", {
        description: e.message,
      });
      queryClient.invalidateQueries({ queryKey: ["note", note.id] });
    },
    onSuccess: (ok) => {
      if (ok) {
        queryClient.invalidateQueries({ queryKey: ["note", note.id] });
      }
    },
  });

  const reorderBlocksMutation = useMutation({
    mutationFn: async ({
      noteId,
      blockIds,
    }: {
      noteId: string;
      blockIds: string[];
    }) => {
      const response = await reorderBlocks(noteId, blockIds, auth.token!);
      if (response.statusCode !== 200 || "statusCode" in response.data) {
        throw new Error(
          "message" in response.data
            ? response.data.message
            : "Failed to reorder blocks"
        );
      }
      return response.data;
    },
    onError: (e) => {
      toast.error("Error while reordering blocks", {
        description: e.message,
      });
      queryClient.invalidateQueries({ queryKey: ["note", note.id] });
    },
    onSuccess: (ok) => {
      if (ok) {
        queryClient.invalidateQueries({ queryKey: ["note", note.id] });
      }
    },
  });

  useEffect(() => {
    if (note.title !== title) {
      setTitle(note.title || "");
      setPendingTitle(null);
    }
  }, [note.title]);
  useEffect(() => {
    return () => {
      if (titleTimeoutRef.current) {
        clearTimeout(titleTimeoutRef.current);
      }
    };
  }, [pendingTitle, note, updateNoteMutation]);

  const scrollToElement = (element: HTMLElement, offset = 200) => {
    const elementRect = element.getBoundingClientRect();
    const absoluteElementTop = elementRect.top + window.pageYOffset;
    const middle = absoluteElementTop - window.innerHeight / 2 + offset;

    window.scrollTo({
      top: middle,
      behavior: "smooth",
    });
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    setPendingTitle(newTitle);

    if (titleTimeoutRef.current) {
      clearTimeout(titleTimeoutRef.current);
    }

    titleTimeoutRef.current = setTimeout(async () => {
      if (note) {
        await updateNoteMutation.mutateAsync({
          noteId: note.id,
          title: newTitle,
        });
        setPendingTitle(null);
      }
      titleTimeoutRef.current = null;
    }, 5000);
  };

  const handleTitleBlur = async () => {
    if (titleTimeoutRef.current) {
      clearTimeout(titleTimeoutRef.current);
      titleTimeoutRef.current = null;

      if (pendingTitle !== null && note) {
        await updateNoteMutation.mutateAsync({
          noteId: note.id,
          title: pendingTitle,
        });
        setPendingTitle(null);
      }
    }
  };

  const handleDragStart = (event: any) => {
    const { active } = event;
    const block = note.blocks.find((b) => b.id === active.id);
    setActiveBlock(block || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveBlock(null);

    if (over && active.id !== over.id && note) {
      const oldIndex = note.blocks.findIndex((block) => block.id === active.id);
      const newIndex = note.blocks.findIndex((block) => block.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newBlocks = arrayMove(note.blocks, oldIndex, newIndex);
        const blockIds = newBlocks.map((block) => block.id);

        queryClient.setQueryData(["blocks", note], newBlocks);
        reorderBlocksMutation.mutate({ noteId: note.id, blockIds });
      }
    }
  };

  const handlePageClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    const isInteractiveElement = target.closest(
      'button, input, textarea, [role="button"], [role="menuitem"], .sortable-item, .drag-handle'
    );

    const isBlockContent = target.closest("[data-block-id]");
    const isTitleInput = target.closest(".title-input");

    if (
      !isInteractiveElement &&
      !isBlockContent &&
      !isTitleInput &&
      !showVirtualBlock
    ) {
      setShowVirtualBlock(true);
    }
  };

  const createNewBlock = async (
    blockType: BlockType,
    content: BlockContent
  ) => {
    try {
      const newBlock = await createBlockMutation.mutateAsync({
        note_id: note.id,
        block_type: blockType,
        content,
      });
      return newBlock;
    } catch (error) {
      console.error("Failed to create block:", error);
      return null;
    }
  };

  const handleVirtualBlockCreate = async (text: string) => {
    const newBlock = await createNewBlock("PlainText", {
      type: "PlainText",
      text,
    });
    if (newBlock) {
      setShowVirtualBlock(false);
      setTimeout(() => {
        const newBlockElement = document.querySelector(
          `[data-block-id="${newBlock.id}"] textarea`
        );
        if (newBlockElement) {
          (newBlockElement as HTMLTextAreaElement).focus();
          (newBlockElement as HTMLTextAreaElement).setSelectionRange(
            text.length,
            text.length
          );
          scrollToElement(newBlockElement as HTMLElement);
        }
      }, 100);
    }
  };

  const handleVirtualBlockCreateWithType = async (blockType: BlockType) => {
    const newBlock = await createNewBlock(blockType, defaultContent[blockType]);
    if (newBlock) {
      setShowVirtualBlock(false);
      setTimeout(() => {
        const newBlockElement = document.querySelector(
          `[data-block-id="${newBlock.id}"] textarea, [data-block-id="${newBlock.id}"] input`
        );
        if (newBlockElement) {
          (newBlockElement as HTMLElement).focus();
          scrollToElement(newBlockElement as HTMLElement);
        }
      }, 100);
    }
  };

  const handleVirtualBlockCancel = () => {
    setShowVirtualBlock(false);
  };

  const handleAddBlock = async (blockType: BlockType) => {
    const newBlock = await createNewBlock(blockType, defaultContent[blockType]);
    if (newBlock) {
      setShowMobileMenu(false);
      setTimeout(() => {
        const newBlockElement = document.querySelector(
          `[data-block-id="${newBlock.id}"] textarea, [data-block-id="${newBlock.id}"] input`
        );
        if (newBlockElement) {
          (newBlockElement as HTMLElement).focus();
          scrollToElement(newBlockElement as HTMLElement);
        }
      }, 100);
    }
  };

  const handleCreateBlockAfter = async (currentBlockId: string) => {
    const newBlock = await createNewBlock("PlainText", {
      type: "PlainText",
      text: "",
    });
    if (newBlock) {
      setTimeout(() => {
        const newBlockElement = document.querySelector(
          `[data-block-id="${newBlock.id}"] textarea`
        );
        if (newBlockElement) {
          (newBlockElement as HTMLTextAreaElement).focus();
          scrollToElement(newBlockElement as HTMLElement);
        }
      }, 100);
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    console.log("Attempting to delete block:", blockId);

    try {
      await deleteBlockMutation.mutateAsync(blockId);
      console.log("Block deleted successfully:", blockId);
    } catch (error) {
      console.error("Failed to delete block:", error);
    }
  };

  return (
    <div
      className="flex h-full flex-col bg-background"
      onClick={handlePageClick}
    >
      {/* Header */}
      <header className="flex items-center gap-2 border-b border-border bg-background px-3 md:px-4 py-3 sticky top-0 z-40">
        <SidebarTrigger className="text-foreground hover:bg-accent hover:text-accent-foreground" />
        <div className="flex-1" />

        {/* Mobile Add Button */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground hover:bg-accent hover:text-accent-foreground md:hidden"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <Plus className="h-5 w-5" />
          </Button>
        )}

        {/* Desktop Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground hover:bg-accent hover:text-accent-foreground hidden md:flex"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border">
            <DropdownMenuItem
              onClick={() => handleAddBlock("PlainText")}
              className="text-popover-foreground hover:bg-accent hover:text-accent-foreground"
            >
              📝 Add text block
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleAddBlock("Checkbox")}
              className="text-popover-foreground hover:bg-accent hover:text-accent-foreground"
            >
              ☑️ Add checkbox
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleAddBlock("Code")}
              className="text-popover-foreground hover:bg-accent hover:text-accent-foreground"
            >
              💻 Add code
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleAddBlock("Image")}
              className="text-popover-foreground hover:bg-accent hover:text-accent-foreground"
            >
              🖼️ Add image
            </DropdownMenuItem>
            {/* <DropdownMenuItem className="text-popover-foreground hover:bg-accent hover:text-accent-foreground">
              Export
            </DropdownMenuItem>
            <DropdownMenuItem className="text-popover-foreground hover:bg-accent hover:text-accent-foreground">
              Share
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive hover:bg-destructive hover:text-destructive-foreground">
              Delete
            </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Mobile Quick Add Menu */}
      {isMobile && showMobileMenu && (
        <div className="bg-background border-b border-border p-3 md:hidden">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddBlock("PlainText")}
              className="justify-start text-left h-auto py-3"
            >
              <div>
                <div className="font-medium">📝 Text</div>
                <div className="text-xs text-muted-foreground">Plain text</div>
              </div>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddBlock("Checkbox")}
              className="justify-start text-left h-auto py-3"
            >
              <div>
                <div className="font-medium">☑️ Checkbox</div>
                <div className="text-xs text-muted-foreground">Todo</div>
              </div>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddBlock("Code")}
              className="justify-start text-left h-auto py-3"
            >
              <div>
                <div className="font-medium">💻 Code</div>
                <div className="text-xs text-muted-foreground">Code block</div>
              </div>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddBlock("Image")}
              className="justify-start text-left h-auto py-3"
            >
              <div>
                <div className="font-medium">🖼️ Image</div>
                <div className="text-xs text-muted-foreground">Image block</div>
              </div>
            </Button>
          </div>
        </div>
      )}

      {/* Editor */}
      <div ref={editorRef} className="flex-1 overflow-auto bg-background">
        <div className="mx-auto max-w-4xl px-3 md:px-6 py-4 md:py-8 min-h-full">
          {/* Title */}
          <div className="title-input">
            <Input
              ref={titleRef}
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Unnamed"
              onBlur={handleTitleBlur}
              className={`mb-4 border-none bg-transparent text-2xl md:text-4xl font-bold text-foreground placeholder:text-muted-foreground focus-visible:ring-0 p-0 h-auto ${
                pendingTitle !== null
                  ? "border-l-2 border-l-amber-400 pl-2 -ml-2"
                  : ""
              }`}
              onFocus={(e) => {
                setTimeout(
                  () => scrollToElement(e.target as HTMLElement, 100),
                  100
                );
              }}
            />
          </div>

          {/* Blocks */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={note.blocks.map((b) => b.id)}
              strategy={verticalListSortingStrategy}
            >
              <div ref={blocksContainerRef} className="space-y-1 min-h-[400px]">
                {note.blocks.map((block) => (
                  <div key={block.id} className="sortable-item">
                    <BlockComponent
                      block={block}
                      onUpdate={(content) => {
                        // const updatedBlock = { ...block, content };
                        // queryClient.setQueryData(
                        //   ["note", note],
                        //   note.blocks.map((b) =>
                        //     b.id === block.id ? updatedBlock : b
                        //   )
                        // );
                      }}
                      onDelete={() => handleDeleteBlock(block.id)}
                      onUpdateType={(blockType) =>
                        updateBlockMutation.mutate({
                          blockId: block.id,
                          data: { block_type: blockType },
                        })
                      }
                      onCreateBlockAfter={() =>
                        handleCreateBlockAfter(block.id)
                      }
                      onFocus={(element) => scrollToElement(element)}
                      isMobile={isMobile}
                    />
                  </div>
                ))}

                {showVirtualBlock && (
                  <div className="virtual-block">
                    <VirtualTextBlock
                      onCreateBlock={handleVirtualBlockCreate}
                      onCreateBlockWithType={handleVirtualBlockCreateWithType}
                      onCancel={handleVirtualBlockCancel}
                    />
                  </div>
                )}
              </div>
            </SortableContext>

            <DragOverlay>
              {activeBlock ? (
                <div className="bg-background border border-border shadow-lg rounded-md p-2 max-w-2xl opacity-90">
                  <div className="text-sm text-muted-foreground truncate">
                    {activeBlock.block_type === "PlainText" &&
                      (activeBlock.content as any).text}
                    {activeBlock.block_type === "Checkbox" &&
                      `☑️ ${(activeBlock.content as any).text}`}
                    {activeBlock.block_type === "Code" && `💻 Code block`}
                    {activeBlock.block_type === "Image" && `🖼️ Image block`}
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

          {/* Spacer для удобного скролла */}
          <div className="h-96"></div>
        </div>
      </div>
    </div>
  );
}
