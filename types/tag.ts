import { TailwindColorName } from './tailwindColor';
import { timestamps } from './timestamps';

export type Tag = {
  id: string;
  timestamps: timestamps;
  name: string;
  color: TailwindColorName;
  count: number;
};

export type TagNotSavedInDB = Omit<Tag, 'id' | 'timestamps'>;

export interface TagMap {
  [key: string]: Tag;
}
