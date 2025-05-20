// context/tagStore.ts

import { create } from 'zustand';
import { TagMap, TagNotSavedInDB } from '../types/tag';
import { auth } from '../lib/firebase';
import { Job } from '../types/job';
import { useJobStore } from './jobStore';
import { Tag } from '../types/tag';
import { getRandomTailwindColor } from '../utils/generateRandomColor';
import { ToastCategory } from '../types/toast';
import { useToastStore } from './toastStore';
import { tagsApi } from '../lib/api';
import { getIDFromName } from '../utils/idUtils';
import { TimestampsFromJSON } from '../utils/dateUtils';
import { reqOptions } from '../types/reqOptions';

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
  fetchTags: (options?: reqOptions) => Promise<boolean>;

  /**
   * Creates a new tag
   * @param tag - Partial tag object containing required fields
   * @returns Promise<string | false> - New tag ID if successful, false otherwise
   */
  createTag: (
    tag: Partial<TagNotSavedInDB>,
    options?: reqOptions
  ) => Promise<string | false>;

  /**
   * @function deleteTag
   * @description Deletes a tag and removes it from all associated jobs
   * @param tagId - The ID of the tag to delete
   * @returns Promise<boolean> - Success status of the operation
   * @throws Error if tag deletion fails or user is not authenticated
   */
  deleteTag: (tagId: string, options?: reqOptions) => Promise<boolean>;

  /**
   * @function addTagToJob
   * @description Associates a tag with a specific job
   * @param jobId - The ID of the job
   * @param tagId - The ID of the tag to add
   * @returns Promise<boolean> - Success status of the operation
   * @throws Error if job has reached tag limit or tag already exists on job
   */
  addTagToJob: (
    jobId: Job['id'],
    tagId: Tag['id'],
    options?: reqOptions
  ) => Promise<boolean>;

  /**
   * @function removeTagFromJob
   * @description Removes a tag association from a specific job
   * @param jobId - The ID of the job
   * @param tagId - The ID of the tag to remove
   * @returns Promise<boolean> - Success status of the operation
   * @throws Error if job or tag not found
   */
  removeTagFromJob: (
    jobId: Job['id'],
    tagId: Tag['id'],
    options?: reqOptions
  ) => Promise<boolean>;

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
  updateTag: (tag: Tag, options?: reqOptions) => Promise<boolean>;
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

const { createTranslatedToast } = useToastStore.getState();

