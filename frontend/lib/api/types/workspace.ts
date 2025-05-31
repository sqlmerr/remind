import { UUID } from "crypto";

export interface Workspace {
  id: UUID;
  title: string;
  user_id: UUID;
}

export interface CreateWorkspace {
  title: string;
}
