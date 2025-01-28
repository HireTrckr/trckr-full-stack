import React, { JSX, useState } from "react";
import { Job } from "../../context/jobStore";

export default function EditJobModal({
  job,
  onSave,
  onClose,
}: {
  job: Job;
  onSave: (updatedJob: Job) => void;
  onClose: () => void;
}): JSX.Element {
  const [formData, setFormData] = useState<Job>(job);

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

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2>Edit Job</h2>

        <div className="mb-4">
          <label htmlFor="title" className="block">
            Job Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.position}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="company" className="block">
            Company
          </label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="status" className="block">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          >
            <option value="applied">Applied</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="mt-4">
          <button
            onClick={handleSave}
            className="bg-green-500 text-white px-4 py-2 rounded mr-2"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
