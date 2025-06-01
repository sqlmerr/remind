"use client";

import NoteSidebar from "@/components/features/workspaces/sidebar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/context/auth";
import { getWorkspace, getWorkspaceNotes } from "@/lib/api/client";
import { Note } from "@/lib/api/types/note";
import { Workspace } from "@/lib/api/types/workspace";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";
import { use } from "react";
import { toast } from "sonner";

export default function Page({
  params,
  children,
}: {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}) {
  const workspaceID = use(params).slug;
  const queryClient = useQueryClient();
  const auth = useAuth();

  if (!auth.isAuthorized) {
    toast.error("You must be logged in to access this page");
    redirect("/login");
  }

  const {
    data: workspace,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["workspace", workspaceID],
    queryFn: async () => {
      const response = await getWorkspace(workspaceID, auth.token!);
      if (response.statusCode !== 200 || "statusCode" in response.data) {
        throw new Error(
          "message" in response.data
            ? response.data.message
            : "Failed to fetch workspace"
        );
      }
      return response.data as Workspace;
    },
    enabled: !!workspaceID,
  });

  if (error) {
    toast.error("Failed to fetch workspace", { description: error.message });
    return;
  }

  const {
    data: notes,
    isLoading: isLoadingNotes,
    error: notesError,
  } = useQuery({
    queryKey: ["notes", workspaceID],
    queryFn: async () => {
      const response = await getWorkspaceNotes(workspaceID, auth.token!);
      if (response.statusCode !== 200 || "statusCode" in response.data) {
        throw new Error(
          "message" in response.data
            ? response.data.message
            : "Failed to fetch notes"
        );
      }
      return response.data.data as Note[];
    },
    enabled: !!workspaceID,
  });

  if (notesError) {
    toast.error("Failed to fetch notes", {
      description: notesError.message,
    });
    return;
  }

  if (isLoading || isLoadingNotes || !notes || !workspace) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600 dark:text-gray-400" />
      </div>
    );
  }

  return (
    <>
      <SidebarProvider>
        <NoteSidebar workspace={workspace!} notes={notes!} />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </>
  );
}
