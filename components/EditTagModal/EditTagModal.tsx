import React, { JSX, useState, useEffect } from 'react';
import { Job, statusOptions } from '../../types/job';
import { ToolTip } from '../ToolTip/ToolTip';
import { UrlPreviewCard } from '../URLPreviewCard/URLPreviewCard';
import { TiArrowSortedDown, TiWarningOutline } from 'react-icons/ti';
import { TagEditor } from '../TagEditor/TagEditor';
import { Tag } from '../../types/tag';
import {
  TAILWIND_COLORS,
  TailwindColor,
} from '../../utils/generateRandomColor';
import { ColorPicker } from '../ColorPicker/ColorPicker';

interface EditTagModalProps {
  tag: Tag;
  onSave: (updatedTag: Tag) => void;
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

  const [statusDropDownOpen, setStatusDropDownOpen] = useState<boolean>(false);

  const modalRef = React.useRef<HTMLDivElement>(null);
  const colorDropDownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tag.timestamps.updatedAt) return;

    const updateTimeRemaining = () => {
      const timeSinceUpdate = Date.now() - tag.timestamps.updatedAt.getTime();
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
    const updatedTag: Tag = {
      ...tag,
      ...formData,
    };
    onSave(updatedTag);
    onClose();
  };

  const handleDelete = () => {
    onDelete(tag);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center backdrop-blur-sm z-50">
      <div
        className="bg-background-secondary rounded-lg transition-all duration-bg ease-in-out flex shadow-light w-[25dvw]"
        ref={modalRef}
      >
        <div className="flex-1 flex-grow p-6 flex flex-col items-center w-full">
          <h2 className="text-xl font-semibold mb-4 text-text-primary text-center transition-all duration-text w-full">
            Edit Tag
          </h2>

          <span className="text-xs text-text-secondary">
            TagID: <i>{formData.id}</i>
          </span>

          <div className="mb-4 w-full">
            <label htmlFor="name" className="block text-text-primary text-xs">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="p-2 rounded w-full bg-background-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50 border: border-background-secondary transition-all duration-200 ease-in-out focus:bg-background-secondary"
            />
          </div>

          <div className="mb-4 w-full">
            <ColorPicker
              color={formData.color}
              onColorSelect={(color) => {
                setFormData({ ...formData, color });
              }}
            />
          </div>

          {tag.timestamps?.updatedAt && (
            <div className="mb-2 flex justify-center items-center">
              <span className="text-xs text-text-secondary transition-all duration-text">
                Last Updated at: {tag.timestamps.updatedAt.toLocaleString()}
              </span>
            </div>
          )}

          <div className="mt-2 flex justify-center space-x-3">
            <button
              onClick={handleSave}
              className="bg-blue-300 hover:bg-blue-400 text-white px-4 py-2 rounded transition-colors duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!formData.name || !formData.color || timeRemaining > 0}
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
      </div>
    </div>
  );
}
