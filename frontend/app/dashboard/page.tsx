"use client";

import LogoutButton from "@/components/features/auth/logout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/auth";
import { createWorkspace, getUserWorkspaces } from "@/lib/api/client";
import { CreateWorkspace, Workspace } from "@/lib/api/types/workspace";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Briefcase,
  Calendar,
  Loader2,
  LogOut,
  Plus,
  Users,
} from "lucide-react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [workspaceForm, setWorkspaceForm] = useState<CreateWorkspace>({
    title: "",
  });
  const queryClient = useQueryClient();
  const { isAuthorized, user, ...auth } = useAuth();

  if (!isAuthorized) {
    toast.error("You must be logged in to access this page");
    redirect("/login");
  }

  const {
    data: workspaces,
    isLoading: isLoadingWorkspaces,
    error: workspacesError,
  } = useQuery({
    queryKey: ["workspaces"],
    queryFn: async (): Promise<Workspace[]> => {
      const response = await getUserWorkspaces(auth.token!);
      if (response.statusCode !== 200 || "statusCode" in response.data) {
        throw new Error(
          "message" in response.data
            ? response.data.message
            : "Failed to fetch workspaces"
        );
      }
      return response.data.data as Workspace[];
    },
    enabled: isAuthorized && !!auth.token, // Only run query if user is authenticated
  });

  const createWorkspaceMutation = useMutation({
    mutationFn: async (data: CreateWorkspace): Promise<Workspace> => {
      const response = await createWorkspace(data, auth.token!);

      if (response.statusCode !== 200) {
        throw new Error(
          "message" in response.data
            ? response.data.message
            : "Failed to create workspace"
        );
      }

      return response.data as Workspace;
    },
    onSuccess: () => {
      // Invalidate and refetch workspaces
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });

      // Reset form and close dialog
      setWorkspaceForm({ title: "" });
      setIsCreateDialogOpen(false);
      toast.success("Workspace created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create workspace", { description: error.message });
    },
  });

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    createWorkspaceMutation.mutate(workspaceForm);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Briefcase className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-xl font-semibold text-gray-900">
                Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user.username}
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Your Workspaces
              </h2>
              <p className="text-gray-600 mt-1">
                Manage and create new workspaces for your projects
              </p>
            </div>

            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Workspace
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Workspace</DialogTitle>
                  <DialogDescription>
                    Create a new workspace to organize your projects and
                    collaborate with your team.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateWorkspace}>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="workspace-title">Workspace Title</Label>
                      <Input
                        id="workspace-title"
                        placeholder="Enter workspace title"
                        value={workspaceForm.title}
                        onChange={(e) =>
                          setWorkspaceForm((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        required
                        disabled={createWorkspaceMutation.isPending}
                      />
                    </div>
                    {/* <div className="space-y-2">
                      <Label htmlFor="workspace-description">Description</Label>
                      <Textarea
                        id="workspace-description"
                        placeholder="Enter workspace description (optional)"
                        value={workspaceForm.description}
                        onChange={(e) => setWorkspaceForm((prev) => ({ ...prev, description: e.target.value }))}
                        disabled={createWorkspaceMutation.isPending}
                        rows={3}
                      />
                    </div> */}
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      disabled={createWorkspaceMutation.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createWorkspaceMutation.isPending}
                    >
                      {createWorkspaceMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Workspace"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Error Alert */}
        {(workspacesError || createWorkspaceMutation.isError) && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              {workspacesError?.message ||
                createWorkspaceMutation.error?.message ||
                "An error occurred"}
            </AlertDescription>
          </Alert>
        )}

        {/* Workspaces Grid */}
        {isLoadingWorkspaces ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : workspaces && workspaces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((workspace) => (
              <Card
                key={workspace.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{workspace.title}</span>
                    {/* <Badge variant="secondary" className="ml-2">
                      <Users className="h-3 w-3 mr-1" />
                      {workspace.memberCount}
                    </Badge> */}
                  </CardTitle>
                </CardHeader>
                {/* <CardContent>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    Created {new Date(workspace.createdAt).toLocaleDateString()}
                  </div>
                </CardContent> */}
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No workspaces yet
              </h3>
              <p className="text-gray-500 mb-4">
                Get started by creating your first workspace
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Workspace
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
