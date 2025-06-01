import { UUID } from "crypto";

export type BlockType = "PlainText" | "Image" | "Checkbox" | "Code";
export type BlockContent =
  | PlainTextContent
  | CheckboxContent
  | ImageContent
  | CodeContent;

export interface Block {
  id: UUID;
  block_type: BlockType;
  content: BlockContent;
  position: number;
  note_id: UUID;
}

export interface CreateBlock {
  block_type: BlockType;
  content: BlockContent;
  note_id: UUID;
}

export interface UpdateBlock {
  block_type?: BlockType | null;
  content?: BlockContent | null;
}

export interface PlainTextContent {
  type: "PlainText";
  text: string;
}

export interface CheckboxContent {
  type: "Checkbox";
  text: string;
  status: boolean;
}

export interface ImageContent {
  type: "Image";
  url: string;
  alt: string | null;
}

export interface CodeContent {
  type: "Code";
  code: string;
  language: string;
}

export const defaultContent: Record<BlockType, BlockContent> = {
  PlainText: { type: "PlainText", text: "" },
  Checkbox: { type: "Checkbox", text: "", status: false },
  Image: { type: "Image", url: "", alt: "" },
  Code: { type: "Code", code: "", language: "javascript" },
};
