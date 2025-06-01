import { UUID } from "crypto";
import {
  AuthToken,
  LoginByEmail,
  LoginByUsername,
  RegisterUser,
} from "./types/auth";
import { User } from "./types/user";
import { CreateWorkspace, Workspace } from "./types/workspace";
import { CreateNote, Note, UpdateNote } from "./types/note";
import { Block, CreateBlock, UpdateBlock } from "./types/block";

export interface APIError {
  statusCode: number;
  message: string;
}

export interface APIResponse<T> {
  statusCode: number;
  data: T;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface RequestProps {
  path: string;
  method: string;
  body?: BodyInit | null;
  headers?: Record<string, string>;
}

export async function request(props: RequestProps) {
  const headers = props.headers || {};
  if (!("Content-Type" in headers)) {
    headers["Content-Type"] = "application/json";
  }

  return await fetch(new URL(props.path, API_URL), {
    method: props.method,
    body: props.body,
    headers,
  });
}

function handleError(error: object): APIResponse<APIError> {
  console.error(error);
  if ("message" in error && "status_code" in error) {
    return {
      data: {
        statusCode: error.status_code as number,
        message: error.message as string,
      },
      statusCode: error.status_code as number,
    };
  } else {
    return {
      data: {
        statusCode: 500,
        message: "Server error",
      },
      statusCode: 500,
    };
  }
}

export async function register(
  data: RegisterUser
): Promise<APIResponse<User | APIError>> {
  try {
    const response = await request({
      path: "/auth/register",
      method: "POST",
      body: JSON.stringify(data),
    });
    const json = await response.json();
    return { data: json, statusCode: response.status };
  } catch (e) {
    return handleError(e as object);
  }
}

export async function loginByUsername(
  data: LoginByUsername
): Promise<APIResponse<AuthToken | APIError>> {
  try {
    const response = await request({
      path: "/auth/login/username",
      method: "POST",
      body: JSON.stringify(data),
    });
    const json = await response.json();
    return { data: json, statusCode: response.status };
  } catch (e) {
    return handleError(e as object);
  }
}

export async function loginByEmail(
  data: LoginByEmail
): Promise<APIResponse<AuthToken | APIError>> {
  try {
    const response = await request({
      path: "/auth/login/email",
      method: "POST",
      body: JSON.stringify(data),
    });
    const json = await response.json();
    return { data: json, statusCode: response.status };
  } catch (e: unknown) {
    return handleError(e as object);
  }
}

export async function getMe(
  jwtToken: string
): Promise<APIResponse<User | APIError>> {
  try {
    const response = await request({
      path: "/auth/me",
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });
    const json = await response.json();
    return { data: json, statusCode: response.status };
  } catch (e: unknown) {
    return handleError(e as object);
  }
}

export async function getUserWorkspaces(
  jwtToken: string
): Promise<APIResponse<{ data: Workspace[] } | APIError>> {
  try {
    const response = await request({
      path: "/workspaces/my",
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });
    const json = await response.json();
    return { data: json, statusCode: response.status };
  } catch (e: unknown) {
    return handleError(e as object);
  }
}

export async function createWorkspace(
  data: CreateWorkspace,
  jwtToken: string
): Promise<APIResponse<Workspace | APIError>> {
  try {
    const response = await request({
      path: "/workspaces",
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify(data),
    });
    const json = await response.json();
    return { data: json, statusCode: response.status };
  } catch (e: unknown) {
    return handleError(e as object);
  }
}

export async function getWorkspace(
  id: UUID | string,
  jwtToken: string
): Promise<APIResponse<Workspace | APIError>> {
  try {
    const response = await request({
      path: `/workspaces/my/${id}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });
    const json = await response.json();
    return { data: json, statusCode: response.status };
  } catch (e: unknown) {
    return handleError(e as object);
  }
}

export async function getWorkspaceNotes(
  workspaceID: UUID | string,
  jwtToken: string
): Promise<APIResponse<{ data: Note[] } | APIError>> {
  try {
    const response = await request({
      path: `/workspaces/my/${workspaceID}/notes`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });
    const json = await response.json();
    return { data: json, statusCode: response.status };
  } catch (e: unknown) {
    return handleError(e as object);
  }
}

export async function createNote(
  data: CreateNote,
  jwtToken: string
): Promise<APIResponse<Note | APIError>> {
  try {
    const response = await request({
      path: "/notes",
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify(data),
    });
    const json = await response.json();
    return { data: json, statusCode: response.status };
  } catch (e: unknown) {
    return handleError(e as object);
  }
}

export async function getNote(
  id: UUID | string,
  jwtToken: string
): Promise<APIResponse<Note | APIError>> {
  try {
    const response = await request({
      path: `/notes/${id}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });
    const json = await response.json();
    return { data: json, statusCode: response.status };
  } catch (e: unknown) {
    return handleError(e as object);
  }
}

export async function updateNote(
  noteId: string | UUID,
  data: UpdateNote,
  jwtToken: string
): Promise<APIResponse<{ ok: boolean } | APIError>> {
  try {
    const response = await request({
      path: `/notes/${noteId}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify(data),
    });
    const json = await response.json();
    return { data: json, statusCode: response.status };
  } catch (e: unknown) {
    return handleError(e as object);
  }
}

export async function addBlock(
  data: CreateBlock,
  jwtToken: string
): Promise<APIResponse<Block | APIError>> {
  try {
    const response = await request({
      path: "/blocks",
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify(data),
    });
    const json = await response.json();
    return { data: json, statusCode: response.status };
  } catch (e: unknown) {
    return handleError(e as object);
  }
}

export async function updateBlock(
  blockId: string | UUID,
  data: UpdateBlock,
  jwtToken: string
): Promise<APIResponse<{ ok: boolean } | APIError>> {
  try {
    const response = await request({
      path: `/blocks/${blockId}`,
      method: "PUT",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify(data),
    });
    const json = await response.json();
    return { data: json, statusCode: response.status };
  } catch (e: unknown) {
    return handleError(e as object);
  }
}

export async function deleteBlock(
  blockId: string | UUID,
  jwtToken: string
): Promise<APIResponse<{ ok: boolean } | APIError>> {
  try {
    const response = await request({
      path: `/blocks/${blockId}`,
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });
    const json = await response.json();
    return { data: json, statusCode: response.status };
  } catch (e: unknown) {
    return handleError(e as object);
  }
}

export async function reorderBlocks(
  noteId: string | UUID,
  blockIds: string[] | UUID[],
  jwtToken: string
): Promise<APIResponse<Note | APIError>> {
  try {
    const response = await request({
      path: `/notes/${noteId}/blocks/reorder`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify({ blocks: blockIds }),
    });
    const json = await response.json();
    return { data: json, statusCode: response.status };
  } catch (e: unknown) {
    return handleError(e as object);
  }
}

// export async function getNoteBlocks(noteId: string | UUID, jwtToken: string): Promise<APIResponse<Block>>
