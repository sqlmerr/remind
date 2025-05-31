import {
  AuthToken,
  LoginByEmail,
  LoginByUsername,
  RegisterUser,
} from "./types/auth";
import { User } from "./types/user";
import { CreateWorkspace, Workspace } from "./types/workspace";

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
  return await fetch(new URL(props.path, API_URL), {
    method: props.method,
    body: props.body,
    headers:
      "Content-Type" in props.headers!
        ? props.headers
        : { "Content-Type": "application/json", ...props.headers! },
  });
}

function handleError(error: object): APIResponse<APIError> {
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
