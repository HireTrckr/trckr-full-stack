import { timestamps } from './timestamps';

export type Tag = {
  id: string;
  name: string;
  color: string;
  count: number;
  timestamps: timestamps;
};

export interface TagMap {
  [key: string]: Tag;
}

export enum TagStatus {
  ACTIVE = 'active',
  DELETED = 'deleted',
}
