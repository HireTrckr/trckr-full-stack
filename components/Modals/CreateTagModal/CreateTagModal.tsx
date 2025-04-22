import { useState } from 'react';
import { Tag, TagNotSavedInDB } from '../../../types/tag';
import { getTailwindColorObjectFromName } from '../../../utils/getTailwindColorObject';
import { getRandomTailwindColor } from '../../../utils/generateRandomColor';
import { ColorPicker } from '../../ColorPicker/ColorPicker';
import { Job } from '../../../types/job';
import { useJobStore } from '../../../context/jobStore';

const getGridRowsClassName = (jobCount: number) => {
  if (jobCount >= 3) return 'grid-rows-3';
  if (jobCount === 2) return 'grid-rows-2';
  if (jobCount === 1) return 'grid-rows-1';
  return ''; // or some default class
};

export interface CreateTagModalProps {
  onSave: (newTag: Partial<TagNotSavedInDB>, tagJobs: Job['id'][]) => void;
  onCancel: () => void;
}

export function CreateTagModal({ onSave, onCancel }: CreateTagModalProps) {
  const DEFAULT_TAG: TagNotSavedInDB = {
    name: '',
    color: getRandomTailwindColor().tailwindColorName,
    count: 0,
  };
  const [formData, setFormData] = useState<TagNotSavedInDB>(DEFAULT_TAG);
  const [selectedJobs, setSelectedJobs] = useState<Job[]>([]);

  const jobs = useJobStore((state) => state.jobs);

  const handleSubmit = () => {
    // create tag with name
    // add tag to each job
    // update tag with color and count
    onSave(
      formData,
      selectedJobs.map((job) => job.id)
    );
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
      id="create-tag-modal--form"
    >
      <h2 className="text-xl font-semibold mb-4 text-text-primary text-center transition-all duration-text w-full">
        Create Tag
      </h2>

      <div
        className="mb-4 w-full"
        id="create-tag-modal-form--tag-name-editor-container"
      >
        <label htmlFor="name" className="block text-text-primary text-xs">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder="Enter tag name"
          value={formData.name}
          onChange={handleChange}
          className="p-2 rounded w-full bg-background-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50 border: border-background-secondary transition-all duration-200 ease-in-out focus:bg-background-secondary"
        />
      </div>

      <div
        className="mb-4 w-full"
        id="create-tag-modal-form--tag-color-picker-conatiner"
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
        className="mb-4 w-full max-w-full"
        id="create-tag-modal-form--tag-job-picker-container"
      >
        <label htmlFor="jobs" className="text-text-primary text-xs">
          Jobs: {formData.count}
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

      <div
        className="flex justify-center space-x-3"
        id="create-tag-modal--buttons"
      >
        <button
          onClick={handleSubmit}
          disabled={!formData.name || formData.count <= 0}
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
