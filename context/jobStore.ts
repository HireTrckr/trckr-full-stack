//context/jobStore.ts

import { create } from 'zustand';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  runTransaction,
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Job, JobNotSavedInDB } from '../types/job';
import { Tag } from '../types/tag';
import { ToastCategory } from '../types/toast';

import { timestampToDate } from '../utils/timestampUtils';
import { useToastStore } from './toastStore';
import { JobStatus } from '../types/jobStatus';
import { CustomField } from '../types/customField';

type JobStore = {
  jobs: Job[];
  isLoading: boolean;
  error: string | null;

  fetchJobs: () => Promise<boolean>;
  addJob: (job: JobNotSavedInDB) => Promise<boolean>;
  deleteJob: (job: Job) => Promise<boolean>;
  updateJob: (job: Job) => Promise<boolean>;
  getJobsWithTags: (tagId: Tag['id'][]) => Job[];
  getJobsWithStatus: (statusId: JobStatus['id']) => Job[];
  clearJobs: () => boolean; // doesn't delete from server, only clears locally saved jobs

  cleanupFieldValuesFromJobs: (fieldID: CustomField['id']) => Promise<boolean>;
};

const { createTranslatedToast } = useToastStore.getState();

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
        where('statusID', '!=', 'deleted')
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.warn('[jobStore.ts] No job files found');
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
      console.error('[jobStore.ts] Error fetching jobs:', error);
      set({ error: `Failed to fetch jobs: ${error}` });
    } finally {
      set({ isLoading: false });
    }

    return !get().error;
  },

  getJobsWithStatus(statusId: JobStatus['id']) {
    return get().jobs.filter((job: Job) => job.statusID === statusId);
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
    if (!job.statusID || !job.company || !job.position) return false; // will add timestamps - then type is satisfied

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
        completeJob
      );

      if (!docRef) {
        throw Error('Failed to add job');
      }

      set((state) => ({
        jobs: [...state.jobs, { ...completeJob, id: docRef.id }],
      }));

      // send toast notification
      createTranslatedToast(
        'toasts.jobAdded',
        true,
        'toasts.titles.jobAdded',
        { position: job.position, company: job.company },
        {},
        ToastCategory.INFO,
        3000,
        () => {},
        (toast) => {
          // undo function
          get().deleteJob({ ...completeJob, id: docRef.id } as Job);
        }
      );
    } catch (error) {
      console.error('[jobStore.ts] Error adding job:', error);
      createTranslatedToast(
        'toasts.errors.addJob',
        true,
        'toasts.titles.error',
        {
          position: job.position,
          company: job.company,
          message: (error as Error).message,
        },
        {},
        ToastCategory.ERROR,
        10000
      );
      set({ error: `Failed to add job: ${error}` });
    } finally {
      set({ isLoading: false });
    }

    return !get().error;
  },

  deleteJob: async (job: Job) => {
    console.log('Deleting job:', job);
    if (!auth.currentUser) return false;
    if (!job.id) return false;

    set({ isLoading: true, error: null });

    try {
      const jobRef = doc(db, 'users', auth.currentUser.uid, 'jobs', job.id);

      if (!jobRef) {
        throw new Error('Job not found');
      }

      await updateDoc(jobRef, {
        statusID: 'deleted',
        timestamps: {
          ...job.timestamps,
          updatedAt: new Date(),
          deletedAt: new Date(),
        },
      });
      set((state) => ({
        jobs: state.jobs.filter((j) => j.id !== job.id),
      }));
      // send toast notification
      createTranslatedToast(
        'toasts.jobDeleted',
        true,
        'toasts.titles.jobDeleted',
        { position: job.position, company: job.company },
        {},
        ToastCategory.INFO,
        3000,
        () => {},
        (toast) => {
          // undo function
          get().updateJob(job);
        }
      );
    } catch (error) {
      console.error(`[jobStore.ts] Error deleting job: ${job.id}`, error);
      createTranslatedToast(
        'toasts.errors.deleteJob',
        true,
        'toasts.titles.error',
        {
          position: job.position,
          company: job.company,
          message: (error as Error).message,
        },
        {},
        ToastCategory.ERROR,
        10000
      );
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
      const jobRef = doc(db, 'users', auth.currentUser.uid, 'jobs', job.id);

      if (!jobRef) {
        throw new Error('Job not found');
      }
      job.timestamps = {
        ...job.timestamps,
        updatedAt: new Date(),
        deletedAt: null,
      };
      await updateDoc(jobRef, job);
      set((state) => ({
        jobs: state.jobs.map((j) => (j.id === job.id ? job : j)),
      }));
    } catch (error) {
      console.error(`[jobStore.ts] Error updating job: ${job.id}`, error);
      createTranslatedToast(
        'toasts.errors.updateJob',
        true,
        'toasts.titles.error',
        {
          position: job.position,
          company: job.company,
          message: (error as Error).message,
        },
        {},
        ToastCategory.ERROR,
        10000
      );
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
      createTranslatedToast(
        'toasts.errors.clearJobs',
        true,
        'toasts.titles.error',
        { message: (error as Error).message },
        {},
        ToastCategory.ERROR,
        10000
      );
      set({ error: `Failed to clear jobs: ${error}` });
    } finally {
      set({ isLoading: false });
    }

    return !get().error;
  },

  cleanupFieldValuesFromJobs: async (fieldID: CustomField['id']) => {
    if (!auth.currentUser) return false;

    set({ isLoading: true, error: null });
    try {
      const jobsRef = collection(db, `users/${auth.currentUser.uid}/jobs`);
      const jobsSnapshot = await getDocs(jobsRef);
      await runTransaction(db, async (transaction) => {
        jobsSnapshot.forEach((jobDoc) => {
          const jobData = jobDoc.data() as Job;
          if (jobData.customFields[fieldID]) {
            delete jobData.customFields[fieldID];
            transaction.update(jobDoc.ref, {
              customFields: jobData.customFields,
            });
          }
        });
      });
    } catch (error) {
      console.error(`[jobStore.ts] Error cleaning up field values`, error);
      createTranslatedToast(
        'toasts.errors.cleanupFieldValues',
        true,
        'toasts.titles.error',
        { message: (error as Error).message },
        {},
        ToastCategory.ERROR,
        10000
      );
      set({ error: `Failed to clean up field values: ${error}` });
    } finally {
      set({ isLoading: false });
    }

    return !get().error;
  },
}));
