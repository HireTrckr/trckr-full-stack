import React, { JSX, useState } from 'react';
import { Job } from '../../../../types/job';
import { Tag } from '../../../../types/tag';
import { useTagStore } from '../../../../context/tagStore';
import { TagCard } from '../../../TagCard/TagCard';

interface SearchBarItemJobProps {
  job: Job;
}

export function SearchBarItemJob({ job }: SearchBarItemJobProps): JSX.Element {
  const getTagsFromJob = useTagStore((state) => state.getTagsFromJob);

  const [tags] = useState<Tag[]>(getTagsFromJob(job));

  return (
    <div className="flex gap-2">
      <div className="rounded-lg">
        <button className="h-10 w-10 rounded-lg bg-background-secondary flex items-center justify-center">
          <span className="text-text-primary text-2xl">
            {job.company?.charAt(0).toUpperCase()}
          </span>
        </button>
      </div>

      <div className="flex flex-col justify-evenly">
        <div className="flex items-center gap-5">
          <div>
            <span className="text-text-primary">{job.position}</span>
            <span className="text-text-secondary">
              {job.company ? `, ${job.company}` : ''}
            </span>
          </div>
        </div>
        {job.location && (
          <span className="text-text-secondary text-xs">{job.location}</span>
        )}
      </div>

      {tags && (
        <div
          className={`flex flex ${
            job.location ? 'items-start' : 'items-center'
          } gap-2`}
        >
          {tags.map((_tag) => (
            <TagCard
              tag={_tag}
              key={_tag.id}
              onRemoveButtonClick={() => {}}
              editable={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
