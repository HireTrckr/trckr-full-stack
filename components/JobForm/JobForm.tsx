import { useState } from 'react';
import { useJobStore } from '../../context/jobStore';
import { Job, JobNotSavedInDB } from '../../types/job';
import { Tag } from '../../types/tag';
import { useTagStore } from '../../context/tagStore';
import { TagEditor } from '../TagEditor/TagEditor';
import { JobStatus } from '../../types/jobStatus';
import { StatusPickerComponent } from '../StatusPickerComponent/StatusPickerComponent';
import { NewTag } from '../TagEditor/TagEditor';

export function JobForm() {
  const { addJob } = useJobStore();
  const { createTag } = useTagStore();

  const [job, setJob] = useState<JobNotSavedInDB>({
    company: '',
    position: '',
    statusID: 'not applied' as JobStatus['id'],
    location: '',
    URL: '',
    tagIds: [],
  });

  // Track new tags created during form session
  const [newTags, setNewTags] = useState<NewTag[]>([]);

  const [attributeDropDownOpen, setAttributeDropDownOpen] = useState(false);

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

    for (const newTag of newTags) {
      if (
        await createTag({
          name: newTag.name,
          count: 1,
        } as Partial<Tag>)
      ) {
        setJob((prevJob) => ({
          ...prevJob,
          tagIds: [...(prevJob.tagIds || []), newTag.id],
        }));
      }
    }

    await addJob(job);
    setJob({
      company: '',
      position: '',
      statusID: 'not applied' as JobStatus['id'],
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

          <StatusPickerComponent
            initialStatusID={job.statusID}
            onSelect={(status: JobStatus) => {
              setJob({ ...job, statusID: status.id });
            }}
          />
        </div>

        <div className="w-full flex items-center justify-center">
          <button
            onClick={() => setAttributeDropDownOpen(!attributeDropDownOpen)}
            type="button"
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
            />

            <TagEditor
              tagIds={job.tagIds || []}
              onTagsChange={handleTagsChange}
            />
          </>
        )}

        <button
          type="submit"
          className="w-full px-4 py-2 rounded-lg bg-accent-primary hover:brightness-[80%] text-text-accent font-medium transition-all duration-bg disabled:opacity-50 disabled:cursor-not-allowed capitalize focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50"
          disabled={!job.company || !job.position}
        >
          add job
        </button>
      </form>
    </>
  );
}
