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

type TagStore = {
  tagMap: TagMap;
  isLoading: boolean;
  error: string | null;

  // actions
  fetchTags: () => Promise<boolean>;

  /**
   * Takes in a tag name to create and assigns necesary server atributes
   * @param tagName - name of tag to create
   * @returns the id of the tag if successful tag creation, false otherwise
   * */
  createTag: (tag: Partial<TagNotSavedInDB>) => Promise<string | false>;
  deleteTag: (tagId: Tag['id']) => Promise<boolean>;
  getRecentTags: (limit: number) => Tag[];
  addTagToJob: (jobId: Job['id'], tagId: Tag['id']) => Promise<boolean>;
  removeTagFromJob: (jobId: Job['id'], tagId: Tag['id']) => Promise<boolean>;
  clearTags: () => boolean; // doesn't delete from server, only clears locally saved tags
  getTagsFromJob: (job: Job) => Tag[];
  updateTag: (tag: Tag) => Promise<boolean>;
};

type TagStorePlusPrivate = TagStore & {
  _lastFetched: Date | null;
  _calculateTagCount: (tagId: Tag['id']) => number;
};

export const TAGS_PER_RECORD = 5;

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
                  createdAt: tagData.timestamps?.createdAt.toDate(),
                  updatedAt: timestampToDate(tagData.timestamps?.updatedAt),
                },
              };
            }
          );
        }

        set({ tagMap, _lastFetched: new Date() } as TagStorePlusPrivate);
      } catch (error) {
        console.error('[tagStore.ts] Error fetching tags:', error);
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
      if (!tagId) return false;

      set({ isLoading: true, error: null });
      try {
        // check if any jobs use tag
        const jobsWithTag = get().tagMap[tagId]
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
      } catch (error) {
        console.error(`[tagStore.ts] Error deleting tag: ${tagId}`, error);
        set({ error: `Failed to delete tag: ${error}` });
      } finally {
        set({ isLoading: false });

        // fetch new tags and jobs
        await get().fetchTags();
        await useJobStore.getState().fetchJobs();
      }

      // return whether there is not an error t/f
      return !get().error;
    },

    createTag: async (tag: Partial<TagNotSavedInDB>) => {
      if (!auth.currentUser) return false;
      if (!tag || !tag.name) return false;

      set({ isLoading: true, error: null });
      try {
        // create tag object
        const newID = tag.name.toLowerCase().replace(/\s/g, '-');
        if (get().tagMap[newID]) {
          set(
            (state) =>
              ({
                tagMap: {
                  ...state.tagMap,
                  [newID]: {
                    ...state.tagMap[newID],
                    count: self()._calculateTagCount(newID) + 1,
                  },
                },
              }) as TagStorePlusPrivate
          );

          await updateDoc(
            doc(db, `users/${auth.currentUser.uid}/metadata/tags`),
            {
              [`tagMap.${newID}`]: get().tagMap[newID],
            }
          );
        } else {
          const newTag: Tag = {
            name: tag.name,
            color: tag.color || getRandomTailwindColor().tailwindColorName,
            count: 0,
            id: tag.name.toLowerCase().replace(/\s/g, '-'),
            timestamps: {
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          };

          await updateDoc(
            doc(db, `users/${auth.currentUser.uid}/metadata/tags`),
            {
              [`tagMap.${newTag.id}`]: newTag,
            }
          );
        }
        return newID;
      } catch (error) {
        console.error(`[tagStore.ts] Error creating tag: ${tag.name}`, error);
        set({ error: `Failed to create tag: ${error}` });
      } finally {
        set({ isLoading: false });

        // fetch new tags
        await get().fetchTags();
      }

      return !get().error;
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
      } catch (error) {
        console.error(`[tagStore.ts] Error adding tag to job: ${jobId}`, error);
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
      } catch (error) {
        console.error(
          `[tagStore.ts] Error removing tag from job: ${jobId}`,
          error
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
      } catch (error) {
        console.error(
          `[tagStore.ts] Error updating tag: ${updatedTag.id}`,
          error
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
