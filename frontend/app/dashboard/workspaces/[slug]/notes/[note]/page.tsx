"use client";

import NoteEditor from "@/components/features/workspaces/note-edtior";
import { useAuth } from "@/context/auth";
import { getNote } from "@/lib/api/client";
import { Note } from "@/lib/api/types/note";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { use } from "react";

export default function Page({
  params,
}: {
  params: Promise<{ slug: string; note: string }>;
}) {
  const p = use(params);
  const queryClient = useQueryClient();
  const auth = useAuth();

  const { data: note, isLoading: isNoteLoading } = useQuery({
    queryKey: ["note", p.note],
    queryFn: async () => {
      const response = await getNote(p.note, auth.token!);
      if (response.statusCode !== 200 || "statusCode" in response.data) {
        throw new Error(
          "message" in response.data
            ? response.data.message
            : "Failed to fetch workspace"
        );
      }
      return response.data as Note;
    },
  });

  if (!note || isNoteLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600 dark:text-gray-400" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <NoteEditor note={note} />
    </div>
  );
}
