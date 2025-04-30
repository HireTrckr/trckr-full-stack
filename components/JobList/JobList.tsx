import { useEffect, useState } from 'react';
import { useJobStore } from '../../context/jobStore';
import { useTagStore } from '../../context/tagStore';
import { Job } from '../../types/job';
import { JobListing } from '../JobListing/JobListing';

import { ModalProps, useModalStore } from '../../context/modalStore';
import { ModalTypes } from '../../types/modalTypes';
import { SkeletonJobListComponent } from '../SkeletonJobListComponent/SkeletonJobListComponent';
import { useTranslation } from 'react-i18next';

export const JobList: React.FC = () => {
  const { jobs, updateJob, deleteJob } = useJobStore.getState();

  const openJobEditorModal = useModalStore((state) => state.openJobEditorModal);
  const closeModal = useModalStore((state) => state.closeModal);

  const { t } = useTranslation();

  const isJobsLoading = useJobStore((state) => state.isLoading);
  const isTagsLoading = useTagStore((state) => state.isLoading);

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

  if (isJobsLoading || isTagsLoading) return <SkeletonJobListComponent />;

  return (
    <div className="w-full transition-colors duration-bg">
      <div className="flex justify-center items-center mb-3">
        <span className="text-2xl font-semibold text-text-primary flex items-center transition-colors duration-text">
          {t('job-list.title', { count: jobs.length })}
        </span>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-text-secondary">{t('job-list.no-jobs-found')}</p>
        </div>
      ) : (
        <ul className="relative px-3">
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
