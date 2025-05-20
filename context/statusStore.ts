// context/statusStore.ts
import { create } from 'zustand';
import { auth } from '../lib/firebase';
import {
  JobStatus,
  JobStatusNotSavedInDB,
  StatusMap,
} from '../types/jobStatus';
import { useToastStore } from './toastStore';
import { ToastCategory } from '../types/toast';
import { getRandomTailwindColor } from '../utils/generateRandomColor';
import { useJobStore } from './jobStore';
import { statusesApi } from '../lib/api';
import { getIDFromName } from '../utils/idUtils';
import { Timestamp } from 'firebase/firestore';
import { TimestampsFromJSON } from '../utils/dateUtils';
import { reqOptions } from '../types/reqOptions';

type StatusStore = {
  /** Current map of all statuses (both default and custom) */
  statusMap: StatusMap;
  /** Loading state for async operations */
  isLoading: boolean;
  /** Error message if any operation fails */
  error: string | null;

  /**
   * Fetches both default statuses from config/defaultStatuses and user's custom statuses,
   * then merges them together. Custom statuses override default ones with the same ID.
   * @returns Promise<boolean> - True if fetch was successful, false otherwise
   */
  fetchStatuses: (options?: reqOptions) => Promise<boolean>;

  /**
   * Creates a new custom status for the user.
   * Generates a unique ID and timestamps automatically.
   * @param status - Partial status object containing at minimum a name and optional color
   * @returns Promise<string | false> - The new status ID if successful, false if failed
   */
  createStatus: (
    status: Partial<JobStatusNotSavedInDB>,
    options?: reqOptions
  ) => Promise<string | false>;

  /**
   * Deletes a custom status. Default statuses cannot be deleted.
   * @param statusId - The ID of the status to delete
   * @returns Promise<boolean> - True if deletion was successful, false if failed or status is non-deletable
   */
  deleteStatus: (
    statusId: JobStatus['id'],
    options?: reqOptions
  ) => Promise<boolean>;

  /**
   * Updates an existing custom status. Default statuses cannot be modified.
   * Automatically updates the updatedAt timestamp.
   * @param status - Complete status object with updates
   * @returns Promise<boolean> - True if update was successful, false if failed or status is non-modifiable
   */
  updateStatus: (status: JobStatus, options?: reqOptions) => Promise<boolean>;

  /**
   * Resets all statuses to default by:
   * 1. Fetching default statuses from config/defaultStatuses
   * 2. Deleting all user's custom statuses from Firestore
   * 3. Resetting local state to only default statuses
   * @returns Promise<boolean> - True if reset was successful, false if failed
   */
  resetStatuses: (options?: reqOptions) => Promise<boolean>;

  /**
   * Clears all statuses from local state.
   * Does not affect Firestore data.
   * Typically used during logout or cleanup.
   * @returns boolean - Always returns true
   */
  clearStatuses: () => boolean;

  getStatusFromID: (statusID: JobStatus['id']) => JobStatus;
};

const { createTranslatedToast } = useToastStore.getState();

