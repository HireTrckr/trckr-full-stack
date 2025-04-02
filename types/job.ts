import { timestamps } from './timestamps';
import { Tag } from './tag';

export type Job = JobNotSavedInDB & {
  // server-side attribtued
  id: string;
  timestamps: timestamps;
};

export type JobNotSavedInDB = {
  company: string;
  position: string;
  location?: string;
  status: JobStatus;
  URL?: string;
  tagIds?: Tag['id'][]; // tag_ids
};

export const statusOptions = [
  'not applied',
  'applied',
  'interview',
  'offer',
  'rejected',
] as const;

export type JobStatus = (typeof statusOptions)[number];
