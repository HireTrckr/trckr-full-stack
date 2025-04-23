// context/tagStore.ts

import { create } from 'zustand';
import { TagMap, TagNotSavedInDB } from '../types/tag';
import { getDoc, setDoc, updateDoc, deleteField } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { doc } from 'firebase/firestore';
import { timestampToDate } from '../utils/timestampUtils';
import { Job } from '../types/job';
import { useJobStore } from './jobStore';
import { Tag } from '../types/tag';
import { getRandomTailwindColor } from '../utils/generateRandomColor';
import { ToastCategory } from '../types/toast';
import { useToastStore } from './toastStore';

/**
 * @interface TagStore
 * @description Manages the application's tag state and operations
 */
type TagStore = {
  /** Current map of all tags */
  tagMap: TagMap;
  /** Loading state indicator */
  isLoading: boolean;
  /** Current error state */
  error: string | null;

  /**
   * Fetches all tags for the current user
   * @returns Promise<boolean> - Success status of the operation
   */
  fetchTags: () => Promise<boolean>;

  /**
   * Creates a new tag
   * @param tag - Partial tag object containing required fields
   * @returns Promise<string | false> - New tag ID if successful, false otherwise
   */
  createTag: (tag: Partial<TagNotSavedInDB>) => Promise<string | false>;

  /**
   * @function deleteTag
   * @description Deletes a tag and removes it from all associated jobs
   * @param tagId - The ID of the tag to delete
   * @returns Promise<boolean> - Success status of the operation
   * @throws Error if tag deletion fails or user is not authenticated
   */
  deleteTag: (tagId: string) => Promise<boolean>;

  /**
   * @function getRecentTags
   * @description Retrieves the most recently updated tags
   * @param limit - Maximum number of tags to return
   * @returns Array of tags sorted by update timestamp
   */
  getRecentTags: (limit: number) => Tag[];

  /**
   * @function addTagToJob
   * @description Associates a tag with a specific job
   * @param jobId - The ID of the job
   * @param tagId - The ID of the tag to add
   * @returns Promise<boolean> - Success status of the operation
   * @throws Error if job has reached tag limit or tag already exists on job
   */
  addTagToJob: (jobId: Job['id'], tagId: Tag['id']) => Promise<boolean>;

  /**
   * @function removeTagFromJob
   * @description Removes a tag association from a specific job
   * @param jobId - The ID of the job
   * @param tagId - The ID of the tag to remove
   * @returns Promise<boolean> - Success status of the operation
   * @throws Error if job or tag not found
   */
  removeTagFromJob: (jobId: Job['id'], tagId: Tag['id']) => Promise<boolean>;

  /**
   * @function clearTags
   * @description Clears all tags from local state (does not affect server data)
   * @returns boolean - Success status of the operation
   */
  clearTags: () => boolean;

  /**
   * @function getTagsFromJob
   * @description Retrieves all tags associated with a specific job
   * @param job - The job object to get tags from
   * @returns Array of Tag objects associated with the job
   */
  getTagsFromJob: (job: Job) => Tag[];

  /**
   * @function updateTag
   * @description Updates an existing tag's properties
   * @param tag - The updated tag object
   * @returns Promise<boolean> - Success status of the operation
   * @throws Error if tag doesn't exist or update fails
   */
  updateTag: (tag: Tag) => Promise<boolean>;
};

/**
 * @interface TagStorePlusPrivate
 * @description Extended interface that includes private methods and properties
 * @extends TagStore
 */
type TagStorePlusPrivate = TagStore & {
  /** Timestamp of last successful tag fetch */
  _lastFetched: Date | null;

  /**
   * Calculates the number of jobs using a specific tag
   * @param tagId - The ID of the tag to count
   * @returns The number of jobs using the tag
   * @private
   */
  _calculateTagCount: (tagId: Tag['id']) => number;
};

/**
 * @constant TAGS_PER_RECORD
 * @description Maximum number of tags allowed per job record
 */
export const TAGS_PER_RECORD = 5;

const { createToast } = useToastStore.getState();

