"use client";

import LogoutButton from "@/components/features/auth/logout";
import { ThemeToggle } from "@/components/theme-toggle";
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600 dark:text-gray-400" />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-950 shadow-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Briefcase className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <h1 className="ml-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
                Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Welcome, {user.username}
              </span>
              <ThemeToggle />
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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Your Workspaces
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage and create new workspaces for your projects
              </p>
            </div>

            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700">
                  <Plus className="h-4 w-4" />
                  Create Workspace
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800">
                <DialogHeader>
                  <DialogTitle className="text-gray-900 dark:text-gray-100">
                    Create New Workspace
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 dark:text-gray-400">
                    Create a new workspace to organize your projects and
                    collaborate with your team.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateWorkspace}>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="workspace-title"
                        className="text-gray-700 dark:text-gray-300"
                      >
                        Workspace Title
                      </Label>
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
                        className="bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
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
                      className="border-gray-300 dark:border-gray-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createWorkspaceMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
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
          <Alert
            variant="destructive"
            className="mb-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950"
          >
            <AlertDescription className="text-red-800 dark:text-red-200">
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
              <Card
                key={i}
                className="animate-pulse border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950"
              >
                <CardHeader>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : workspaces && workspaces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((workspace) => (
              <Card
                key={workspace.id}
                className="hover:shadow-md transition-shadow cursor-pointer border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 hover:shadow-gray-200 dark:hover:shadow-gray-800"
              >
                <CardHeader>
                  <CardTitle
                    className="flex items-center justify-between"
                    onClick={() =>
                      redirect("/dashboard/workspaces/" + workspace.id)
                    }
                  >
                    <span className="truncate">{workspace.title}</span>
                    {/* <Badge variant="secondary" className="ml-2">
                      <Users className="h-3 w-3 mr-1" />
                      {workspace.memberCount}
                    </Badge> */}
                  </CardTitle>
                </CardHeader>
                {/* <CardContent>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="h-4 w-4 mr-1" />
                    Created {new Date(workspace.createdAt).toLocaleDateString()}
                  </div>
                </CardContent> */}
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
            <CardContent>
              <Briefcase className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No workspaces yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Get started by creating your first workspace</p>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
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
