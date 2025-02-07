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

type JobStore = {
  jobs: Job[];
  fetchJobs: () => Promise<void>;
  addJob: (job: Job) => void;
  deleteJob: (job: Job) => void;
  updateJob: (job: Job) => void;
  clearJobs: () => void; // doesn't delete from server, only deleted locally saved jobs
};

export const fetchJobs = async () => {
  if (!auth.currentUser) return [];

  // ignore deleted jobs
  const q = query(
    collection(db, `users/${auth.currentUser.uid}/jobs`),
    where("status", "!=", "deleted")
  );

  try {
    const querySnapshot = await getDocs(q);
    const jobs = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Job[];
    return jobs;
  } catch (e) {
    console.error("Error fetching jobs: ", e);
    return [];
  }
};

export const deleteJob = async (job: Job) => {
  if (!auth.currentUser) return;
  if (!job.id) return;
  const jobRef = doc(db, "users", auth.currentUser.uid, "jobs", job.id);
  await updateDoc(jobRef, { status: "deleted" });

  fetchJobs();
};

export const useJobStore = create<JobStore>((set) => ({
  jobs: [],

  fetchJobs: async () => {
    if (!auth.currentUser) return;
    const q = query(collection(db, `users/${auth.currentUser.uid}/jobs`));
    const querySnapshot = await getDocs(q);
    const jobs = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Job[];
    set({ jobs });
  },

  addJob: async (job) => {
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

    fetchJobs();
  },

  updateJob: async (job: Job) => {
    if (!auth.currentUser) return;
    if (!job.id) return;
    const jobRef = doc(db, "users", auth.currentUser.uid, "jobs", job.id);
    await updateDoc(jobRef, job);

    fetchJobs();
    set((state) => ({
      jobs: state.jobs.map((j) => (j.id === job.id ? job : j)),
    }));
    },

  clearJobs: () => set({ jobs: [] }),
}));
