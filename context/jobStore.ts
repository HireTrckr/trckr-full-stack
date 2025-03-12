//context/jobStore.ts

import { create } from "zustand";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { Job } from "../types/job";
import { Tag } from "../types/tag";

type JobStore = {
  jobs: Job[];
  fetchJobs: () => Promise<void>;
  addJob: (job: Job) => void;
  deleteJob: (job: Job) => void;
  updateJob: (job: Job) => void;
  getJobsWithTags: (tagId: Tag["id"][]) => Job[];
  clearJobs: () => void; // doesn't delete from server, only clears locally saved jobs
};

const timestampToDate = (timestamp: any) => {
  if (!timestamp) return null;
  if (timestamp instanceof Date) return timestamp;
  if (timestamp.toDate) return timestamp.toDate();
  return new Date(timestamp.seconds * 1000);
};

export const useJobStore = create<JobStore>((set, get) => ({
  jobs: [],

  fetchJobs: async () => {
    if (!auth.currentUser) return;
    try {
      const q = query(
        collection(db, `users/${auth.currentUser.uid}/jobs`),
        where("status", "!=", "deleted")
      );
      const querySnapshot = await getDocs(q);
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
    } catch (e) {
      console.error("Error fetching jobs: ", e);
    }
  },

  getJobsWithTags(tagIds: string[]) {
    if (tagIds.length === 0) return get().jobs;

    return get().jobs.filter((job: Job) => {
      if (!job.tagIds) return false;
      return job.tagIds.some((tagId: string) => tagIds.includes(tagId));
    });
  },

  addJob: async (job: Job) => {
    if (!auth.currentUser) return;
    job.timestamps = {
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const docRef = await addDoc(
      collection(db, `users/${auth.currentUser.uid}/jobs`),
      job
    );
    set((state) => ({ jobs: [...state.jobs, { ...job, id: docRef.id }] }));
  },

  deleteJob: async (job: Job) => {
    if (!auth.currentUser) return;
    if (!job.id) return;
    const jobRef = doc(db, "users", auth.currentUser.uid, "jobs", job.id);
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
  },

  updateJob: async (job: Job) => {
    if (!auth.currentUser) return;
    if (!job.id) return;
    const jobRef = doc(db, "users", auth.currentUser.uid, "jobs", job.id);
    job.timestamps = {
      ...job.timestamps,
      updatedAt: new Date(),
    };
    await updateDoc(jobRef, job);
    set((state) => ({
      jobs: state.jobs.map((j) => (j.id === job.id ? job : j)),
    }));
  },

  clearJobs: () => set({ jobs: [] }),
}));
