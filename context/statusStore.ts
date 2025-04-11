// context/statusStore.ts
import { create } from 'zustand';
import { auth, db } from '../lib/firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteField,
  DocumentReference,
  DocumentData,
} from 'firebase/firestore';
import {
  JobStatus,
  JobStatusNotSavedInDB,
  StatusMap,
} from '../types/jobStatus';
import { useToastStore } from './toastStore';
import { ToastCategory } from '../types/toast';
import { getRandomTailwindColor } from '../utils/generateRandomColor';
import { useJobStore } from './jobStore';
import { timestampToDate } from '../utils/timestampUtils';

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
  fetchStatuses: () => Promise<boolean>;

  /**
   * Creates a new custom status for the user.
   * Generates a unique ID and timestamps automatically.
   * @param status - Partial status object containing at minimum a name and optional color
   * @returns Promise<string | false> - The new status ID if successful, false if failed
   */
  createStatus: (
    status: Partial<JobStatusNotSavedInDB>
  ) => Promise<string | false>;

  /**
   * Deletes a custom status. Default statuses cannot be deleted.
   * @param statusId - The ID of the status to delete
   * @returns Promise<boolean> - True if deletion was successful, false if failed or status is non-deletable
   */
  deleteStatus: (statusId: JobStatus['id']) => Promise<boolean>;

  /**
   * Updates an existing custom status. Default statuses cannot be modified.
   * Automatically updates the updatedAt timestamp.
   * @param status - Complete status object with updates
   * @returns Promise<boolean> - True if update was successful, false if failed or status is non-modifiable
   */
  updateStatus: (status: JobStatus) => Promise<boolean>;

  /**
   * Resets all statuses to default by:
   * 1. Fetching default statuses from config/defaultStatuses
   * 2. Deleting all user's custom statuses from Firestore
   * 3. Resetting local state to only default statuses
   * @returns Promise<boolean> - True if reset was successful, false if failed
   */
  resetStatuses: () => Promise<boolean>;

  /**
   * Clears all statuses from local state.
   * Does not affect Firestore data.
   * Typically used during logout or cleanup.
   * @returns boolean - Always returns true
   */
  clearStatuses: () => boolean;

  getStatusFromID: (statusID: JobStatus['id']) => JobStatus;
};

const { createToast } = useToastStore.getState();
const { getJobsWithStatus, updateJob } = useJobStore.getState();

const getStatusMap = async (
  ref: DocumentReference<DocumentData, DocumentData>,
  onErrorMsg?: string
): Promise<StatusMap> => {
  const statusDoc = await getDoc(ref);

  if (!statusDoc.exists()) {
    createToast(
      onErrorMsg ?? 'Statuses not found',
      true,
      'Error',
      ToastCategory.ERROR
    );
    return {} as StatusMap;
  }

  return statusDoc.data().statusMap ?? statusDoc.data();
};

const getDefaultStatusMap = async (): Promise<StatusMap> => {
  return await getStatusMap(
    doc(db, 'config/defaultStatusMap'),
    'Default statuses not found'
  );
};

const getUserCustomStatusMap = async (): Promise<StatusMap> => {
  if (!auth.currentUser) return {} as StatusMap;
  const map = await getStatusMap(
    doc(db, `users/${auth.currentUser.uid}/metadata/statuses`),
    'User statuses not found'
  );
  return map;
};

