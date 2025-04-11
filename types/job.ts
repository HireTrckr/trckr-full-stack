import { timestamps } from './timestamps';
import { Tag } from './tag';
import { JobStatus } from './jobStatus';

export type Job = JobNotSavedInDB & {
  // server-side attribtued
  id: string;
  timestamps: timestamps;
};

export type JobNotSavedInDB = {
  company: string;
  position: string;
  location?: string;
  statusID: JobStatus['id'];
  URL?: string;
  tagIds?: Tag['id'][]; // tag_ids
};
