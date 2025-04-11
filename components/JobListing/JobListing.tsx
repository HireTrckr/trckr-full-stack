import React, { JSX, useEffect, useRef } from 'react';
import { Job } from '../../types/job';
import { useState, memo } from 'react';
import { UrlPreviewCard } from '../URLPreviewCard/URLPreviewCard';
import { useTagStore } from '../../context/tagStore';
import { TagCard } from '../TagCard/TagCard';
import { TiTrash } from 'react-icons/ti';
import { Tag } from '../../types/tag';
import { JobStatus } from '../../types/jobStatus';
import { useStatusStore } from '../../context/statusStore';

export const JobListing = memo(
  function JobListing({
    job,
    onUpdate,
    onEdit,
    onDelete,
    showControls,
    onDropdownOpen,
    onDropdownClose,
  }: {
    job: Job;
    onUpdate?: (updatedJob: Job) => void;
    onEdit: (jobId: Job['id']) => void;
    onDelete: (job: Job) => void;
    showControls: boolean;
    onDropdownOpen: () => void;
    onDropdownClose: () => void;
  }): JSX.Element {
    const [isDropDownOpen, setIsDropDownOpen] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(
      Date.now() - job?.timestamps?.updatedAt.getTime() || 0
    );
    const [deleting, setDeleting] = useState<boolean>(false);

    const getTagsFromJob = useTagStore((state) => state.getTagsFromJob);
    const removeTagFromJob = useTagStore((state) => state.removeTagFromJob);

    const { statusMap, getStatusFromID } = useStatusStore.getState();

    let status = getStatusFromID(job.statusID);

    let tags: Tag[] = getTagsFromJob(job);

    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleDelete = (_job: Job) => {
      setDeleting(true);
      onDelete(_job);
      setDeleting(false);
    };

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

    useEffect(() => {
      if (job.statusID) {
        status = getStatusFromID(job.statusID);
      }
    });

    const updateStatus = (newStatus: JobStatus): void => {
      if (job.statusID === newStatus.id) {
        setIsDropDownOpen(false);
        onDropdownClose();
        return;
      }
      const updatedJob = { ...job, statusID: newStatus.id };
      status = newStatus;
      onUpdate?.(updatedJob);
      setIsDropDownOpen(false);
      onDropdownClose();
    };

    const getStatusColor = (status: JobStatus): string => {
      return `text-white p-2 rounded-lg bg-opacity-50 capitalize cursor-pointer inline-block text-center min-w-[85px] disabled:opacity-50 disabled:cursor-not-allowed bg-${status?.color ?? 'blue'}-500`;
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
                className={getStatusColor(status)}
                disabled={timeRemaining > 0}
              >
                {status?.statusName}
              </button>
              {isDropDownOpen && (
                <div
                  className="absolute left-0 top-full w-48 bg-background-secondary border 
                   border-accent-primary rounded-lg shadow-light text-text-primary z-50"
                  onMouseEnter={() => {
                    handleDropDownOpen();
                  }}
                >
                  {Object.values(statusMap).map((status: JobStatus) => (
                    <button
                      key={status.id}
                      className={`block px-4 py-2 text-sm hover:bg-background-primary rounded-lg w-full text-left capitalize transition-all duration-bg ease-in-out z-1
                        ${
                          job.statusID === status.id
                            ? 'bg-background-primary text-text-primary'
                            : 'text-text-secondary'
                        }`}
                      onClick={() => updateStatus(status)}
                      role="menuitem"
                    >
                      {status.statusName}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              className="bg-accent-primary hover:brightness-[80%] text-text-accent px-4 py-2 rounded-lg transition-all duration-bg ease-in-out"
              onClick={() => onEdit(job.id)} // Pass job ID to the handler
            >
              Edit
            </button>
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-all duration-bg ease-in-out min-h-full"
              onClick={() => handleDelete(job)}
            >
              {deleting ? (
                <div className="w-full p-6">
                  <div className="bg-background-primary rounded-lg p-6 transition-all duration-bg ease-in-out flex flex-col items-center gap-2 hover:scale-[1.02]">
                    <svg
                      aria-hidden="true"
                      className="w-8 h-8 text-text-secondary animate-spin fill-accent-primary transition-colors duration-text"
                      viewBox="0 0 100 101"
                      fill="none"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="currentColor"
                      />
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentFill"
                      />
                    </svg>
                  </div>
                </div>
              ) : (
                <TiTrash size={24} />
              )}
            </button>
          </div>
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.job.id === nextProps.job.id &&
      prevProps.job.statusID === nextProps.job.statusID &&
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
