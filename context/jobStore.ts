//context/jobStore.ts

import { create } from 'zustand';
import { auth } from '../lib/firebase';
import { Job, JobNotSavedInDB } from '../types/job';
import { Tag } from '../types/tag';
import { ToastCategory } from '../types/toast';

import { useToastStore } from './toastStore';
import { JobStatus } from '../types/jobStatus';
import { CustomField } from '../types/customField';
import { jobsApi } from '../lib/api';

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
      // Use the API client instead of direct Firebase access
      const jobs = await jobsApi.fetchJobs();
      
      set({ jobs });
    } catch (error: unknown) {
      console.error('[jobStore.ts] Error fetching jobs:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      set({ error: `Failed to fetch jobs: ${errorMessage}` });
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
      // Use the API client instead of direct Firebase access
      const newJob = await jobsApi.addJob(job);

      set((state) => ({
        jobs: [...state.jobs, newJob],
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
          get().deleteJob(newJob);
        }
      );
    } catch (error: unknown) {
      console.error('[jobStore.ts] Error adding job:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      createTranslatedToast(
        'toasts.errors.addJob',
        true,
        'toasts.titles.error',
        {
          position: job.position,
          company: job.company,
          message: errorMessage,
        },
        {},
        ToastCategory.ERROR,
        10000
      );
      set({ error: `Failed to add job: ${errorMessage}` });
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
      // Use the API client instead of direct Firebase access
      await jobsApi.deleteJob(job);
      
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
    } catch (error: unknown) {
      console.error(`[jobStore.ts] Error deleting job: ${job.id}`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      createTranslatedToast(
        'toasts.errors.deleteJob',
        true,
        'toasts.titles.error',
        {
          position: job.position,
          company: job.company,
          message: errorMessage,
        },
        {},
        ToastCategory.ERROR,
        10000
      );
      set({ error: `Failed to delete job: ${errorMessage}` });
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
      // Use the API client instead of direct Firebase access
      const updatedJob = await jobsApi.updateJob(job);
      
      set((state) => ({
        jobs: state.jobs.map((j) => (j.id === updatedJob.id ? updatedJob : j)),
      }));
    } catch (error: unknown) {
      console.error(`[jobStore.ts] Error updating job: ${job.id}`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      createTranslatedToast(
        'toasts.errors.updateJob',
        true,
        'toasts.titles.error',
        {
          position: job.position,
          company: job.company,
          message: errorMessage,
        },
        {},
        ToastCategory.ERROR,
        10000
      );
      set({ error: `Failed to update job: ${errorMessage}` });
    } finally {
      set({ isLoading: false });
    }

    return !get().error;
  },

  clearJobs: () => {
    set({ isLoading: true, error: null });
    try {
      set({ jobs: [] });
    } catch (error: unknown) {
      console.error(`[jobStore.ts] Error clearing jobs`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      createTranslatedToast(
        'toasts.errors.clearJobs',
        true,
        'toasts.titles.error',
        { message: errorMessage },
        {},
        ToastCategory.ERROR,
        10000
      );
      set({ error: `Failed to clear jobs: ${errorMessage}` });
    } finally {
      set({ isLoading: false });
    }

    return !get().error;
  },

  cleanupFieldValuesFromJobs: async (fieldID: CustomField['id']) => {
    if (!auth.currentUser) return false;

    set({ isLoading: true, error: null });
    try {
      // Use the API client instead of direct Firebase access
      await jobsApi.cleanupFieldValues(fieldID);
    } catch (error: unknown) {
      console.error(`[jobStore.ts] Error cleaning up field values`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      createTranslatedToast(
        'toasts.errors.cleanupFieldValues',
        true,
        'toasts.titles.error',
        { message: errorMessage },
        {},
        ToastCategory.ERROR,
        10000
      );
      set({ error: `Failed to clean up field values: ${errorMessage}` });
    } finally {
      set({ isLoading: false });
    }

    return !get().error;
  },
}));
