import React, { JSX, useState, useEffect } from 'react';
import { Job, JobNotSavedInDB } from '../../../types/job';
import { ToolTip } from '../../ToolTip/ToolTip';
import { UrlPreviewCard } from '../../URLPreviewCard/URLPreviewCard';
import { TiWarningOutline } from 'react-icons/ti';
import { TagEditor } from '../../TagEditor/TagEditor';
import { StatusPickerComponent } from '../../StatusPickerComponent/StatusPickerComponent';
import { JobStatus } from '../../../types/jobStatus';
import { useTranslation } from 'react-i18next';
import { CustomFieldsSection } from '../../JobDetails/CustomFieldsSection/CustomFieldsSection';
import { CustomFieldValue } from '../../../types/customField';
import { useTagStore } from '../../../context/tagStore';
import { Tag } from '../../../types/tag';
import { getRandomTailwindColor } from '../../../utils/generateRandomColor';
import { Timestamp } from 'firebase/firestore';

export interface EditJobModalProps {
  job: Job;
  onSave: (updatedJob: Job) => void;
  onClose: () => void;
  onDelete: (job: Job) => void;
}

export function EditJobModal({
  job,
  onSave,
  onClose,
  onDelete,
}: EditJobModalProps): JSX.Element {
  const { createTag, addTagToJob, removeTagFromJob, tagMap } =
    useTagStore.getState();

  const [formData, setFormData] = useState<Job>(job);
  const [newTags, setNewTags] = useState<Partial<Tag>[]>([]);

  const [customFieldsAreValid, setCustomFieldsAreValid] =
    useState<boolean>(true);

  const updatedAtDate: Date = job.timestamps.updatedAt.toDate
    ? job.timestamps.updatedAt.toDate()
    : new Date();

  const { t } = useTranslation();

  // time until user can send a request again (rate-limiting)
  const [timeRemaining, setTimeRemaining] = useState(0);

  const [attributeDropDownOpen, setAttributeDropDownOpen] = useState(false);
  useEffect(() => {
    if (!job.timestamps.updatedAt) return;

    const updateTimeRemaining = () => {
      const timeSinceUpdate = new Date().getTime() - updatedAtDate.getTime();
      const remaingSeconds = Math.max(
        0,
        30 - Math.floor(timeSinceUpdate / 1000)
      );
      setTimeRemaining(remaingSeconds);
    };

    updateTimeRemaining();

    // update every second
    const interval = setInterval(updateTimeRemaining, 1000);

    // unmount
    return () => clearInterval(interval);
  }, [job.timestamps.updatedAt, updatedAtDate]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleTagsChange = (
    tagIds: Tag['id'][],
    localNewTags: Partial<Tag>[]
  ) => {
    setFormData((prevData) => ({
      ...prevData,
      tagIds: tagIds,
    }));
    setNewTags(localNewTags);
  };

  const handleSave = async () => {
    if (!formData.company || !formData.position) return;

    const newTagIds: Tag['id'][] = [];

    const updatedJob: Job = {
      ...job,
      ...formData,
    };

    // Create new tags first
    for (const newTag of newTags) {
      if (newTag.name) {
        const tagId = await createTag({
          name: newTag.name,
          color: newTag.color || getRandomTailwindColor().tailwindColorName,
        } as Partial<Tag>);

        if (tagId) {
          newTagIds.push(tagId);
        }
      }
    }

    // Compare original job tags with updated job tags
    const originalTagIds = new Set(job.tagIds || []);
    const updatedTagIds = new Set(updatedJob.tagIds || []);

    // Find tags that were added (present in updated but not in original)
    const addedTagIds = [...updatedTagIds].filter(
      (id) => !originalTagIds.has(id)
    );

    // Find tags that were removed (present in original but not in updated)
    const removedTagIds = [...originalTagIds].filter(
      (id) => !updatedTagIds.has(id)
    );

    // Process tag updates
    const tagUpdatePromises = [];

    // Handle tag additions (for existing tags that weren't newly created)
    for (const tagId of addedTagIds) {
      if (tagId && tagMap[tagId]) {
        // Only process existing tags, not new ones we just created
        tagUpdatePromises.push(addTagToJob(job.id, tagId));
      }
    }

    // Handle tag removals
    for (const tagId of removedTagIds) {
      if (tagId) {
        tagUpdatePromises.push(removeTagFromJob(job.id, tagId));
      }
    }

    // Wait for all tag updates to complete
    await Promise.all(tagUpdatePromises);

    onSave(updatedJob);
    onClose();
  };

  const handleDelete = () => {
    onDelete(job);
    onClose();
  };

  return (
    <div
      className={`flex items-stretch justify-between ${formData.URL ? 'w-[50dvw]' : 'w-[25dvw]'}`}
    >
      <div className={`${formData.URL ? 'w-[50%]' : 'w-full'}`}>
        <div
          className="flex-1 flex-grow flex flex-col w-full items-center"
          id='"edit-job-modal--form">'
        >
          <h2 className="text-xl font-semibold mb-4 text-text-primary text-center transition-all duration-text">
            {t('modals.job.edit.title')}
          </h2>
          <span className="text-xs text-text-secondary">
            {t('modals.job.edit.job-id')}: <i>{formData.id}</i>
          </span>
        </div>
        <div className="w-full space-y-4 overflow-y-scroll mb-4 p-2">
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
                id="company"
                name="company"
                placeholder={t('modals.job.shared.company-placeholder')}
                value={formData.company}
                onChange={handleChange}
                required
                className="p-2 rounded w-full bg-background-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50 border: border-background-secondary transition-all duration-200 ease-in-out focus:bg-background-secondary"
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
                id="position"
                name="position"
                placeholder={t('modals.job.shared.position-placeholder')}
                value={formData.position}
                onChange={handleChange}
                className="p-2 rounded w-full bg-background-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50 border: border-background-secondary transition-all duration-200 ease-in-out focus:bg-background-secondary"
              />
            </div>
            <div className="w-full">
              <label className="text-text-primary block text-xs">
                {t('modals.job.shared.status')}
              </label>
              <StatusPickerComponent
                initialStatusID={formData.statusID}
                onSelect={(status: JobStatus) =>
                  setFormData({ ...job, statusID: status.id })
                }
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
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder={t('modals.job.shared.location-placeholder')}
                  className="w-full px-4 py-2 rounded-lg
                     bg-background-primary 
                     text-text-primary
                     border border-background-secondary
                     focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50 focus:bg-background-secondary
                     placeholder-text-secondary/50
                     transition-all duration-text"
                />
              </div>

              <div className="w-full">
                <label
                  htmlFor="URL"
                  className="text-text-primary block text-xs"
                >
                  {t('modals.job.shared.URL')}
                </label>
                <input
                  type="url"
                  id="URL"
                  name="URL"
                  placeholder={t('modals.job.shared.URL-placeholder')}
                  value={formData.URL}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-background-primary text-text-primary border border-background-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50 focus:bg-background-secondary placeholder-text-secondary/50 transition-all duration-text"
                />
              </div>
              <div className="w-full">
                <label className="text-text-primary block text-xs">
                  {t('modals.job.shared.tags')}
                </label>
                <TagEditor
                  tagIds={formData.tagIds || []}
                  onTagsChange={handleTagsChange}
                />
              </div>

              {/* Custom Fields Section */}
              <div className="w-full">
                <CustomFieldsSection
                  job={formData as JobNotSavedInDB}
                  onValid={() => setCustomFieldsAreValid(true)}
                  onInvalid={() => setCustomFieldsAreValid(false)}
                  onChange={(value: CustomFieldValue) => {
                    setFormData((prevData) => ({
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
        </div>
        <div className="py-2">
          {job.timestamps.updatedAt && (
            <div className="mb-2 flex justify-center items-center">
              <span className="text-xs text-text-secondary transition-all duration-text">
                {t('modals.shared.last-updated', {
                  date: updatedAtDate.toLocaleDateString(),
                  time: updatedAtDate.toLocaleTimeString(),
                })}
              </span>
            </div>
          )}
          <div className="mt-2 flex justify-center space-x-3">
            <button
              onClick={handleSave}
              className="bg-blue-300 hover:bg-blue-400 text-white px-4 py-2 rounded transition-colors duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={
                !formData.position ||
                !formData.company ||
                timeRemaining > 0 ||
                !customFieldsAreValid
              }
            >
              {t('common.save')}
            </button>
            <button
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors duration-200 ease-in-out"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={timeRemaining > 0}
            >
              {t('common.delete')}
            </button>
          </div>

          {timeRemaining > 0 && (
            <div className="mt-1 flex flex justify-center items-center gap-1">
              <span className="text-xs text-text-secondary transition-all duration-text">
                {t('modals.shared.edit-wait-timer', { count: timeRemaining })}
              </span>
              <ToolTip
                text={t('modals.shared.rate-limit-message-tt')}
                position="bottom"
              >
                <TiWarningOutline className="text-xs text-text-secondary transition-all duration-text" />
              </ToolTip>
            </div>
          )}
        </div>
      </div>
      {formData.URL && (
        <div className="flex flex-col flex-1 flex-grow items-center min-h-full">
          <span className="text-text-secondary text-md hover:underline">
            {t('modals.job.edit.external-link-warning')}
          </span>
          <div className="flex-1 flex items-center justify-center w-full">
            <div className="w-[50%] aspect-square max-w-[100%] max-h-[100%]">
              <UrlPreviewCard job={formData} size="large" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