export const useTagStore = create<TagStore>((set, get) => {
  const self = get as () => TagStorePlusPrivate;

  return {
    tagMap: {},

    isLoading: false,

    error: null,

    _lastFetched: null,

    fetchTags: async (options?: reqOptions) => {
      if (!auth.currentUser) return false;

      set({ isLoading: true, error: null });
      try {
        // Use the API client instead of direct Firebase access

        const tagMap: TagMap = {};

        // loop through all of the keys and values of the tagMap produced in await tagsApi.fetchTags()

        for (let [tagId, tag] of Object.entries(
          await tagsApi.fetchTags(options)
        )) {
          tagMap[tagId] = {
            ...tag,
            timestamps: TimestampsFromJSON({
              updatedAt: tag.timestamps.updatedAt,
              createdAt: tag.timestamps.createdAt,
              deletedAt: tag.timestamps.deletedAt ?? null,
            }),
          } as Tag;
        }

        set({ tagMap, _lastFetched: new Date() } as TagStorePlusPrivate);
      } catch (error: unknown) {
        console.error('[tagStore.ts] Error fetching tags:', error);
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        createTranslatedToast(
          'toasts.errors.fetchTags',
          true,
          'toasts.titles.error',
          { message: errorMessage },
          {},
          ToastCategory.ERROR,
          10000
        );
        set({ error: `Failed to fetch tags: ${errorMessage}` });
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

    deleteTag: async (tagId: string, options?: reqOptions) => {
      if (!auth.currentUser) return false;

      set({ isLoading: true, error: null });
      try {
        // check if any jobs use tag
        const tag = get().tagMap[tagId];

        if (!tag) {
          throw new Error('Tag not found');
        }

        // Use the API client instead of direct Firebase access
        await tagsApi.deleteTag(tagId, options);

        // remove tag from local state
        const newTagMap = { ...get().tagMap };
        delete newTagMap[tagId];
        set({ tagMap: newTagMap });

        createTranslatedToast(
          'toasts.tagDeleted',
          true,
          'toasts.titles.tagDeleted',
          { name: tag.name },
          {},
          ToastCategory.INFO,
          3000,
          () => {},
          () => {
            // undo function
            get().createTag(tag, { source: 'notification' });
          }
        );
      } catch (error: unknown) {
        console.error(`[tagStore.ts] Error deleting tag: ${tagId}`, error);
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';

        // Safely access tag name if it exists
        const tagName = get().tagMap[tagId]?.name || 'Unknown tag';

        createTranslatedToast(
          'toasts.errors.deleteTag',
          true,
          'toasts.titles.error',
          { name: tagName, message: errorMessage },
          {},
          ToastCategory.ERROR,
          10000
        );
        set({ error: `Failed to delete tag: ${errorMessage}` });
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
        const newID = getIDFromName(tag.name);

        if (get().tagMap[newID]) {
          throw new Error('Tag already exists');
        }

        // Use the API client instead of direct Firebase access
        const newTag = await tagsApi.createTag({
          name: tag.name,
          color: tag.color || getRandomTailwindColor().tailwindColorName,
        });

        set((state) => ({
          tagMap: { ...state.tagMap, [newTag.id]: newTag },
          isLoading: false,
        }));

        createTranslatedToast(
          'toasts.tagCreated',
          true,
          'toasts.titles.tagCreated',
          { name: newTag.name },
          {},
          ToastCategory.INFO,
          5000,
          () => {},
          () => {
            get().deleteTag(newTag.id, { source: 'notification' });
          }
        );
        return newTag.id;
      } catch (error: unknown) {
        console.error(`[tagStore.ts] Error creating tag: ${tag.name}`, error);
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        createTranslatedToast(
          'toasts.errors.createTag',
          true,
          'toasts.titles.error',
          { name: tag.name, message: errorMessage },
          {},
          ToastCategory.ERROR,
          10000
        );
        set({ error: `Failed to create tag: ${errorMessage}` });
        return false;
      }
    },

    addTagToJob: async (
      jobId: Job['id'],
      tagId: Tag['id'],
      options?: reqOptions
    ) => {
      if (!auth.currentUser) return false;
      if (!jobId || !tagId) return false;

      try {
        set({ isLoading: true, error: null });

        // Get the job
        const jobStore = useJobStore.getState();
        const job = jobStore.jobs.find((job: Job) => job.id === jobId);

        if (!job) {
          throw new Error('Job not found');
        }

        // Check if job has reached tag limit
        if (job.tagIds && job.tagIds.length > TAGS_PER_RECORD) {
          throw new Error('Job has reached the maximum number of tags');
        }

        // Check if job already has this tag
        if (job.tagIds && job.tagIds.includes(tagId)) {
          throw new Error('Job already has this tag');
        }

        // Get the tag
        let tag = get().tagMap[tagId];

        if (!tag) {
          // Need to create new tag if it doesn't exist
          const newTagId = await get().createTag(
            {
              name: 'untitled',
              color: getRandomTailwindColor().tailwindColorName,
            } as TagNotSavedInDB,
            options
          );

          if (!newTagId) {
            throw new Error('Failed to create tag');
          }

          tag = get().tagMap[tagId];
        }

        // Use the API client to add tag to job
        const { updatedTag } = await tagsApi.addTagToJob(jobId, tagId, options);

        // Update the tag in the local state
        set((state) => ({
          tagMap: {
            ...state.tagMap,
            [tagId]: {
              ...state.tagMap[tagId],
              count: updatedTag.count,
            },
          },
        }));

        createTranslatedToast(
          'toasts.tagAddedToJob',
          true,
          'toasts.titles.tagAdded',
          { name: tag.name },
          {},
          ToastCategory.INFO,
          3000,
          () => {},
          (toast) => {
            // undo function
            get().removeTagFromJob(jobId, tagId, { source: 'notification' });
          }
        );
      } catch (error: unknown) {
        console.error(`[tagStore.ts] Error adding tag to job: ${jobId}`, error);
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        createTranslatedToast(
          'toasts.errors.addTagToJob',
          true,
          'toasts.titles.error',
          { message: errorMessage },
          {},
          ToastCategory.ERROR,
          10000
        );
        set({
          error: `Failed to add tag [${tagId}] to job [${jobId}]: ${errorMessage}`,
        });
      } finally {
        set({ isLoading: false });

        // fetch new tags and jobs
        await get().fetchTags(options);
        await useJobStore.getState().fetchJobs();
      }

      return !get().error;
    },

    removeTagFromJob: async (jobId: Job['id'], tagId: Tag['id']) => {
      if (!auth.currentUser) return false;
      if (!jobId || !tagId) return false;

      try {
        set({ isLoading: true, error: null });

        // Get the tag
        const tag = get().tagMap[tagId];

        if (!tag) {
          console.error(`[tagStore.ts] Tag not found: ${tagId}`);
          throw new Error('Tag not found');
        }

        // Get the job
        const jobStore = useJobStore.getState();
        const job = jobStore.jobs.find((job: Job) => job.id === jobId);

        if (!job) {
          console.error(`[tagStore.ts] Job not found: ${jobId}`);
          throw new Error('Job not found');
        }

        // Use the API client to remove tag from job
        const { updatedTag, updatedJob } = await tagsApi.removeTagFromJob(
          jobId,
          tagId
        );

        // update state
        set((state) => ({
          tagMap: {
            ...state.tagMap,
            [tagId]: {
              ...state.tagMap[tagId],
              count: updatedTag.count,
            },
          },
        }));

        // update useJobStore state
        useJobStore.getState().jobs = useJobStore
          .getState()
          .jobs.map((j: Job) => (j.id === updatedJob.id ? updatedJob : j));

        createTranslatedToast(
          'toasts.tagRemovedFromJob',
          true,
          'toasts.titles.tagRemoved',
          { name: tag.name },
          {},
          ToastCategory.INFO,
          3000,
          () => {},
          (toast) => {
            // undo function
            get().addTagToJob(jobId, tagId, { source: 'notification' });
          }
        );
      } catch (error: unknown) {
        console.error(
          `[tagStore.ts] Error removing tag from job: ${jobId}`,
          error
        );
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        createTranslatedToast(
          'toasts.errors.removeTagFromJob',
          true,
          'toasts.titles.error',
          { message: errorMessage },
          {},
          ToastCategory.ERROR,
          10000
        );
        set({
          error: `Failed to remove tag [${tagId}] from job [${jobId}]: ${errorMessage}`,
        });
      } finally {
        set({ isLoading: false });

        // fetch new tags and jobs
        await get().fetchTags({ source: 'system' });
        await useJobStore.getState().fetchJobs();
      }

      return !get().error;
    },

    clearTags: () => {
      set({ isLoading: true, error: null });
      try {
        set({ tagMap: {} });
      } catch (error: unknown) {
        console.error(`[tagStore.ts] Error clearing tags`, error);
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        createTranslatedToast(
          'toasts.errors.clearTags',
          true,
          'toasts.titles.error',
          { message: errorMessage },
          {},
          ToastCategory.ERROR,
          10000
        );
        set({ error: `Failed to clear tags: ${errorMessage}` });
      } finally {
        set({ isLoading: false });
      }
      return !get().error;
    },

    updateTag: async (updatedTag: Tag, options?: reqOptions) => {
      if (!auth.currentUser) return false;
      if (!updatedTag.id) return false;
      if (!get().tagMap[updatedTag.id]) return false;

      set({ isLoading: true, error: null });
      try {
        // Use the API client instead of direct Firebase access
        const tag = await tagsApi.updateTag(updatedTag, options);

        set((state) => ({
          tagMap: {
            ...state.tagMap,
            [tag.id]: tag,
          },
        }));

        createTranslatedToast(
          'toasts.tagUpdated',
          true,
          'toasts.titles.tagUpdated',
          { name: tag.name },
          {},
          ToastCategory.INFO,
          3000
        );
      } catch (error: unknown) {
        console.error(
          `[tagStore.ts] Error updating tag: ${updatedTag.id}`,
          error
        );
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        createTranslatedToast(
          'toasts.errors.updateTag',
          true,
          'toasts.titles.error',
          { name: updatedTag.name, message: errorMessage },
          {},
          ToastCategory.ERROR,
          10000
        );
        set({ error: `Failed to update tag: ${errorMessage}` });
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
