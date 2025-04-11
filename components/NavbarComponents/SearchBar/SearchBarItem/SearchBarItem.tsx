import React, { JSX } from 'react';
import { SearchableItem, SearchResult } from '../../types/SearchBarItemType';
import { Job } from '../../types/job';
import { SearchBarItemTag } from '../SearchBarItemTag/SearchBarItemTag';
import { SearchBarItemJob } from '../SearchBarItemJob/SearchBarItemJob';
import { Tag } from '../../types/tag';

interface SearchBarItemProps {
  item: SearchableItem;
}

export function SearchBarItem({ item }: SearchBarItemProps): JSX.Element {
  if (!item) {
    return <></>;
  }

  if (item.type === 'tag') {
    return <SearchBarItemTag tag={item.item as Tag} />;
  } else if (item.type === 'job') {
    return <SearchBarItemJob job={item.item as Job} />;
  }

  return <></>;
}
