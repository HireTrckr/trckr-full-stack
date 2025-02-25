import React, { JSX, useState, useEffect } from "react";
import { Job } from "../../types/job";
import { ToolTip } from "../ToolTip/ToolTip";
import { IoMdInformationCircleOutline } from "react-icons/io";

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

  const modalRef = React.useRef<HTMLDivElement>(null);

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

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    console.log(`${name}: ${value}`);
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

  console.log(new Date().getTime() - job.timestamps.updatedAt.getTime());

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center backdrop-blur-sm z-50">
      <div
        className="bg-background-secondary p-6 rounded-lg w-96 shadow-light transition-all duration-bg ease-in-out"
        ref={modalRef}
      >
        <h2 className="text-xl font-semibold mb-4 text-text-primary text-center transition-all duration-text">
          Edit Job
        </h2>

        <div className="mb-4">
          <label htmlFor="position" className="block text-text-primary text-xs">
            Position
          </label>
          <input
            type="text"
            id="position"
            name="position"
            value={formData.position}
            onChange={handleChange}
            className="p-2 rounded w-full bg-background-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-50 border: border-background-secondary transition-all duration-200 ease-in-out"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="company" className="block text-text-primary text-xs">
            Company
          </label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="p-2 rounded w-full bg-background-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-50 border: border-background-secondary transition-all duration-200 ease-in-out"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="location" className="block text-text-primary text-xs">
            Location
          </label>
          <input
            type="text"
            id="location"
            value={formData.location}
            onChange={handleChange}
            className="p-2 rounded w-full bg-background-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-50 border: border-background-secondary transition-all duration-200 ease-in-out"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="status" className="block text-text-primary text-xs">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="p-2 rounded w-full bg-background-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-50 transition-all duration-200 ease-in-out"
          >
            <option value="applied">Applied</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>
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
              Please wait {timeRemaining} second{timeRemaining != 1 ? "s" : ""} to edit again.
            </span>
            <ToolTip
              text="Rate limiting is enabled to prevent spam!"
              position="bottom"
            >
              <IoMdInformationCircleOutline className="text-xs text-text-secondary transition-all duration-text" />
            </ToolTip>
          </div>
        )}
      </div>
    </div>
  );
}
