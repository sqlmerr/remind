import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth";
import { createNote } from "@/lib/api/client";
import { CreateNote, Note } from "@/lib/api/types/note";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, FileText, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function InlineNoteCreator({
  parentID,
  workspaceID,
  onCancel,
  onCreated,
}: {
  parentID: string | null;
  workspaceID: string;
  onCancel: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const auth = useAuth();

  useEffect(() => {
    // Focus the input when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const createNoteMutation = useMutation({
    mutationFn: async (data: CreateNote) => {
      const response = await createNote(data, auth.token!);

      if (response.statusCode !== 200 || "statusCode" in response.data) {
        throw new Error(
          "message" in response.data
            ? response.data.message
            : "Failed to create note"
        );
      }

      return response.data as Note;
    },
    onSuccess: (newNote) => {
      // Invalidate and refetch notes
      queryClient.invalidateQueries({ queryKey: ["notes"] });

      // Show success toast
      toast.success("Note created", {
        description: `"${newNote.title}" has been created successfully.`,
      });

      // Reset and notify parent
      setTitle("");
      onCreated();
    },
    onError: (error) => {
      toast.error("Error while creating note", {
        description: "Failed to create note. Please try again.",
      });
      console.error("Error creating note:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast("Error", {
        description: "Please enter a note title.",
      });
      return;
    }

    createNoteMutation.mutate({
      title: title.trim(),
      parent: parentID,
      workspace_id: workspaceID,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="px-2 py-1">
      <div className="flex items-center gap-2 mb-1">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New note title..."
          className="h-7 py-1 text-sm"
          disabled={createNoteMutation.isPending}
        />
      </div>
      <div className="flex justify-end gap-1 mt-1">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-6 px-2"
          onClick={onCancel}
          disabled={createNoteMutation.isPending}
        >
          <X className="h-3.5 w-3.5" />
          <span className="sr-only">Cancel</span>
        </Button>
        <Button
          type="submit"
          size="sm"
          variant="ghost"
          className="h-6 px-2"
          disabled={createNoteMutation.isPending || !title.trim()}
        >
          {createNoteMutation.isPending ? (
            <span className="text-xs">Creating...</span>
          ) : (
            <>
              <Check className="h-3.5 w-3.5" />
              <span className="sr-only">Create</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
