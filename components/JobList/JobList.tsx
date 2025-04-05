import { useEffect, useState } from 'react';
import { useJobStore } from '../../context/jobStore';
import { useTagStore } from '../../context/tagStore';
import { Job } from '../../types/job';
import { auth } from '../../lib/firebase';
import { JobListing } from '../JobListing/JobListing';

import { ModalProps, useModalStore } from '../../context/modalStore';
import { ModalTypes } from '../../types/modalTypes';

export const JobList: React.FC = () => {
  const jobs = useJobStore((state) => state.jobs);
  const clearTags = useTagStore((state) => state.clearTags);
  const fetchTags = useTagStore((state) => state.fetchTags);
  const clearJobs = useJobStore((state) => state.clearJobs);
  const fetchJobs = useJobStore((state) => state.fetchJobs);
  const updateJob = useJobStore((state) => state.updateJob);
  const deleteJob = useJobStore((state) => state.deleteJob);

  const openJobEditorModal = useModalStore((state) => state.openJobEditorModal);
  const closeModal = useModalStore((state) => state.closeModal);

  const [isLoading, setIsLoading] = useState(false);

  const [jobWithOpenDropdown, setJobWithOpenDropdown] = useState<Job | null>(
    null
  );
  const [hoveredJob, setHoveredJob] = useState<Job | null>(null);

  const getJobEditorProps = (job: Job): ModalProps => {
    return {
      props: {
        job,
        onSave: handleJobUpdate,
        onDelete: handleJobDelete,
        onClose: handleClose,
      },
      type: ModalTypes.jobEditor,
    };
  };

  // triggered when job is updated from within the EditJobModal
  const handleJobUpdate = async (updatedJob: Job) => {
    // check updatedJob has actually changed from the selectedJob
    updateJob(updatedJob);
    handleClose();
  };

  // triggered from within the JobListing component -> opens the editJobModal
  const handleEdit = (jobId: Job['id']) => {
    const job = jobs.find((job) => job.id === jobId);
    if (job) {
      openJobEditorModal(getJobEditorProps(job));
    }
  };

  const handleJobDelete = async (deletedJob: Job) => {
    // dont do anything if the job is null
    if (!deletedJob) return;

    deleteJob(deletedJob);
    handleClose();
  };

  // tell's the modalHandler to close the currently open modal
  const handleClose = () => {
    closeModal();
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      clearJobs();
      clearTags();

      if (user) {
        setIsLoading(true);
        try {
          await fetchJobs();
        } catch (error) {
          console.error('Error fetching jobs:', error);
        }
        try {
          await fetchTags();
        } catch (error) {
          console.error('Error fetching tags:', error);
        }

        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [fetchJobs, clearJobs, fetchTags, clearTags]);

  if (isLoading) {
    return <p className="text-text-secondary">Loading...</p>;
  }

  return (
    <div className="w-full transition-colors duration-bg">
      <div className="flex justify-center items-center mb-6">
        <span className="text-2xl font-semibold text-text-primary flex items-center transition-colors duration-text">
          My Job Applications {jobs.length ? `(${jobs.length})` : ''}
        </span>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-text-secondary">
            No jobs found! Add a new job application to get started.
          </p>
        </div>
      ) : (
        <ul className="relativ px-3">
          {jobs.map((job) => {
            const isActive =
              jobWithOpenDropdown === job ||
              (!jobWithOpenDropdown && hoveredJob === job);
            return (
              <li
                key={job.id}
                className={`relative rounded-lg transition-all duration-bg ease-in-out ${
                  isActive
                    ? 'scale-[1.01] shadow-light bg-background-secondary z-20'
                    : 'bg-background-primary z-10'
                }`}
                onMouseEnter={() => setHoveredJob(job)}
                onMouseLeave={() => setHoveredJob(null)}
              >
                <JobListing
                  job={job}
                  onUpdate={handleJobUpdate}
                  onEdit={handleEdit}
                  onDelete={handleJobDelete}
                  showControls={isActive}
                  onDropdownOpen={() => setJobWithOpenDropdown(job)}
                  onDropdownClose={() => setJobWithOpenDropdown(null)}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
