import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { BlockContent, BlockType } from "./api/types/block";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