export const useStatusStore = create<StatusStore>((set, get) => ({
  statusMap: {},
  isLoading: false,
  error: null,

  fetchStatuses: async () => {
    if (!auth.currentUser) return false;
    set({ isLoading: true, error: null });

    try {
      const defaultStatuses = await getDefaultStatusMap();

      const customStatuses = await getUserCustomStatusMap();

      Object.values(customStatuses).map((status: JobStatus) => {
        if (status.timestamps) {
          status.timestamps.createdAt = timestampToDate(
            status.timestamps.createdAt
          );
          status.timestamps.updatedAt = timestampToDate(
            status.timestamps.updatedAt
          );
        }
      });

      Object.values(defaultStatuses).map((status: JobStatus) => {
        if (status.timestamps) {
          status.timestamps.createdAt = timestampToDate(
            status.timestamps.createdAt
          );
          status.timestamps.updatedAt = timestampToDate(
            status.timestamps.updatedAt
          );
        }
      });

      // Merge default statuses with custom ones (custom ones override defaults if same ID)
      set({
        statusMap: { ...defaultStatuses, ...customStatuses },
        isLoading: false,
      });
      return true;
    } catch (error) {
      console.error('[statusStore.ts] Error fetching statuses:', error);
      set({ error: `Failed to fetch statuses: ${error}`, isLoading: false });
      return false;
    }
  },

  createStatus: async (status: Partial<JobStatusNotSavedInDB>) => {
    if (!auth.currentUser) return false;
    if (!status || !status.statusName) return false;

    set({ isLoading: true, error: null });
    try {
      const newID = status.statusName.toLowerCase().replace(/\s/g, '-');

      if (get().statusMap[newID]) {
        throw new Error('Status already exists');
      }

      const newStatus: JobStatus = {
        id: newID,
        statusName: status.statusName || 'New Status',
        color: status.color || getRandomTailwindColor().tailwindColorName,
        deletable: true,
        timestamps: {
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      };

      await updateDoc(
        doc(db, `users/${auth.currentUser.uid}/metadata/statuses`),
        {
          [`statusMap.${newID}`]: newStatus,
        }
      );

      set((state) => ({
        statusMap: { ...state.statusMap, [newID]: newStatus },
        isLoading: false,
      }));

      createToast(
        `Status "${newStatus.statusName}" created successfully`,
        true,
        'Status Created',
        ToastCategory.INFO,
        5000,
        undefined,
        () => {
          get().deleteStatus(newID);
        }
      );

      return newID;
    } catch (error) {
      console.error('[statusStore.ts] Error creating status:', error);
      set({ error: `Failed to create status: ${error}`, isLoading: false });
      return false;
    }
  },

  deleteStatus: async (statusId: JobStatus['id']) => {
    if (!auth.currentUser) return false;
    const status = get().statusMap[statusId];

    if (!status) return false;

    if (!status.deletable) {
      createToast(
        'Cannot delete default status',
        true,
        'Operation Failed',
        ToastCategory.ERROR
      );
      return false;
    }

    set({ isLoading: true, error: null });

    try {
      const statusRef = doc(
        db,
        `users/${auth.currentUser.uid}/metadata/statuses`
      );
      await updateDoc(statusRef, {
        [`statuses.${statusId}`]: deleteField(),
      });

      set((state) => {
        const newStatusMap = { ...state.statusMap };
        delete newStatusMap[statusId];
        return { statusMap: newStatusMap, isLoading: false };
      });

      // change jobs with this status to not allowed
      const jobsWithStatus = getJobsWithStatus(statusId);
      jobsWithStatus.forEach((job) => {
        updateJob({ ...job, statusID: 'notAllowed' });
      });

      createToast(
        `Status "${status.statusName}" deleted successfully`,
        true,
        'Status Deleted',
        ToastCategory.INFO,
        5000,
        undefined,
        () => {
          get().createStatus(status);
        }
      );

      return true;
    } catch (error) {
      console.error('[statusStore.ts] Error deleting status:', error);
      set({ error: `Failed to delete status: ${error}`, isLoading: false });
      return false;
    }
  },

  updateStatus: async (status: JobStatus) => {
    if (!auth.currentUser) return false;
    const existingStatus = get().statusMap[status.id];

    if (!existingStatus) return false;

    if (!existingStatus.deletable) {
      createToast(
        'Cannot modify default status',
        true,
        'Operation Failed',
        ToastCategory.ERROR
      );
      return false;
    }

    set({ isLoading: true, error: null });

    try {
      const statusRef = doc(
        db,
        `users/${auth.currentUser.uid}/metadata/statuses`
      );
      const updatedStatus = {
        ...status,
        timestamps: {
          ...status.timestamps,
          updatedAt: new Date(),
        },
      };

      await updateDoc(statusRef, {
        [`statuses.${status.id}`]: updatedStatus,
      });

      set((state) => ({
        statusMap: { ...state.statusMap, [status.id]: updatedStatus },
        isLoading: false,
      }));

      createToast(
        `Status "${status.statusName}" updated successfully`,
        true,
        'Status Updated',
        ToastCategory.INFO,
        5000,
        undefined,
        () => {
          get().updateStatus(existingStatus);
        }
      );

      return true;
    } catch (error) {
      console.error('[statusStore.ts] Error updating status:', error);
      set({ error: `Failed to update status: ${error}`, isLoading: false });
      return false;
    }
  },

  resetStatuses: async () => {
    if (!auth.currentUser) return false;
    set({ isLoading: true, error: null });

    try {
      // First fetch default statuses
      const defaultStatusRef = doc(db, 'config/defaultStatusMap');
      const defaultStatusDoc = await getDoc(defaultStatusRef);

      if (!defaultStatusDoc.exists()) {
        throw new Error('Default statuses not found');
      }

      const defaultStatuses = defaultStatusDoc.data() as StatusMap;

      // Reset user's statuses document to empty
      const userStatusRef = doc(
        db,
        `users/${auth.currentUser.uid}/metadata/statuses`
      );
      await setDoc(userStatusRef, {});

      // Update local state with just default statuses
      set({
        statusMap: defaultStatuses,
        isLoading: false,
      });

      createToast(
        'All statuses have been reset to defaults',
        true,
        'Statuses Reset',
        ToastCategory.INFO
      );

      return true;
    } catch (error) {
      console.error('[statusStore.ts] Error resetting statuses:', error);
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
        statusName: 'Not Applied',
        color: 'gray',
        deletable: false,
        timestamps: {
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      } as JobStatus)
    );
  },
}));
