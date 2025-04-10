import React, { JSX, useState } from 'react';
import { JobStatusNotSavedInDB } from '../../../types/jobStatus';
import { getRandomTailwindColor } from '../../../utils/generateRandomColor';
import { getTailwindColorObjectFromName } from '../../../utils/getTailwindColorObject';
import { ColorPicker } from '../../ColorPicker/ColorPicker';

export interface CreateStatusModalProps {
  onSave: (newStatus: Partial<JobStatusNotSavedInDB>) => void;
  onCancel: () => void;
}

const getDefaultStatusObject = (): JobStatusNotSavedInDB => {
  return {
    statusName: '',
    color: getRandomTailwindColor().tailwindColorName,
    deletable: true,
  };
};

export function CreateStatusModal({
  onSave,
  onCancel,
}: CreateStatusModalProps): JSX.Element {
  const [formData, setFormData] = useState<JobStatusNotSavedInDB>(
    getDefaultStatusObject()
  );

  const handleSubmit = () => {
    onSave(formData);
  };

  const handleCancel = () => {
    onCancel();
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  return (
    <div
      className="flex flex-col items-center w-[25dvw] max-w-[25dvw]"
      id="create-status-modal--form"
    >
      <h2 className="text-xl font-semibold mb-4 text-text-primary text-center transition-all duration-text w-full">
        Create Status
      </h2>

      <div
        className="mb-4 w-full"
        id="create-status-modal-form--status-name-editor-container"
      >
        <label htmlFor="name" className="block text-text-primary text-xs">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="statusName"
          placeholder="Enter status name"
          value={formData.statusName}
          onChange={handleChange}
          className="p-2 rounded w-full bg-background-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50 border: border-background-secondary transition-all duration-200 ease-in-out focus:bg-background-secondary"
        />
      </div>

      <div
        className="mb-4 w-full"
        id="create-status-modal-form--status-color-picker-conatiner"
      >
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
        className="flex justify-center space-x-3"
        id="create-status-modal--buttons"
      >
        <button
          onClick={handleSubmit}
          disabled={!formData.statusName}
          className="bg-blue-300 hover:bg-blue-400 text-white px-4 py-2 rounded transition-colors duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save
        </button>
        <button
          onClick={handleCancel}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors duration-200 ease-in-out"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
