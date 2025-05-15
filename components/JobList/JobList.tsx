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
import { TiTrash } from 'react-icons/ti';

export const JobList: React.FC = () => {
  const { jobs, updateJob, deleteJob } = useJobStore.getState();
  const router = useRouter();

  // Add state for sorting and filtering
  const [sortField, setSortField] = useState<SortField>('updatedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    status: [],
    searchTerm: '',
    tags: [],
  });

  const openJobEditorModal = useModalStore((state) => state.openJobEditorModal);
  const closeModal = useModalStore((state) => state.closeModal);

  const [selectedJobs, setSelectedJobs] = useState<Record<string, Job>>({});
  const selectedJobsCount = Object.keys(selectedJobs).length;

  const { t } = useTranslation();

  const isJobsLoading = useJobStore((state) => state.isLoading);
  const isTagsLoading = useTagStore((state) => state.isLoading);

  const [jobWithOpenDropdown, setJobWithOpenDropdown] = useState<Job | null>(
    null
  );
  const [hoveredJob, setHoveredJob] = useState<Job | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);

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

  // Handle job selection
  const handleJobSelection = (job: Job, selected: boolean) => {
    setSelectedJobs((prev) => {
      const newSelectedJobs = { ...prev };
      if (selected) {
        newSelectedJobs[job.id] = job;
      } else {
        delete newSelectedJobs[job.id];
      }
      return newSelectedJobs;
    });
  };

  // Select or deselect all jobs
  const toggleSelectAll = (select: boolean) => {
    if (select) {
      const jobsMap: Record<string, Job> = {};
      getSortedAndFilteredJobs().forEach((job) => {
        jobsMap[job.id] = job;
      });
      setSelectedJobs(jobsMap);
    } else {
      setSelectedJobs({});
    }
  };

  // Delete all selected jobs
  const deleteSelectedJobs = async () => {
    setIsDeleting(true);
    const jobsToDelete = Object.values(selectedJobs);

    try {
      // Delete jobs one by one
      for (const job of jobsToDelete) {
        await deleteJob(job);
      }

      // Clear selection after deletion
      setSelectedJobs({});
    } catch (error) {
      console.error('Error deleting selected jobs:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFilterChange = (filters: Partial<FilterOptions>) => {
    setFilterOptions((prevFilters) => ({ ...prevFilters, ...filters }));
  };

  if (isJobsLoading || isTagsLoading || isDeleting)
    return <SkeletonJobListComponent />;

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
        case 'updatedAt':
          comparison =
            (a.timestamps.updatedAt.toDate() ?? new Date()).getTime() -
            (b.timestamps.updatedAt.toDate() ?? new Date()).getTime();
          break;
        case 'status':
          comparison = a.statusID.localeCompare(b.statusID);
          break;
        case 'createdAt':
          comparison =
            (a.timestamps.createdAt.toDate() ?? new Date()).getTime() -
            (b.timestamps.createdAt.toDate() ?? new Date()).getTime();
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
        <>
          {jobs.length > 1 && (
            <DataFilterSorter
              sortField={sortField}
              sortDirection={sortDirection}
              filterOptions={filterOptions}
              onSortChange={handleSortChange}
              onFilterChange={handleFilterChange}
            />
          )}
          <ul className="relative px-3">
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
                    isSelected={!!selectedJobs[job.id]}
                    onSelect={handleJobSelection}
                  />
                </li>
              );
            })}
          </ul>
          {/* Mass Delete Controls */}
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center gap-2 px-4 py-2">
              <label
                htmlFor="select-all"
                className="text-text-primary cursor-pointer"
              >
                {selectedJobsCount > 0 &&
                selectedJobsCount === getSortedAndFilteredJobs().length
                  ? t('common.deselectAll')
                  : t('common.selectAll')}
              </label>
              <input
                type="checkbox"
                id="select-all"
                className="h-5 w-5 accent-red-500 cursor-pointer"
                checked={
                  selectedJobsCount > 0 &&
                  selectedJobsCount === getSortedAndFilteredJobs().length
                }
                onChange={(e) => toggleSelectAll(e.target.checked)}
              />
            </div>
            {selectedJobsCount > 0 && (
              <button
                className="bg-red-500 hover:brightness-[80%] text-white px-4 py-2 rounded-lg transition-all duration-bg ease-in-out flex items-center gap-2"
                onClick={deleteSelectedJobs}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <svg
                    aria-hidden="true"
                    className="w-5 h-5 text-white animate-spin"
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
                ) : (
                  <>
                    <TiTrash size={20} />
                    {t('common.delete')} ({selectedJobsCount})
                  </>
                )}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};
