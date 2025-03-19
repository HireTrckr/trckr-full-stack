import React, { JSX, useEffect, useRef } from 'react';
import { Job, statusOptions } from '../../types/job';
import { useState, memo } from 'react';
import { UrlPreviewCard } from '../URLPreviewCard/URLPreviewCard';
import { useTagStore } from '../../context/tagStore';
import { TagCard } from '../TagCard/TagCard';
import { Tag } from '../../types/tag';

export const JobListing = memo(
  function JobListing({
    job,
    onUpdate,
    onEdit,
    showControls,
    onDropdownOpen,
    onDropdownClose,
  }: {
    job: Job;
    onUpdate?: (updatedJob: Job) => void;
    onEdit: (jobId: Job['id']) => void;
    showControls: boolean;
    onDropdownOpen: () => void;
    onDropdownClose: () => void;
  }): JSX.Element {
    const [isDropDownOpen, setIsDropDownOpen] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(
      Date.now() - job?.timestamps?.updatedAt.getTime() || 0
    );

    const getTagsFromJob = useTagStore((state) => state.getTagsFromJob);
    const removeTagFromJob = useTagStore((state) => state.removeTagFromJob);

    let tags: Tag[] = getTagsFromJob(job);

    const dropdownRef = useRef<HTMLDivElement>(null);

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
      if (job.tagIds) {
        tags = getTagsFromJob(job);
      }
    }, [job.tagIds]);

    const updateStatus = (newStatus: Job['status']): void => {
      if (job.status === newStatus) {
        setIsDropDownOpen(false);
        onDropdownClose();
        return;
      }
      const updatedJob = { ...job, status: newStatus };
      onUpdate?.(updatedJob);
      setIsDropDownOpen(false);
      onDropdownClose();
    };

    const getStatusColor = (status: Job['status']): string => {
      const baseClasses =
        'text-white p-2 rounded-lg bg-opacity-50 capitalize cursor-pointer inline-block text-center min-w-[85px] disabled:opacity-50 disabled:cursor-not-allowed';
      switch (status.toLowerCase()) {
        case 'applied':
          return `bg-blue-500 ${baseClasses}`;
        case 'interview':
          return `bg-yellow-500 ${baseClasses}`;
        case 'offer':
          return `bg-green-500 ${baseClasses}`;
        case 'rejected':
          return `bg-red-500 ${baseClasses}`;
        default:
          return `bg-gray-500 ${baseClasses}`;
      }
    };

    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          handleDropDownClose();
        }
      }

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    const handleDropDownClose = () => {
      setIsDropDownOpen(false);
      onDropdownClose();
    };

    const handleDropDownOpen = () => {
      setIsDropDownOpen(true);
      onDropdownOpen();
    };

    const toggleDropDown = () => {
      isDropDownOpen ? handleDropDownClose() : handleDropDownOpen();
    };

    return (
      <div
        className={`relative flex items-center justify-between p-4 ${
          showControls ? 'z-10' : 'z-0'
        }`}
      >
        {/* left side */}
        <div className="flex gap-2">
          <div className="rounded-lg">
            {job.URL ? (
              <UrlPreviewCard job={job} size="small" />
            ) : (
              <button
                className="h-10 w-10 rounded-lg bg-background-secondary flex items-center justify-center"
                onClick={() => onEdit(job.id)}
              >
                <span className="text-text-primary text-2xl">
                  {job.company?.charAt(0).toUpperCase()}
                </span>
              </button>
            )}
          </div>

          <div className="flex flex-col justify-evenly">
            <div className="flex items-center gap-5">
              <div>
                <span className="text-text-primary">{job.position}</span>
                <span className="text-text-secondary">
                  {job.company ? `, ${job.company}` : ''}
                </span>
              </div>
            </div>
            {job.location && (
              <span className="text-text-secondary text-xs">
                {job.location}
              </span>
            )}
          </div>

          {tags && (
            <div
              className={`flex flex ${
                job.location ? 'items-start' : 'items-center'
              } gap-2`}
            >
              {tags.map((_tag) => (
                <TagCard
                  tag={_tag}
                  key={_tag.id}
                  editable={true}
                  onRemoveButtonClick={() => removeTagFromJob(job.id, _tag.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* right side */}
        {showControls && (
          <div className="flex justify-between items-center gap-2 transition-all duration-bg ease-in-out">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => toggleDropDown()}
                className={getStatusColor(job.status)}
                disabled={timeRemaining > 0}
              >
                {job.status}
              </button>
              {isDropDownOpen && (
                <div
                  className="absolute left-0 top-full w-48 bg-background-secondary border 
                   border-accent-primary rounded-lg shadow-light text-text-primary z-50"
                  onMouseEnter={() => {
                    handleDropDownOpen();
                  }}
                >
                  {statusOptions.map((status: Job['status']) => (
                    <button
                      key={status}
                      className={`block px-4 py-2 text-sm hover:bg-background-primary rounded-lg w-full text-left capitalize transition-all duration-bg ease-in-out z-1
                        ${
                          job.status === status
                            ? 'bg-background-primary text-text-primary'
                            : 'text-text-secondary'
                        }`}
                      onClick={() => updateStatus(status)}
                      role="menuitem"
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              className="bg-accent-primary hover:bg-accent-hover text-white px-4 py-2 rounded-lg transition-all duration-bg ease-in-out"
              onClick={() => onEdit(job.id)} // Pass job ID to the handler
            >
              Edit
            </button>
          </div>
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.job.id === nextProps.job.id &&
      prevProps.job.status === nextProps.job.status &&
      prevProps.job.company === nextProps.job.company &&
      prevProps.job.position === nextProps.job.position &&
      prevProps.job.location === nextProps.job.location &&
      nextProps.showControls === nextProps.showControls &&
      prevProps.onUpdate === nextProps.onUpdate &&
      prevProps.onEdit === nextProps.onEdit &&
      prevProps.onDropdownOpen === nextProps.onDropdownOpen &&
      prevProps.onDropdownClose === nextProps.onDropdownClose
    );
  }
);
