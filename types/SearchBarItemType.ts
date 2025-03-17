import { Job } from './job';
import { Tag } from './tag';

export type SearchableItem =
  | {
      type: 'job';
      item: Job;
    }
  | {
      type: 'tag';
      item: Tag;
    };

// allows looping through (key = id)
export type SearchResult = {
  id: string;
} & SearchableItem;

export const isJob = (item: Job | Tag): item is Job => {
  return (item as Job).company !== undefined;
};

export const isTag = (item: Job | Tag): item is Tag => {
  return (item as Tag).name !== undefined;
};
