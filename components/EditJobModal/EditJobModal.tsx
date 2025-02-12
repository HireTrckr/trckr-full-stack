import React, { JSX, useState, useEffect } from "react";
import { Job } from "../../context/jobStore";

export default function EditJobModal({
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
  const modalRef = React.useRef<HTMLDivElement>(null);

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
        className="bg-background-secondary p-6 rounded-lg w-96 shadow-light transition-all duration-bg ease-in-out"
        ref={modalRef}
      >
        <h2 className="text-xl font-semibold mb-4 text-text-primary text-center transition-all duration-text">
          Edit Job
        </h2>

        <div className="mb-4">
          <label htmlFor="title" className="block text-text-primary text-xs">
            Position
          </label>
          <input
            type="text"
            id="title"
            name="title"
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

        <div className="mt-6 flex justify-center space-x-3">
          <button
            onClick={handleSave}
            className="bg-accent-primary hover:bg-accent-hover text-white px-4 py-2 rounded transition-colors duration-200 ease-in-out"
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
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors duration-200 ease-in-out"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
