import React, { JSX, useState, useEffect } from 'react';
import { Job, statusOptions } from '../../types/job';
import { ToolTip } from '../ToolTip/ToolTip';
import { UrlPreviewCard } from '../URLPreviewCard/URLPreviewCard';
import { TiArrowSortedDown, TiWarningOutline } from 'react-icons/ti';
import { TagEditor } from '../TagEditor/TagEditor';

export function EditJobModal({
  job,
  onSave,
  onClose,
  onDelete,
}: {
  job: Job;
  onSave: (updatedJob: Job) => void;
  onClose: () => void;
  onDelete: (job: Job) => void;
}): JSX.Element {
  const [formData, setFormData] = useState<Job>(job);

  // time until user can send a request again (rate-limiting)
  const [timeRemaining, setTimeRemaining] = useState(0);

  const [statusDropDownOpen, setStatusDropDownOpen] = useState<boolean>(false);

  const modalRef = React.useRef<HTMLDivElement>(null);
  const statusDropDownRef = React.useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center backdrop-blur-sm z-50">
      <div
        className={`bg-background-secondary rounded-lg transition-all duration-bg ease-in-out flex shadow-light ${
          job.URL ? 'w-[50dvw]' : 'w-[25dvw]'
        }`}
        ref={modalRef}
      >
        <div className="flex-1 flex-grow p-6">
          <h2 className="text-xl font-semibold mb-4 text-text-primary text-center transition-all duration-text">
            Edit Job
          </h2>

          <div className="mb-4">
            <label
              htmlFor="position"
              className="block text-text-primary text-xs"
            >
              Position
            </label>
            <input
              type="text"
              id="position"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="p-2 rounded w-full bg-background-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-50 border: border-background-secondary transition-all duration-200 ease-in-out focus:bg-background-secondary"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="company"
              className="block text-text-primary text-xs"
            >
              Company
            </label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="p-2 rounded w-full bg-background-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-50 border: border-background-secondary transition-all duration-200 ease-in-out focus:bg-background-secondary"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="location"
              className="block text-text-primary text-xs"
            >
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="p-2 rounded w-full bg-background-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-50 border: border-background-secondary transition-all duration-200 ease-in-out focus:bg-background-secondary"
            />
          </div>

          <div className="mb-4 relative">
            <label htmlFor="status" className="block text-text-primary text-xs">
              Status
            </label>
            <button
              className="w-full px-4 py-2 rounded-lg flex justify-between items-center relative bg-background-primary text-text-primary border border-background-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-50 transition-all duration-text capitalize text-left focus:bg-background-secondary"
              onClick={() => setStatusDropDownOpen(!statusDropDownOpen)}
            >
              {formData.status}
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
                      formData.status === status
                        ? 'bg-background-primary text-text-primary'
                        : 'text-text-secondary'
                    }`}
                    role="menuitem"
                    onClick={() => {
                      setFormData({ ...formData, status });
                      setStatusDropDownOpen(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setFormData({ ...formData, status });
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

          <div className="mb-4">
            <label htmlFor="URL" className="block text-text-primary text-xs">
              URL
            </label>
            <input
              type="url"
              id="URL"
              name="URL"
              placeholder="e.g. https://www.hiretrkr.com"
              value={formData.URL}
              onChange={handleChange}
              className="p-2 rounded w-full bg-background-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-50 border: border-background-secondary transition-all duration-200 ease-in-out focus:bg-background-secondary"
            />
          </div>

          <div className="mb-4">
            <TagEditor
              tagIds={formData.tagIds || []}
              onTagsChange={(tagIds) => {
                setFormData((prevData) => ({ ...prevData, tagIds: tagIds }));
              }}
            />
          </div>

          {job.timestamps?.updatedAt && (
            <div className=" mb-4 flex justify-center items-center">
              <span className="text-xs text-text-secondary transition-all duration-text">
                Last Updated at: {job.timestamps.updatedAt.toLocaleString()}
              </span>
            </div>
          )}

          <div className="mt-2 flex justify-center space-x-3">
            <button
              onClick={handleSave}
              className="bg-accent-primary hover:bg-accent-hover text-white px-4 py-2 rounded transition-colors duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
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

        {job.URL && (
          <div className="flex flex-1 flex-grow p-6 items-center justify-center">
            <div className="w-[75%] h-[75%] max-w-[100%] max-h-[100%]">
              <UrlPreviewCard job={job} size="large" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
