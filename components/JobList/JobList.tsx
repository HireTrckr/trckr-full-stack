import { useEffect, useState } from "react";
import { Job, useJobStore } from "../../context/jobStore";
import { auth } from "../../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

import EditJobModal from "../EditJobModal/EditJobModal";

import JobListing from "../JobListing/JobListing";

export const JobList: React.FC = () => {
  const [jobs, deleteJob, clearJobs] = useJobStore((state) => [
    state.jobs,
    state.deleteJob,
    state.clearJobs,
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const handleJobUpdate = async (updatedJob: Job) => {
    try {
      if (!auth.currentUser) {
        console.error("User not authenticated");
        return;
      }

      if (!updatedJob.id) {
        console.error("Job ID is missing");
        setSelectedJob(null);
        return;
      }

      setJobs((prevJobs: Job[]) =>
        prevJobs.map((job) => (job.id === updatedJob.id ? updatedJob : job))
      );

      const jobRef = doc(
        db,
        "users",
        auth.currentUser.uid,
        "jobs",
        updatedJob.id
      );
      await updateDoc(jobRef, updatedJob);
      const fetchedJobs = await fetchJobs();
      setJobs(fetchedJobs);
      setSelectedJob(null);
    } catch (error) {
      console.error("Error updating job:", error);
    }
  };

  const handleEdit = (jobId: Job["id"]) => {
    if (!jobId) return;
    const jobToEdit = jobs.find((job) => job.id === jobId);
    if (jobToEdit) {
      setSelectedJob(jobToEdit);
      setIsModalOpen(true);
    }
  };

  const handleJobDelete = async (job: Job) => {
    try {
      if (!auth.currentUser) {
        console.error("User not authenticated");
        return;
      }

      if (!job.id) {
        console.error("Job ID is missing");
        return;
      }

      setSelectedJob(null);
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        await useJobStore.getState().fetchJobs();
      } else {
        clearJobs();
      }
    });

    return () => unsubscribe();
  }, [clearJobs]);

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">
        My Job Applications {jobs.length ? `(${jobs.length})` : ""}
      </h2>
      {jobs.length === 0 ? (
        <p className="text-gray-500 text-center">No jobs found</p>
      ) : (
        <ul className="space-y-3">
          {jobs.map((job) => (
            <li
              key={job.id}
              className="p-4 border rounded-lg shadow-sm hover:bg-gray-100 transition"
            >
              <JobListing
                job={job}
                onUpdate={handleJobUpdate}
                onEdit={handleEdit}
              />
            </li>
          ))}
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
