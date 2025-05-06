import { use, useState } from 'react';
import { useJobStore } from '../../context/jobStore';
import { Job, JobNotSavedInDB } from '../../types/job';
import { Tag } from '../../types/tag';
import { useTagStore } from '../../context/tagStore';
import { TagEditor } from '../TagEditor/TagEditor';
import { JobStatus } from '../../types/jobStatus';
import { StatusPickerComponent } from '../StatusPickerComponent/StatusPickerComponent';
import { NewTag } from '../TagEditor/TagEditor';
import { useTranslation } from 'react-i18next';
import { CustomFieldsSection } from '../JobDetails/CustomFieldsSection/CustomFieldsSection';
import { CustomFieldValue } from '../../types/customField';

export function JobForm() {
  const { addJob } = useJobStore();
  const { createTag } = useTagStore();

  const [job, setJob] = useState<JobNotSavedInDB>({
    company: '',
    position: '',
    statusID: 'not-applied' as JobStatus['id'],
    location: '',
    URL: '',
    tagIds: [],
    customFields: {},
  });

  const [customFieldsAreValid, setCustomFieldsAreValid] =
    useState<boolean>(true);

  // Track new tags created during form session
  const [newTags, setNewTags] = useState<NewTag[]>([]);

  const [attributeDropDownOpen, setAttributeDropDownOpen] = useState(false);

  const { t } = useTranslation();

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
      statusID: 'not-applied',
      location: '',
      URL: '',
      tagIds: [] as Job['tagIds'],
      customFields: {},
    });
    setNewTags([]);
  };

  return (
    <>
      <div className="flex justify-center items-center mb-6">
        <h2 className="text-2xl font-semibold text-text-primary flex items-center transition-colors duration-text">
          {t('job-form.title')}
        </h2>
      </div>
      <form
        onSubmit={handleSubmit}
        className="w-full space-y-4 overflow-y-scroll mb-4 p-2"
      >
        <div className="space-y-3 relative">
          <div className="w-full">
            <label
              htmlFor="company"
              className="text-text-primary block text-xs"
            >
              {t('modals.job.shared.company')}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              placeholder={t('modals.job.shared.company-placeholder')}
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
          </div>

          <div className="w-full">
            <label
              htmlFor="position"
              className="text-text-primary block text-xs"
            >
              {t('modals.job.shared.position')}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              placeholder={t('modals.job.shared.position-placeholder')}
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
          </div>

          <div className="w-full">
            <label className="text-text-primary block text-xs">
              {t('modals.job.shared.status')}
            </label>
            <StatusPickerComponent
              initialStatusID={job.statusID}
              onSelect={(status: JobStatus) => {
                setJob({ ...job, statusID: status.id });
              }}
            />
          </div>
        </div>

        <div className="w-full flex items-center justify-center">
          <button
            onClick={() => setAttributeDropDownOpen(!attributeDropDownOpen)}
            type="button"
          >
            <span className="text-center text-text-secondary transition-all duration-text capitalize text-sm">
              {t(`common.view-${attributeDropDownOpen ? 'less' : 'more'}`)}
            </span>
          </button>
        </div>

        {attributeDropDownOpen && (
          <>
            <div>
              <label
                htmlFor="location"
                className="text-text-primary block text-xs"
              >
                {t('modals.job.shared.location')}
              </label>
              <input
                type="text"
                placeholder={t('modals.job.shared.location-placeholder')}
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
            </div>

            <div className="w-full">
              <label htmlFor="URL" className="text-text-primary block text-xs">
                {t('modals.job.shared.URL')}
              </label>
              <input
                type="url"
                placeholder={t('modals.job.shared.URL-placeholder')}
                className="w-full px-4 py-2 rounded-lg bg-background-primary text-text-primary border border-background-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50 focus:bg-background-secondary placeholder-text-secondary/50 transition-all duration-text"
                value={job?.URL}
                onChange={(e) => setJob({ ...job, URL: e.target.value })}
              />
            </div>

            <div className="w-full">
              <label className="text-text-primary block text-xs">
                {t('modals.job.shared.tags')}
              </label>
              <TagEditor
                tagIds={job.tagIds || []}
                onTagsChange={handleTagsChange}
              />
            </div>

            <div className="w-full">
              <CustomFieldsSection
                job={job}
                onValid={() => setCustomFieldsAreValid(true)}
                onInvalid={() => setCustomFieldsAreValid(false)}
                onChange={(value: CustomFieldValue) => {
                  setJob((prevData) => ({
                    ...prevData,
                    customFields: {
                      ...prevData.customFields,
                      [value.fieldId]: value,
                    },
                  }));
                }}
              />
            </div>
          </>
        )}
      </form>
      <form>
        <button
          type="submit"
          className="w-full px-4 py-2 rounded-lg bg-accent-primary hover:brightness-[80%] text-text-accent font-medium transition-all duration-bg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50"
          disabled={!job.company || !job.position || !customFieldsAreValid}
        >
          {t('job-form.submit-button')}
        </button>
      </form>
    </>
  );
}
