import { useState } from 'react';
import { useJobStore } from '../../context/jobStore';
import { TiArrowSortedDown } from 'react-icons/ti';
import { Job, JobNotSavedInDB, statusOptions } from '../../types/job';
import { Tag } from '../../types/tag';
import React, { useEffect } from 'react';
import { useTagStore } from '../../context/tagStore';
import { TagEditor } from '../TagEditor/TagEditor';

// Define the NewTag interface to match what's in the TagEditor
interface NewTag extends Tag {
  isNew: boolean;
}

export function JobForm() {
  const { addJob } = useJobStore();
  const { createTag } = useTagStore();

  const [job, setJob] = useState<JobNotSavedInDB>({
    company: '',
    position: '',
    status: 'applied',
    location: '',
    URL: '',
    tagIds: [],
  });

  // Track new tags created during form session
  const [newTags, setNewTags] = useState<NewTag[]>([]);

  const [statusDropDownOpen, setStatusDropDownOpen] = useState(false);
  const [attributeDropDownOpen, setAttributeDropDownOpen] = useState(false);

  const statusDropDownRef = React.useRef<HTMLDivElement>(null);
  const statusDropDownButtonRef = React.useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        statusDropDownButtonRef.current &&
        statusDropDownButtonRef.current.contains(event.target as Node)
      ) {
        // do nothing as button logic will handle it
      } else if (
        statusDropDownRef.current &&
        !statusDropDownRef.current.contains(event.target as Node)
      ) {
        setStatusDropDownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handler for tag changes
  const handleTagsChange = (tagIds: Tag['id'][], localNewTags?: NewTag[]) => {
    setJob({ ...job, tagIds });
    if (localNewTags) {
      setNewTags(localNewTags);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job.company || !job.position) return;

    // save any new tags to Firestore
    for (const newTag of newTags) {
      if (await createTag(newTag.name)) {
        setJob((prevJob) => ({
          ...prevJob,
          tagIds: [...(prevJob.tagIds || []), newTag.id],
        }));
      }
      // tag creation failute - do nothing?
    }

    if (!(await addJob(job))) {
      // job failure
    }

    setJob({
      company: '',
      position: '',
      status: 'applied' as Job['status'],
      location: '',
      URL: '',
      tagIds: [] as Job['tagIds'],
    });
    setNewTags([]);
  };

  return (
    <>
      <div className="flex justify-center items-center mb-6">
        <h2 className="text-2xl font-semibold text-text-primary flex items-center transition-colors duration-text capitalize">
          track a new application
        </h2>
      </div>
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div className="space-y-3 relative">
          <input
            type="text"
            placeholder="Company*"
            className="w-full px-4 py-2 rounded-lg
                     bg-background-primary 
                     text-text-primary
                     border border-background-secondary
                     focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50 focus:bg-background-secondary
                     placeholder-text-secondary/50
                     transition-all duration-text"
            value={job.company}
            onChange={(e) => setJob({ ...job, company: e.target.value })}
          />
          <input
            type="text"
            placeholder="Position*"
            className="w-full px-4 py-2 rounded-lg
                     bg-background-primary 
                     text-text-primary
                     border border-background-secondary
                     focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50 focus:bg-background-secondary
                     placeholder-text-secondary/50
                     transition-all duration-text"
            value={job.position}
            onChange={(e) => setJob({ ...job, position: e.target.value })}
          />

          <button
            className="w-full px-4 py-2 rounded-lg flex justify-between items-center relative bg-background-primary text-text-primary border border-background-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50 transition-all duration-text capitalize text-left"
            onClick={() => setStatusDropDownOpen(!statusDropDownOpen)}
            ref={statusDropDownButtonRef}
          >
            {job.status}
            <TiArrowSortedDown
              className={`${
                statusDropDownOpen ? 'rotate-0' : 'rotate-90'
              } transition-all text-text-primary duration-text`}
            />
          </button>
          {statusDropDownOpen && (
            <div
              className="absolute right-0 top-full w-3/4 !mt-0 bg-background-secondary border border-accent-primary rounded-lg shadow-light text-text-primary z-50"
              ref={statusDropDownRef}
            >
              {statusOptions.map((status: Job['status']) => (
                <button
                  key={status}
                  className={`block px-4 py-2 text-sm hover:bg-background-primary rounded-lg w-full text-left capitalize transition-all duration-bg ease-in-out z-1 ${
                    job.status === status
                      ? 'bg-background-primary text-text-primary'
                      : 'text-text-secondary'
                  }`}
                  role="menuitem"
                  onClick={() => {
                    setJob({ ...job, status });
                    setStatusDropDownOpen(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setJob({ ...job, status });
                      setStatusDropDownOpen(false);
                    }
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-full flex items-center justify-center">
          <button
            onClick={() => setAttributeDropDownOpen(!attributeDropDownOpen)}
          >
            <span className="text-center text-text-secondary transition-all duration-text capitalize text-sm">
              view {attributeDropDownOpen ? 'less' : 'more'}
            </span>
          </button>
        </div>

        {attributeDropDownOpen && (
          <>
            <input
              type="text"
              placeholder="Location"
              className="w-full px-4 py-2 rounded-lg
                     bg-background-primary 
                     text-text-primary
                     border border-background-secondary
                     focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50 focus:bg-background-secondary
                     placeholder-text-secondary/50
                     transition-all duration-text"
              value={job.location}
              onChange={(e) => setJob({ ...job, location: e.target.value })}
            />

            <input
              type="url"
              placeholder="URL"
              className="w-full px-4 py-2 rounded-lg bg-background-primary text-text-primary border border-background-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50 focus:bg-background-secondary placeholder-text-secondary/50 transition-all duration-text"
              value={job?.URL}
              onChange={(e) => setJob({ ...job, URL: e.target.value })}
            ></input>

            <TagEditor
              tagIds={job.tagIds || []}
              onTagsChange={handleTagsChange}
            />
          </>
        )}

        <button
          type="submit"
          className="w-full px-4 py-2 rounded-lg bg-accent-primary hover:bg-accent-primary/90 text-white font-medium transition-all duration-bg disabled:opacity-50 disabled:cursor-not-allowed capitalize focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50"
          disabled={!job.company || !job.position}
        >
          add job
        </button>
      </form>
    </>
  );
}
