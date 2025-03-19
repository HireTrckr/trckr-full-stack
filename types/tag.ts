import { timestamps } from './timestamps';

export type Tag = TagNotSavedInDB & {
  id: string;
  timestamps: timestamps;
};

export type TagNotSavedInDB = {
  name: string;
  color: string;
  count: number;
};

export interface TagMap {
  [key: string]: Tag;
}