export const useStatusStore = create<StatusStore>((set, get) => ({
  statusMap: {},
  isLoading: false,
  error: null,

  fetchStatuses: async (options?: reqOptions) => {
    if (!auth.currentUser) return false;
    set({ isLoading: true, error: null });

    try {
      // Use the API client instead of direct Firebase access
      const statusMap: StatusMap = {};

      for (let [statusId, status] of Object.entries(
        await statusesApi.fetchStatuses(options)
      )) {
        statusMap[statusId] = {
          ...status,
          timestamps: TimestampsFromJSON(status.timestamps),
        } as JobStatus;
      }

      set({
        statusMap,
        isLoading: false,
      });
      return true;
    } catch (error: unknown) {
      console.error('[statusStore.ts] Error fetching statuses:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      createTranslatedToast(
        'toasts.errors.fetchStatuses',
        true,
        'toasts.titles.error',
        { message: errorMessage },
        {},
        ToastCategory.ERROR
      );
      set({
        error: `Failed to fetch statuses: ${errorMessage}`,
        isLoading: false,
      });
      return false;
    }
  },

  createStatus: async (
    status: Partial<JobStatusNotSavedInDB>,
    options?: reqOptions
  ) => {
    if (!auth.currentUser) return false;
    if (!status || !status.statusName) return false;

    set({ isLoading: true, error: null });
    try {
      const newID = getIDFromName(status.statusName);

      if (get().statusMap[newID]) {
        throw new Error('Status already exists');
      }

      // Use the API client instead of direct Firebase access
      const newStatus = await statusesApi.createStatus(
        {
          statusName: status.statusName || 'New Status',
          color: status.color || getRandomTailwindColor().tailwindColorName,
        },
        options
      );

      set((state) => ({
        statusMap: { ...state.statusMap, [newStatus.id]: newStatus },
        isLoading: false,
      }));

      createTranslatedToast(
        'toasts.statusCreated',
        true,
        'toasts.titles.statusCreated',
        { name: newStatus.statusName },
        {},
        ToastCategory.INFO,
        5000,
        undefined,
        () => {
          get().deleteStatus(newStatus.id, { source: 'notifications' });
        }
      );

      return newStatus.id;
    } catch (error: unknown) {
      console.error('[statusStore.ts] Error creating status:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      createTranslatedToast(
        'toasts.errors.createStatus',
        true,
        'toasts.titles.error',
        { name: status.statusName, message: errorMessage },
        {},
        ToastCategory.ERROR
      );
      set({
        error: `Failed to create status: ${errorMessage}`,
        isLoading: false,
      });
      return false;
    }
  },

  deleteStatus: async (statusId: JobStatus['id'], options?: reqOptions) => {
    if (!auth.currentUser) return false;
    const status = get().statusMap[statusId];

    if (!status) return false;

    if (!status.deletable) {
      createTranslatedToast(
        'toasts.errors.cannotDeleteDefaultStatus',
        true,
        'toasts.titles.operationFailed',
        { name: status.statusName },
        {},
        ToastCategory.ERROR
      );
      return false;
    }

    set({ isLoading: true, error: null });

    try {
      // Use the API client instead of direct Firebase access
      await statusesApi.deleteStatus(statusId, options);

      set((state) => {
        const newStatusMap = { ...state.statusMap };
        delete newStatusMap[statusId];
        return { statusMap: newStatusMap, isLoading: false };
      });

      // change jobs with this status to not allowed

      createTranslatedToast(
        'toasts.statusDeleted',
        true,
        'toasts.titles.statusDeleted',
        { name: status.statusName },
        {},
        ToastCategory.INFO,
        5000,
        undefined,
        () => {
          get().createStatus(status, { source: 'notification' });
        }
      );

      get().fetchStatuses(options);

      return true;
    } catch (error: unknown) {
      console.error('[statusStore.ts] Error deleting status:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      createTranslatedToast(
        'toasts.errors.deleteStatus',
        true,
        'toasts.titles.error',
        { name: status.statusName, message: errorMessage },
        {},
        ToastCategory.ERROR
      );
      set({
        error: `Failed to delete status: ${errorMessage}`,
        isLoading: false,
      });
      return false;
    }
  },

  updateStatus: async (status: JobStatus, options?: reqOptions) => {
    if (!auth.currentUser) return false;
    const existingStatus = get().statusMap[status.id];

    if (!existingStatus) return false;

    if (!existingStatus.deletable) {
      createTranslatedToast(
        'toasts.errors.cannotModifyDefaultStatus',
        true,
        'toasts.titles.operationFailed',
        { name: existingStatus.statusName },
        {},
        ToastCategory.ERROR
      );
      return false;
    }

    set({ isLoading: true, error: null });

    try {
      // Use the API client instead of direct Firebase access
      const updatedStatus = await statusesApi.updateStatus(status, options);

      set((state) => ({
        statusMap: { ...state.statusMap, [updatedStatus.id]: updatedStatus },
        isLoading: false,
      }));

      createTranslatedToast(
        'toasts.statusUpdated',
        true,
        'toasts.titles.statusUpdated',
        { name: status.statusName },
        {},
        ToastCategory.INFO,
        5000,
        undefined,
        () => {
          get().updateStatus(existingStatus, { source: 'notifications' });
        }
      );

      return true;
    } catch (error: unknown) {
      console.error('[statusStore.ts] Error updating status:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      createTranslatedToast(
        'toasts.errors.updateStatus',
        true,
        'toasts.titles.error',
        { name: status.statusName, message: errorMessage },
        {},
        ToastCategory.ERROR
      );
      set({
        error: `Failed to update status: ${errorMessage}`,
        isLoading: false,
      });
      return false;
    }
  },

  resetStatuses: async (options?: reqOptions) => {
    if (!auth.currentUser) return false;
    set({ isLoading: true, error: null });

    try {
      // Use the API client instead of direct Firebase access
      const statusMap = await statusesApi.resetStatuses(options);

      // Update local state with just default statuses
      set({
        statusMap,
        isLoading: false,
      });

      createTranslatedToast(
        'toasts.statusesReset',
        true,
        'toasts.titles.statusesReset',
        {},
        {},
        ToastCategory.INFO
      );

      return true;
    } catch (error: unknown) {
      console.error('[statusStore.ts] Error resetting statuses:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      createTranslatedToast(
        'toasts.errors.resetStatuses',
        true,
        'toasts.titles.error',
        { message: errorMessage },
        {},
        ToastCategory.ERROR
      );
      set({ error: `Failed to reset statuses: ${error}`, isLoading: false });
      return false;
    }
  },

  clearStatuses: () => {
    set({ statusMap: {}, isLoading: false, error: null });
    return true;
  },

  getStatusFromID: (statusID: JobStatus['id']) => {
    return (
      get().statusMap[statusID] ||
      (get().statusMap['not-applied'] as JobStatus) ||
      ({
        id: 'not-applied',
        statusName: 'default-status.not-applied',
        color: getRandomTailwindColor().tailwindColorName,
        deletable: false,
        timestamps: {
          createdAt: Timestamp.fromDate(new Date()),
          updatedAt: Timestamp.fromDate(new Date()),
          deletedAt: null,
        },
      } as JobStatus)
    );
  },
}));
