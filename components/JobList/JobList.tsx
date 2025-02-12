import { useEffect, useState } from "react";
import { Job, useJobStore } from "../../context/jobStore";
import { auth } from "../../lib/firebase";

import EditJobModal from "../EditJobModal/EditJobModal";

import JobListing from "../JobListing/JobListing";

export const JobList: React.FC = () => {
  const jobs = useJobStore((state) => state.jobs);
  const clearJobs = useJobStore((state) => state.clearJobs);
  const fetchJobs = useJobStore((state) => state.fetchJobs);
  const updateJob = useJobStore((state) => state.updateJob);
  const deleteJob = useJobStore((state) => state.deleteJob);

  // states for editing pannel
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const [jobWithOpenDropdown, setJobWithOpenDropdown] = useState<Job | null>(
    null
  );
  const [hoveredJob, setHoveredJob] = useState<Job | null>(null);

  const handleJobUpdate = async (updatedJob: Job) => {
    // check updatedJob has actually changed from the selectedJob
    if (
      selectedJob &&
      updatedJob &&
      JSON.stringify(selectedJob) === JSON.stringify(updatedJob)
    ) {
      return;
    }

    updateJob(updatedJob);
    handleClose();
  };

  const handleEdit = (jobId: Job["id"]) => {
    const job = jobs.find((job) => job.id === jobId);
    if (job) {
      setSelectedJob(job);
      setIsModalOpen(true);
    }
  };

  const handleJobDelete = async (deletedJob: Job) => {
    // dont do anything if the job is null
    if (!deletedJob) return;

    deleteJob(deletedJob);
    setSelectedJob(null);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setIsLoading(true);
        try {
          await fetchJobs();
        } catch (error) {
          console.error("Error fetching jobs:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        clearJobs();
      }
    });

    return () => unsubscribe();
  }, [fetchJobs, clearJobs]);

  if (isLoading) {
    return <p className="text-text-secondary">Loading...</p>;
  }

  return (
    <div className="w-full transition-colors duration-bg">
      <div className="flex justify-center items-center mb-6">
        <h2 className="text-2xl font-semibold text-text-primary flex items-center transition-colors duration-text">
          My Job Applications {jobs.length ? `(${jobs.length})` : ""}
        </h2>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-text-secondary">
            No jobs found! Add a new job application to get started.
          </p>
        </div>
      ) : (
        <ul className="relative">
          {jobs.map((job) => {
            const isActive =
              jobWithOpenDropdown === job ||
              (!jobWithOpenDropdown && hoveredJob === job);
            return (
              <li
                key={job.id}
                className={`relative rounded-lg transition-all duration-bg ease-in-out ${
                  isActive
                    ? "scale-[1.01] shadow-light bg-background-secondary z-20"
                    : "bg-background-primary z-10"
                }`}
                onMouseEnter={() => setHoveredJob(job)}
                onMouseLeave={() => setHoveredJob(null)}
              >
                <JobListing
                  job={job}
                  onUpdate={handleJobUpdate}
                  onEdit={handleEdit}
                  showControls={isActive}
                  onDropdownOpen={() => setJobWithOpenDropdown(job)}
                  onDropdownClose={() => setJobWithOpenDropdown(null)}
                />
              </li>
            );
          })}
        </ul>
      )}

      {isModalOpen && selectedJob && (
        <EditJobModal
          job={selectedJob}
          onClose={handleClose}
          onSave={handleJobUpdate}
          onDelete={handleJobDelete}
        />
      )}
    </div>
  );
};
