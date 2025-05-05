import { timestamps } from './timestamps';
import { Tag } from './tag';
import { JobStatus } from './jobStatus';
import { CustomField, CustomFieldValue } from './customField';

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
  customFields: { [key: CustomField['id']]: CustomFieldValue };
};
