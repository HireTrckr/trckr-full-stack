import { useState } from 'react';
import { useJobStore } from '../../context/jobStore';
import { useTagStore } from '../../context/tagStore';
import { Job } from '../../types/job';
import { JobListing } from '../JobListing/JobListing';
import { ModalProps, useModalStore } from '../../context/modalStore';
import { ModalTypes } from '../../types/modalTypes';
import { SkeletonJobListComponent } from '../SkeletonJobListComponent/SkeletonJobListComponent';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import { FiBriefcase } from 'react-icons/fi';

import { NoDataComponent } from '../NoDataComponent/NoDataComponent';
import {
  DataFilterSorter,
  FilterOptions,
  SortDirection,
  SortField,
} from '../DataFilterSorter/DataFilterSorter';

export const JobList: React.FC = () => {
  const { jobs, updateJob, deleteJob } = useJobStore.getState();
  const router = useRouter();

  // Add state for sorting and filtering
  const [sortField, setSortField] = useState<SortField>('dateApplied');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    status: [],
    searchTerm: '',
    tags: [],
  });

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

  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (filters: Partial<FilterOptions>) => {
    setFilterOptions((prevFilters) => ({ ...prevFilters, ...filters }));
  };

  if (isJobsLoading || isTagsLoading) return <SkeletonJobListComponent />;

  const applySort = (_jobs: Job[]) => {
    return _jobs.sort((a: Job, b: Job) => {
      let comparison = 0;
      switch (sortField) {
        case 'company':
          comparison = a.company.localeCompare(b.company);
          break;
        case 'position':
          comparison = a.position.localeCompare(b.position);
          break;
        case 'dateApplied':
          comparison =
            a.timestamps.createdAt.getTime() - b.timestamps.createdAt.getTime();
          break;
        case 'status':
          comparison = a.statusID.localeCompare(b.statusID);
          break;
        default:
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  const applyFilters = (_jobs: Job[]) => {
    return _jobs.filter((job: Job) => {
      // Filter by status
      if (
        filterOptions.status.length > 0 &&
        !filterOptions.status.includes(job.statusID)
      ) {
        return false;
      }

      // Filter by tags
      if (
        filterOptions.tags.length > 0 &&
        (!job.tagIds ||
          !job.tagIds.some((tagId) => filterOptions.tags.includes(tagId)))
      ) {
        return false;
      }

      // Filter by search term
      if (
        filterOptions.searchTerm &&
        !job.company
          .toLowerCase()
          .includes(filterOptions.searchTerm.toLowerCase()) &&
        !job.position
          .toLowerCase()
          .includes(filterOptions.searchTerm.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  };

  const getSortedAndFilteredJobs = () => {
    return applySort(applyFilters(jobs));
  };

  return (
    <div className="w-full transition-colors duration-bg">
      <div className="flex justify-center items-center mb-3">
        <span className="text-2xl font-semibold text-text-primary flex items-center transition-colors duration-text">
          {t('job-list.title', { count: jobs.length ?? 0 })}
        </span>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-8">
          <NoDataComponent
            icon={FiBriefcase}
            title={t('job-list.no-jobs-title')}
            message={t('job-list.no-jobs-msg')}
            action={{
              label: t('navbar.add-new'),
              onClick: () => {
                // make button Link to /new, without reloading the page
                router.push('/new');
              },
            }}
          />
        </div>
      ) : (
        <ul className="relative px-3">
          {jobs.length > 1 && (
            <DataFilterSorter
              sortField={sortField}
              sortDirection={sortDirection}
              filterOptions={filterOptions}
              onSortChange={handleSortChange}
              onFilterChange={handleFilterChange}
            />
          )}
          {getSortedAndFilteredJobs().map((job) => {
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
