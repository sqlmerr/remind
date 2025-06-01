"use client";

import { Note } from "@/lib/api/types/note";
import { Workspace } from "@/lib/api/types/workspace";
import { UUID } from "crypto";
import { useState } from "react";
import {
  FileText,
  Plus,
  Search,
  Star,
  Clock,
  ChevronRight,
  ChevronDown,
  Hash,
  BookOpen,
  Folder,
  MoreHorizontal,
  Trash2,
  Edit3,
} from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import InlineNoteCreator from "./inline-note-creator";
import Link from "next/link";

export interface SidebarProps {
  workspace: Workspace;
  notes: Note[];
}

export default function NoteSidebar({ workspace, notes }: SidebarProps) {
  console.log(typeof notes, notes);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [creatingIn, setCreatingIn] = useState<{
    parentId: string | null;
  } | null>(null);

  const rootNotes = notes.filter((note) => !note.parent);
  let childrenNotes: Record<UUID, Note[]> = {};
  rootNotes.forEach((note) => {
    childrenNotes[note.id] = notes.filter((n) => n.parent === note.id);
  });

  // const filteredNotes = rootNotes.filter((note) => {
  //   return note.title.toLowerCase().includes(searchQuery.toLowerCase());
  // });

  const toggleExpanded = (id: UUID) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleAddNote = (parentId?: string) => {
    setCreatingIn({
      parentId: parentId || null,
    });

    if (parentId) {
      setExpandedItems((prev) => new Set([...prev, parentId]));
    }
  };

  const handleCancelCreate = () => {
    setCreatingIn(null);
  };

  const handleNoteCreated = () => {
    setCreatingIn(null);
  };

  return (
    // <>
    <Sidebar className="border-r border-border bg-sidebar-background">
      <SidebarHeader className="border-b">
        <div className="flex items-center justify-between px-2 py-2">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-600 text-xs font-semibold text-white">
              {workspace.title.charAt(0).toUpperCase()}
            </div>
            <span className="font-semibold">{workspace.title}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAddNote()}
            className="h-6 w-6 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="px-2 pb-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 bg-muted/50"
            />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Favorites Section */}
        {/* <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground">
              Favorites
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {notesData.favorites.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton asChild isActive={item.isActive}>
                      <a href="#" className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span className="truncate">{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <SidebarMenuAction>
                          <MoreHorizontal className="h-4 w-4" />
                        </SidebarMenuAction>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="right" align="start">
                        <DropdownMenuItem>
                          <Edit3 className="h-4 w-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Star className="h-4 w-4 mr-2" />
                          Remove from favorites
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup> */}

        {/* Recent Section */}
        {/* <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground">
              Recent
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {notesData.recent.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton asChild>
                      <a href="#" className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="truncate text-sm">{item.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {item.lastModified}
                          </span>
                        </div>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup> */}

        {/* Workspace Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {creatingIn && !creatingIn.parentId && (
                <SidebarMenuItem>
                  <InlineNoteCreator
                    parentID={null}
                    workspaceID={workspace.id}
                    onCancel={handleCancelCreate}
                    onCreated={handleNoteCreated}
                  />
                </SidebarMenuItem>
              )}
              {rootNotes.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={
                        "/dashboard/workspaces/" +
                        workspace.id +
                        "/notes/" +
                        item.id
                      }
                      className={"flex-1 pr-10"}
                    ></Link>
                  </SidebarMenuButton>

                  {/* {childrenNotes[item.id].length > 0 ? ( */}
                  <Collapsible
                    open={expandedItems!.has(item.id)}
                    onOpenChange={() => toggleExpanded(item.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="w-full">
                        <div className="flex items-center gap-2 flex-1">
                          {expandedItems!.has(item.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          <span className="h-4 w-4">{item.icon.data}</span>
                          <span className="truncate">{item.title}</span>
                        </div>
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {creatingIn && creatingIn.parentId === item.id && (
                          <SidebarMenuItem>
                            <InlineNoteCreator
                              parentID={item.id}
                              workspaceID={workspace.id}
                              onCancel={handleCancelCreate}
                              onCreated={handleNoteCreated}
                            />
                          </SidebarMenuItem>
                        )}
                        {childrenNotes[item.id]?.map((child) => (
                          <SidebarMenuSubItem key={child.id}>
                            <SidebarMenuSubButton asChild>
                              <Link
                                href={
                                  "/dashboard/workspaces/" +
                                  workspace.id +
                                  "/notes/" +
                                  child.id
                                }
                                className="flex items-center gap-2"
                              >
                                <span className="h-4 w-4">
                                  {child.icon.data}
                                </span>
                                <span className="truncate">{child.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                  {/* ) : (
                      <SidebarMenuButton asChild>
                        <a href="#" className="flex items-center gap-2">
                          <span className="h-4 w-4">{item.icon.data}</span>
                          <span className="truncate">{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    )} */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuAction>
                        <MoreHorizontal className="h-4 w-4" />
                      </SidebarMenuAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start">
                      <DropdownMenuItem onClick={() => handleAddNote(item.id)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add sub-note
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit3 className="h-4 w-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Star className="h-4 w-4 mr-2" />
                        Add to favorites
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
