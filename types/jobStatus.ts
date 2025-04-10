import { TailwindColor, TailwindColorName } from './tailwindColor';
import { timestamps } from './timestamps';

export type JobStatus = JobStatusNotSavedInDB & {
  id: string;
  timestamps: timestamps;
};

export type JobStatusNotSavedInDB = {
  statusName: string;
  color: TailwindColorName;
  deletable: boolean;
};

export interface StatusMap {
  [key: string]: JobStatus;
}
