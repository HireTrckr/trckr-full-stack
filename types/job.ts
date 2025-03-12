import { timestamps } from "./timestamps";
import { Tag } from "./tag";

export type Job = {
  id?: string;
  company: string;
  position: string;
  location?: string;
  status: "applied" | "interview" | "offer" | "rejected";
  URL?: string;
  timestamps: timestamps;
  tagIds?: Tag["id"][]; // tag_ids
};

export const statusOptions: Job["status"][] = [
  "applied",
  "interview",
  "offer",
  "rejected",
];
