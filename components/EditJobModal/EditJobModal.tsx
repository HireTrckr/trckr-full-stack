import React, { JSX, useState, useEffect } from 'react';
import { Job } from '../../types/job';
import { ToolTip } from '../ToolTip/ToolTip';
import { UrlPreviewCard } from '../URLPreviewCard/URLPreviewCard';
import { TiArrowSortedDown, TiWarningOutline } from 'react-icons/ti';
import { TagEditor } from '../TagEditor/TagEditor';
import { StatusPickerComponent } from '../StatusPickerComponent/StatusPickerComponent';
import { JobStatus } from '../../types/jobStatus';

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
  const [formData, setFormData] = useState<Job>(job);

  // time until user can send a request again (rate-limiting)
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (!job.timestamps.updatedAt) return;

    const updateTimeRemaining = () => {
      const timeSinceUpdate = Date.now() - job.timestamps.updatedAt.getTime();
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
  }, [job.timestamps?.updatedAt]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSave = () => {
    const updatedJob: Job = {
      ...job,
      ...formData,
    };
    onSave(updatedJob);
    onClose();
  };

  const handleDelete = () => {
    onDelete(job);
    onClose();
  };

  return (
    <div
      className={`flex items-center ${formData.URL ? 'w-[50dvw]' : 'w-[25dvw]'}`}
    >
      <div
        className="flex-1 flex-grow flex flex-col w-full items-center"
        id='"edit-job-modal--form">'
      >
        <h2 className="text-xl font-semibold mb-4 text-text-primary text-center transition-all duration-text">
          Edit Job
        </h2>
        <span className="text-xs text-text-secondary">
          JobID: <i>{formData.id}</i>
        </span>

        <div className="mb-4 w-full">
          <label htmlFor="position" className="block text-text-primary text-xs">
            Position
          </label>
          <input
            type="text"
            id="position"
            name="position"
            value={formData.position}
            onChange={handleChange}
            className="p-2 rounded w-full bg-background-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50 border: border-background-secondary transition-all duration-200 ease-in-out focus:bg-background-secondary"
          />
        </div>

        <div className="mb-4 w-full">
          <label htmlFor="company" className="block text-text-primary text-xs">
            Company
          </label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="p-2 rounded w-full bg-background-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50 border: border-background-secondary transition-all duration-200 ease-in-out focus:bg-background-secondary"
          />
        </div>

        <div className="mb-4 w-full">
          <label htmlFor="location" className="block text-text-primary text-xs">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="p-2 rounded w-full bg-background-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50 border: border-background-secondary transition-all duration-200 ease-in-out focus:bg-background-secondary"
          />
        </div>

        <div className="mb-4 relative w-full">
          <label htmlFor="status" className="block text-text-primary text-xs">
            Status
          </label>
          <StatusPickerComponent
            initialStatusID={formData.statusID}
            onSelect={(status: JobStatus) =>
              setFormData({ ...job, statusID: status.id })
            }
          />
        </div>

        <div className="mb-4 w-full">
          <label htmlFor="URL" className="block text-text-primary text-xs">
            URL
          </label>
          <input
            type="url"
            id="URL"
            name="URL"
            placeholder="e.g. https://www.Trckr.com"
            value={formData.URL}
            onChange={handleChange}
            className="p-2 rounded w-full bg-background-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50 border: border-background-secondary transition-all duration-200 ease-in-out focus:bg-background-secondary"
          />
        </div>

        <div className="mb-4 w-full">
          <TagEditor
            tagIds={formData.tagIds || []}
            onTagsChange={(tagIds) => {
              setFormData((prevData) => ({ ...prevData, tagIds: tagIds }));
            }}
          />
        </div>

        {formData.timestamps?.updatedAt && (
          <div className="mb-2 flex justify-center items-center">
            <span className="text-xs text-text-secondary transition-all duration-text">
              Last Updated at: {formData.timestamps.updatedAt.toLocaleString()}
            </span>
          </div>
        )}

        <div className="mt-2 flex justify-center space-x-3">
          <button
            onClick={handleSave}
            className="bg-blue-300 hover:bg-blue-400 text-white px-4 py-2 rounded transition-colors duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={
              !formData.position || !formData.company || timeRemaining > 0
            }
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors duration-200 ease-in-out"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={timeRemaining > 0}
          >
            Delete
          </button>
        </div>

        {timeRemaining > 0 && (
          <div className="mt-1 flex flex justify-center items-center gap-1">
            <span className="text-xs text-text-secondary transition-all duration-text">
              Please wait {timeRemaining} second
              {timeRemaining != 1 ? 's' : ''} to edit again.
            </span>
            <ToolTip
              text="Rate limiting is enabled to prevent spam!"
              position="bottom"
            >
              <TiWarningOutline className="text-xs text-text-secondary transition-all duration-text" />
            </ToolTip>
          </div>
        )}
      </div>

      {formData.URL && (
        <div className="flex flex-1 flex-grow items-center justify-center">
          <div className="w-[75%] h-[75%] max-w-[100%] max-h-[100%]">
            <UrlPreviewCard job={job} size="large" />
          </div>
        </div>
      )}
    </div>
  );
}
