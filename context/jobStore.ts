//context/jobStore.ts

import { create } from "zustand";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { Job, JobNotSavedInDB } from "../types/job";
import { Tag } from "../types/tag";

import { timestampToDate } from "../utils/timestampUtils";

type JobStore = {
  jobs: Job[];
  isLoading: boolean;
  error: string | null;

  fetchJobs: () => Promise<boolean>;
  addJob: (job: JobNotSavedInDB) => Promise<boolean>;
  deleteJob: (job: Job) => Promise<boolean>;
  updateJob: (job: Job) => Promise<boolean>;
  getJobsWithTags: (tagId: Tag["id"][]) => Job[];
  clearJobs: () => boolean; // doesn't delete from server, only clears locally saved jobs
};

export const useJobStore = create<JobStore>((set, get) => ({
  jobs: [],

  isLoading: false,

  error: null,

  fetchJobs: async () => {
    if (!auth.currentUser) return false;

    set({ isLoading: true, error: null });
    try {
      const q = query(
        collection(db, `users/${auth.currentUser.uid}/jobs`),
        where("status", "!=", "deleted"),
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.warn("[jobStore.ts] No job files found");
        set({ jobs: [], isLoading: false });
        return true;
      }

      const jobs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamps: {
          createdAt: timestampToDate(doc.data().timestamps.createdAt),
          updatedAt: timestampToDate(doc.data().timestamps.updatedAt),
          deletedAt: doc.data().timestamps.deletedAt
            ? timestampToDate(doc.data().timestamps.deletedAt)
            : null,
        },
      })) as Job[];

      set({ jobs });
    } catch (error) {
      console.error("[jobStore.ts] Error fetching jobs:", error);
      set({ error: `Failed to fetch jobs: ${error}` });
    } finally {
      set({ isLoading: false });
    }

    return !get().error;
  },

  getJobsWithTags(tagIds: string[]) {
    if (tagIds.length === 0) return get().jobs;

    return get().jobs.filter((job: Job) => {
      if (!job.tagIds) return false;
      return job.tagIds.some((tagId: string) => tagIds.includes(tagId));
    });
  },

  addJob: async (job: JobNotSavedInDB) => {
    if (!auth.currentUser) return false;
    if (!job.status || !job.company || !job.position) return false; // will add timestamps - then type is satisfied

    set({ isLoading: true, error: null });

    try {
      const completeJob: Job = {
        ...job,
        timestamps: {
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      } as Job;
      const docRef = await addDoc(
        collection(db, `users/${auth.currentUser.uid}/jobs`),
        completeJob,
      );

      if (!docRef) {
        throw Error("Failed to add job");
      }

      set((state) => ({
        jobs: [...state.jobs, { ...completeJob, id: docRef.id }],
      }));
    } catch (error) {
      console.error("[jobStore.ts] Error adding job:", error);
      set({ error: `Failed to add job: ${error}` });
    } finally {
      set({ isLoading: false });
    }

    return !get().error;
  },

  deleteJob: async (job: Job) => {
    if (!auth.currentUser) return false;
    if (!job.id) return false;

    set({ isLoading: true, error: null });

    try {
      const jobRef = doc(db, "users", auth.currentUser.uid, "jobs", job.id);

      if (!jobRef) {
        throw new Error("Job not found");
      }

      await updateDoc(jobRef, {
        status: "deleted",
        timestamps: {
          ...job.timestamps,
          updatedAt: new Date(),
          deletedAt: new Date(),
        },
      });
      set((state) => ({
        jobs: state.jobs.filter((j) => j.id !== job.id),
      }));
    } catch (error) {
      console.error(`[jobStore.ts] Error deleting job: ${job.id}`, error);
      set({ error: `Failed to delete job: ${error}` });
    } finally {
      set({ isLoading: false });
    }

    return !get().error;
  },

  updateJob: async (job: Job) => {
    if (!auth.currentUser) return false;
    if (!job.id) return false;

    set({ isLoading: true, error: null });
    try {
      const jobRef = doc(db, "users", auth.currentUser.uid, "jobs", job.id);

      if (!jobRef) {
        throw new Error("Job not found");
      }
      job.timestamps = {
        ...job.timestamps,
        updatedAt: new Date(),
      };
      await updateDoc(jobRef, job);
      set((state) => ({
        jobs: state.jobs.map((j) => (j.id === job.id ? job : j)),
      }));
    } catch (error) {
      console.error(`[jobStore.ts] Error updating job: ${job.id}`, error);
      set({ error: `Failed to update job: ${error}` });
    } finally {
      set({ isLoading: false });
    }

    return !get().error;
  },

  clearJobs: () => {
    set({ isLoading: true, error: null });
    try {
      set({ jobs: [] });
    } catch (error) {
      console.error(`[jobStore.ts] Error clearing jobs`, error);
      set({ error: `Failed to clear jobs: ${error}` });
    } finally {
      set({ isLoading: false });
    }

    return !get().error;
  },
}));
