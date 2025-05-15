import React, { JSX, useState, useEffect } from 'react';
import { ToolTip } from '../../ToolTip/ToolTip';
import { TiWarningOutline } from 'react-icons/ti';
import { Tag } from '../../../types/tag';
import { ColorPicker } from '../../ColorPicker/ColorPicker';
import { getTailwindColorObjectFromName } from '../../../utils/getTailwindColorObject';
import { useTranslation } from 'react-i18next';
import { useJobStore } from '../../../context/jobStore';
import { Job } from '../../../types/job';
import { getGridRowsClassName } from '../CreateTagModal/CreateTagModal';

export interface EditTagModalProps {
  tag: Tag;
  onSave: (updatedTag: Tag, tagJobs: Job[]) => void;
  onClose: () => void;
  onDelete: (tag: Tag) => void;
}

export function EditTagModal({
  tag,
  onSave,
  onClose,
  onDelete,
}: EditTagModalProps): JSX.Element {
  const [formData, setFormData] = useState<Tag>(tag);

  // time until user can send a request again (rate-limiting)
  const [timeRemaining, setTimeRemaining] = useState(0);
  const { jobs, getJobsWithTags } = useJobStore.getState();

  const [selectedJobs, setSelectedJobs] = useState<Job[]>(
    getJobsWithTags([tag.id]) || []
  );

  const updatedAtDate: Date = tag.timestamps.updatedAt.toDate
    ? tag.timestamps.updatedAt.toDate()
    : new Date();

  const { t } = useTranslation();

  useEffect(() => {
    if (!tag.timestamps.updatedAt) return;

    const updateTimeRemaining = () => {
      const timeSinceUpdate = Date.now() - updatedAtDate.getTime();
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
  }, [tag.timestamps?.updatedAt]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSave = () => {
    const updatedTag: Tag = {
      ...tag,
      ...formData,
    };
    onSave(updatedTag, selectedJobs);
    onClose();
  };

  const handleDelete = () => {
    onDelete(tag);
    onClose();
  };

  return (
    <div
      className="flex flex-col items-center w-[25dvw] max-w-[25dvw]"
      id="edit-tag-modal--form"
    >
      <h2 className="text-xl font-semibold mb-4 text-text-primary text-center transition-all duration-text w-full">
        {t('modals.tag.edit.title')}
      </h2>

      <span className="text-xs text-text-secondary">
        {t('modals.tag.edit.tag-id')}: <i>{formData.id}</i>
      </span>

      <div className="mb-4 w-full">
        <label htmlFor="name" className="block text-text-primary text-xs">
          {t('modals.tag.shared.name')}
        </label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder={t('modals.tag.shared.name-placeholder')}
          value={formData.name}
          onChange={handleChange}
          className="p-2 rounded w-full bg-background-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50 border: border-background-secondary transition-all duration-200 ease-in-out focus:bg-background-secondary"
        />
      </div>

      <div className="mb-4 w-full">
        <label htmlFor="color" className="block text-text-primary text-xs">
          {t('modals.tag.shared.color')}
        </label>
        <ColorPicker
          color={getTailwindColorObjectFromName(formData.color)}
          onColorSelect={(color) => {
            setFormData({
              ...formData,
              color: color.tailwindColorName,
            });
          }}
        />
      </div>

      <div
        className="mb-4 w-full max-w-full"
        id="create-tag-modal-form--tag-job-picker-container"
      >
        <label htmlFor="jobs" className="text-text-primary text-xs">
          {t('common.jobs_other')}: {formData.count}
        </label>
        <div className="w-full overflow-x-scroll">
          <div
            className={`grid ${getGridRowsClassName(jobs.length)} grid-flow-col auto-cols-[66%] min-w-full`}
          >
            {jobs.map((job) => (
              <div
                key={job.id}
                className="flex gap-2 items-center p-2 hover:bg-background-primary cursor-pointer rounded-lg transition-all duration-bg shrink-0"
                onClick={() => {
                  if (selectedJobs.includes(job)) {
                    setSelectedJobs(selectedJobs.filter((j) => j !== job));
                    setFormData({
                      ...formData,
                      count: formData.count - 1,
                    });
                  } else {
                    setSelectedJobs([...selectedJobs, job]);
                    setFormData({
                      ...formData,
                      count: formData.count + 1,
                    });
                  }
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedJobs.includes(job)}
                  readOnly
                />
                <div className="flex flex-col">
                  <span className="text-text-primary text-sm">
                    {job.position}
                  </span>
                  <span className="text-text-secondary text-xs">
                    {job.company}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {tag.timestamps.updatedAt && (
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
          disabled={!formData.name || !formData.color || timeRemaining > 0}
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
  );
}
