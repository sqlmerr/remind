import { UUID } from "crypto";
import { Block } from "./block";

export interface Note {
  id: UUID;
  title: string;
  icon: {
    type: string;
    data: string;
  };
  workspace_id: UUID;
  blocks: Block[];
  parent: UUID | null;
}

export interface CreateNote {
  title: string;
  workspace_id: UUID | string;
  parent: UUID | string | null;
}

export interface UpdateNote {
  title: string | null;
}
