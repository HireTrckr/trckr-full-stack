import { create } from "zustand";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export type Job = {
  id?: string;
  company: string;
  position: string;
  location: string;
  status: "applied" | "interview" | "offer" | "rejected";
};

export const statusOptions: Job["status"][] = [
  "applied",
  "interview",
  "offer",
  "rejected",
];

type JobStore = {
  jobs: Job[];
  fetchJobs: () => Promise<void>;
  addJob: (job: Job) => void;
  deleteJob: (job: Job) => void;
  updateJob: (job: Job) => void;
  clearJobs: () => void; // doesn't delete from server, only clears locally saved jobs
};

export const useJobStore = create<JobStore>((set) => ({
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
      })) as Job[];
      set({ jobs });
    } catch (e) {
      console.error("Error fetching jobs: ", e);
    }
  },

  addJob: async (job: Job) => {
    if (!auth.currentUser) return;
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
    await updateDoc(jobRef, { status: "deleted" });
    set((state) => ({
      jobs: state.jobs.filter((j) => j.id !== job.id),
    }));
  },

  updateJob: async (job: Job) => {
    if (!auth.currentUser) return;
    if (!job.id) return;
    const jobRef = doc(db, "users", auth.currentUser.uid, "jobs", job.id);
    await updateDoc(jobRef, job);
    set((state) => ({
      jobs: state.jobs.map((j) => (j.id === job.id ? job : j)),
    }));
  },

  clearJobs: () => set({ jobs: [] }),
}));
