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
              className="p-2 rounded w-full bg-background-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-50 border: border-background-secondary transition-all duration-200 ease-in-out focus:bg-background-secondary"
            />
          </div>

          <div className="mb-4 relative w-full">
            <label htmlFor="color" className="block text-text-primary text-xs">
              Color
            </label>
            <button
              className="w-full px-4 py-2 rounded-lg flex justify-between items-center relative bg-background-primary text-text-primary border border-background-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-50 transition-all duration-text capitalize text-left focus:bg-background-secondary"
              onClick={() => setStatusDropDownOpen(!statusDropDownOpen)}
            >
              <div className='flex gap-2 items-center'>
                <div
                  className={`rounded-full aspect-square h-[1rem] bg-${formData.color}-300`}
                />
                {formData.color}
              </div>
              <TiArrowSortedDown
                className={`${
                  statusDropDownOpen ? 'rotate-0' : 'rotate-90'
                } transition-all text-text-primary duration-text`}
              />
            </button>
            {statusDropDownOpen && (
              <div
                className="absolute right-0 top-full w-3/4 !mt-0 bg-background-secondary border border-accent-primary rounded-lg shadow-light text-text-primary z-50 h-[20dvh] overflow-y-scroll"
                ref={colorDropDownRef}
              >
                {TAILWIND_COLORS.map((color: TailwindColor) => (
                  <button
                    key={color}
                    className={`flex gap-2 items-center px-4 py-2 text-sm hover:bg-background-primary rounded-lg w-full text-left capitalize transition-all duration-bg ease-in-out z-1 ${
                      formData.color === color
                        ? 'bg-background-primary text-text-primary'
                        : 'text-text-secondary'
                    }`}
                    role="menuitem"
                    onClick={() => {
                      setFormData({ ...formData, color });
                      setStatusDropDownOpen(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setFormData({ ...formData, color });
                        setStatusDropDownOpen(false);
                      }
                    }}
                  >
                    <div
                      className={`rounded-full aspect-square h-[1rem] bg-${color}-300`}
                    />
                    {color}
                  </button>
                ))}
              </div>
            )}
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
              className="bg-accent-primary hover:bg-accent-hover text-white px-4 py-2 rounded transition-colors duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
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
