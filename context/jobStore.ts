import { create } from "zustand";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

export type Job = {
  id?: string;
  company: string;
  position: string;
  status: "applied" | "interview" | "offer" | "rejected";
};

type JobStore = {
  jobs: Job[];
  fetchJobs: () => Promise<void>;
  addJob: (job: Job) => void;
};

export const fetchJobs = async () => {
  if (!auth.currentUser) return [];
  const q = query(collection(db, `users/${auth.currentUser.uid}/jobs`));

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
}));
