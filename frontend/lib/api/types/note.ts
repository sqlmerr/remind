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
}

export interface CreateNote {
  title: string;
  workspace_id: UUID;
  parent: UUID | null;
}
