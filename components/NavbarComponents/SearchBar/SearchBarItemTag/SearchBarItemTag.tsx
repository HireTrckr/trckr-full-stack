import React, { JSX } from 'react';
import { Tag } from '../../../../types/tag';
import { TagCard } from '../../../TagCard/TagCard';

interface SearchBarItemTagProps {
  tag: Tag;
}

export function SearchBarItemTag({ tag }: SearchBarItemTagProps): JSX.Element {
  return <TagCard tag={tag} onRemoveButtonClick={() => {}} editable={false} />;
}