export const useTagStore = create<TagStore>((set, get) => {
  const self = get as () => TagStorePlusPrivate;

  return {
    tagMap: {},

    isLoading: false,

    error: null,

    _lastFetched: null,

    fetchTags: async () => {
      if (!auth.currentUser) return false;

      set({ isLoading: true, error: null });
      try {
        // not using query as tags are in one document
        const tagsRef = doc(db, `users/${auth.currentUser.uid}/metadata/tags`);
        const tagsDoc = await getDoc(tagsRef);

        if (!tagsDoc.exists()) {
          console.warn('[tagStore.ts] No tags file found');
          await setDoc(tagsRef, { tagMap: {} });
          set({ tagMap: {}, isLoading: false });
          return true;
        }

        const tagData = tagsDoc.data();
        const tagMap: TagMap = {};

        if (tagData.tagMap) {
          Object.entries(tagData.tagMap).forEach(
            ([tagId, tagData]: [string, any]) => {
              if (!tagData || typeof tagData !== 'object') return;

              tagMap[tagId] = {
                id: tagId,
                name: tagData.name,
                color: tagData.color,
                count: Math.max(tagData.count, 0), // sometimes there is negative glitches
                timestamps: {
                  createdAt: timestampToDate(tagData.timestamps?.createdAt),
                  updatedAt: timestampToDate(tagData.timestamps?.updatedAt),
                  deletedAt: timestampToDate(tagData.timestamps?.deletedAt),
                },
              };
            }
          );
        }

        set({ tagMap, _lastFetched: new Date() } as TagStorePlusPrivate);
      } catch (error) {
        console.error('[tagStore.ts] Error fetching tags:', error);
        createToast(
          (error as Error).message,
          true,
          'Error fetching tags',
          ToastCategory.ERROR,
          10000
        );
        set({ error: `Failed to fetch tags: ${error}` });
      } finally {
        set({ isLoading: false });
      }

      return !get().error;
    },

    _calculateTagCount(tagId: string) {
      const jobsWithTag = get().tagMap[tagId]
        ? useJobStore.getState().getJobsWithTags([tagId])
        : [];

      return jobsWithTag.length;
    },

    deleteTag: async (tagId: string) => {
      if (!auth.currentUser) return false;

      set({ isLoading: true, error: null });
      try {
        // check if any jobs use tag
        const tag = get().tagMap[tagId];

        const jobsWithTag = tag
          ? useJobStore.getState().getJobsWithTags([tagId])
          : [];

        if (jobsWithTag.length > 0) {
          // remove tag from jobs
          const jobStore = useJobStore.getState();
          const updatePromises = jobsWithTag.map((job: Job) => {
            const updatedTags =
              job.tagIds?.filter((tag) => tag !== tagId) || [];
            return jobStore.updateJob({ ...job, tagIds: updatedTags });
          });

          await Promise.all(updatePromises);
        }

        const tagsRef = doc(db, `users/${auth.currentUser.uid}/metadata/tags`);

        if (!tagsRef) {
          throw new Error('Tags document not found');
        }

        await updateDoc(tagsRef, {
          [`tagMap.${tagId}`]: deleteField(),
        });

        // remove tag from local state
        const newTagMap = { ...get().tagMap };
        delete newTagMap[tagId];
        set({ tagMap: newTagMap });
        createToast(
          `Tag deleted successfully`,
          true,
          'Tag Deleted',
          ToastCategory.INFO,
          3000,
          () => {},
          (toast) => {
            // undo function
            get().createTag(tag);
          }
        );
      } catch (error) {
        console.error(`[tagStore.ts] Error deleting tag: ${tagId}`, error);
        createToast(
          (error as Error).message,
          true,
          `Error deleting tag ${get().tagMap[tagId].name}`,
          ToastCategory.ERROR,
          10000
        );
        set({ error: `Failed to delete tag: ${error}` });
      } finally {
        set({ isLoading: false });
      }

      // return whether there is not an error t/f
      return !get().error;
    },

    createTag: async (tag: Partial<TagNotSavedInDB>) => {
      if (!auth.currentUser) return false;
      if (!tag || !tag.name) return false;

      set({ isLoading: true, error: null });
      try {
        const newID = tag.name.toLowerCase().replace(/\s/g, '-');

        if (get().tagMap[newID]) {
          throw new Error('Tag already exists');
        }

        const newTag: Tag = {
          id: newID,
          name: tag.name,
          color: tag.color || getRandomTailwindColor().tailwindColorName,
          count: 0,
          timestamps: {
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          },
        };

        await updateDoc(
          doc(db, `users/${auth.currentUser.uid}/metadata/tags`),
          {
            [`tagMap.${newTag.id}`]: newTag,
          }
        );

        set((state) => ({
          tagMap: { ...state.tagMap, [newID]: newTag },
          isLoading: false,
        }));

        createToast(
          `Tag "${newTag.name}" created successfully`,
          true,
          'Status Created',
          ToastCategory.INFO,
          5000,
          () => {},
          () => {
            get().deleteTag(newID);
          }
        );
        return newID;
      } catch (error) {
        console.error(`[tagStore.ts] Error creating tag: ${tag.name}`, error);
        createToast(
          (error as Error).message,
          true,
          `Error creating tag ${tag.name}`,
          ToastCategory.ERROR,
          10000
        );
        set({ error: `Failed to create tag: ${error}` });
        return false;
      }
    },

    addTagToJob: async (jobId: Job['id'], tagId: Tag['id']) => {
      if (!auth.currentUser) return false;
      if (!jobId || !tagId) return false;

      try {
        set({ isLoading: true, error: null });

        // update job with tag
        const jobStore = useJobStore.getState();
        const job = jobStore.jobs.find((job: Job) => job.id === jobId);

        if (!job) {
          throw new Error('Job not found');
        }

        if (!job.tagIds) {
          job.tagIds = [];
        }

        // check if job has reached tag limit already
        if (job.tagIds.length > TAGS_PER_RECORD) {
          throw new Error('Job has reached the maximum number of tags');
        }

        // check if job already has this tag
        if (job.tagIds.includes(tagId)) {
          throw new Error('Job already has this tag');
        }

        let tag = get().tagMap[tagId];

        if (!tag) {
          // need to create new tag
          if (
            !(await get().createTag({
              name: 'untitled',
              color: getRandomTailwindColor().tailwindColorName,
              count: 1,
            } as TagNotSavedInDB))
          ) {
            throw new Error('Failed to create tag');
          }
          tag = get().tagMap[tagId];
        }

        const updatedJob: Job = {
          ...job,
          tagIds: job.tagIds ? [...job.tagIds, tagId] : [tagId],
        };
        await jobStore.updateJob(updatedJob);

        const newCount = self()._calculateTagCount(tagId);

        await updateDoc(
          doc(db, `users/${auth.currentUser.uid}/metadata/tags`),
          {
            [`tagMap.${tagId}`]: {
              ...tag,
              count: newCount,
              timestamps: {
                ...tag.timestamps,
                updatedAt: new Date(),
              },
            },
          }
        );
        set((state) => ({
          tagMap: {
            ...state.tagMap,
            [tagId]: {
              ...state.tagMap[tagId],
              count: newCount,
            },
          },
        }));
        createToast(
          `Tag "${tag.name}" added to job successfully`,
          true,
          'Tag Added',
          ToastCategory.INFO,
          3000,
          () => {},
          (toast) => {
            // undo function
            get().removeTagFromJob(jobId, tagId);
          }
        );
      } catch (error) {
        console.error(`[tagStore.ts] Error adding tag to job: ${jobId}`, error);
        createToast(
          (error as Error).message,
          true,
          `Error adding tag to job`,
          ToastCategory.ERROR,
          10000
        );
        set({
          error: `Failed to add tag [${tagId}] to job [${jobId}]: ${error}`,
        });
      } finally {
        set({ isLoading: false });

        // fetch new tags and jobs
        await get().fetchTags();
        await useJobStore.getState().fetchJobs();
      }

      return !get().error;
    },

    removeTagFromJob: async (jobId: Job['id'], tagId: Tag['id']) => {
      if (!auth.currentUser) return false;
      if (!jobId || !tagId) return false;

      try {
        set({ isLoading: true, error: null });

        const tag = get().tagMap[tagId];

        if (!tag) {
          console.error(`[tagStore.ts] Tag not found: ${tagId}`);
          throw new Error('Tag not found');
        }

        const newCount = self()._calculateTagCount(tagId) - 1;

        if (newCount <= 0) {
          await get().deleteTag(tagId);
        } else {
          await updateDoc(
            doc(db, `users/${auth.currentUser.uid}/metadata/tags`),
            {
              [`tagMap.${tagId}`]: {
                ...tag,
                count: newCount,
                timestamps: {
                  ...tag.timestamps,
                  updatedAt: new Date(),
                },
              },
            }
          );
        }

        const jobStore = useJobStore.getState();
        const job = jobStore.jobs.find((job: Job) => job.id === jobId);
        if (!job) {
          console.error(`[tagStore.ts] Job not found: ${jobId}`);
          throw new Error('Job not found');
        }

        const updatedJob: Job = {
          ...job,
          tagIds: (job.tagIds || []).filter((tag) => tag !== tagId),
        };
        await jobStore.updateJob(updatedJob);
        createToast(
          `Tag "${tag.name}" removed from job successfully`,
          true,
          'Tag Removed',
          ToastCategory.INFO,
          3000,
          () => {},
          (toast) => {
            // undo function
            get().addTagToJob(jobId, tagId);
          }
        );
      } catch (error) {
        console.error(
          `[tagStore.ts] Error removing tag from job: ${jobId}`,
          error
        );
        createToast(
          (error as Error).message,
          true,
          `Error removing tag from job`,
          ToastCategory.ERROR,
          10000
        );
        set({
          error: `Failed to remove tag [${tagId}] from job [${jobId}]: ${error}`,
        });
      } finally {
        set({ isLoading: false });

        // fetch new tags and jobs
        await get().fetchTags();
        await useJobStore.getState().fetchJobs();
      }

      return !get().error;
    },

    getRecentTags(limit: number = 5): Tag[] {
      if (limit <= 0) return [];
      const tags = Object.values(get().tagMap);
      tags.sort((a, b) => {
        return (
          b.timestamps.updatedAt.getTime() - a.timestamps.updatedAt.getTime()
        );
      });
      return tags.slice(0, limit);
    },

    clearTags: () => {
      set({ isLoading: true, error: null });
      try {
        set({ tagMap: {} });
      } catch (error) {
        console.error(`[tagStore.ts] Error clearing tags`, error);
        set({ error: `Failed to clear tags: ${error}` });
      } finally {
        set({ isLoading: false });
      }
      return !get().error;
    },

    updateTag: async (updatedTag: Tag) => {
      if (!auth.currentUser) return false;

      if (!updatedTag.id) return false;

      if (!get().tagMap[updatedTag.id]) return false;

      set({ isLoading: true, error: null });
      try {
        await updateDoc(
          doc(db, `users/${auth.currentUser.uid}/metadata/tags`),
          {
            [`tagMap.${updatedTag.id}`]: updatedTag,
          }
        );
        set((state) => ({
          tagMap: {
            ...state.tagMap,
            [updatedTag.id]: updatedTag,
          },
        }));
        createToast(
          `Tag "${updatedTag.name}" updated successfully`,
          true,
          'Tag Updated',
          ToastCategory.INFO,
          3000
        );
      } catch (error) {
        console.error(
          `[tagStore.ts] Error updating tag: ${updatedTag.id}`,
          error
        );
        createToast(
          (error as Error).message,
          true,
          `Error updating tag`,
          ToastCategory.ERROR,
          10000
        );
        set({ error: `Failed to update job: ${error}` });
      } finally {
        set({ isLoading: false });
      }

      return !get().error;
    },

    getTagsFromJob(job: Job) {
      if (!job.tagIds) return [];
      return job.tagIds
        .map((tagId) => get().tagMap[tagId])
        .filter((tag): tag is Tag => tag != undefined);
    },
  } as TagStorePlusPrivate;
});
