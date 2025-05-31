import { UUID } from "crypto";

export enum BlockType {
  PlainText = "PlainText",
  Checkbox = "Checkbox",
  Code = "Code",
  Image = "Image",
}

export interface Block {
  id: UUID;
  block_type: BlockType;
  content: any;
  position: number;
}

export interface CreateBlock {
  block_type: BlockType;
  content: any;
  note_id: UUID;
}

export interface UpdateBlock {
  block_type: BlockType | null;
  content: any | null;
}
