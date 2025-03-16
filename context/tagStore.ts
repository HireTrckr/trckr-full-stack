// context/tagStore.ts

import { create } from 'zustand';
import { TagMap } from '../types/tag';
import {
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  deleteField,
} from 'firebase/firestore';
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
   * @returns true if successful tag creation, false otherwise
   * */
  createTag: (tagName: Tag['name']) => Promise<boolean>;
  deleteTag: (tagId: Tag['id']) => Promise<boolean>;
  getRecentTags: (limit: number) => Tag[];
  addTagToJob: (jobId: Job['id'], tagId: Tag['id']) => Promise<boolean>;
  removeTagFromJob: (jobId: Job['id'], tagId: Tag['id']) => Promise<boolean>;
  clearTags: () => boolean; // doesn't delete from server, only clears locally saved tags
  getTagsFromJob: (job: Job) => Tag[];
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
      }

      // return whether there is not an error t/f
      return !get().error;
    },

    createTag: async (tagName: Tag['name']) => {
      if (!auth.currentUser) return false;
      if (!tagName) return false;

      set({ isLoading: true, error: null });
      try {
        // create tag object
        const newID = tagName.toLowerCase().replace(/\s/g, '-');
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
            id: tagName.toLowerCase().replace(/\s/g, '-'),
            name: tagName,
            color: getRandomTailwindColor(),
            count: 1,
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
      } catch (error) {
        console.error(`[tagStore.ts] Error creating tag: ${tagName}`, error);
        set({ error: `Failed to create tag: ${error}` });
      } finally {
        set({ isLoading: false });
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

        let tag = get().tagMap[tagId];

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

        if (!tag) {
          // need to create new tag
          await get().createTag(tagId);
          tag = get().tagMap[tagId];
        }

        const updatedJob: Job = {
          ...job,
          tagIds: job.tagIds ? [...job.tagIds, tagId] : [tagId],
        };
        await jobStore.updateJob(updatedJob);

        await updateDoc(
          doc(db, `users/${auth.currentUser.uid}/metadata/tags`),
          {
            [`tagMap.${tagId}`]: {
              ...tag,
              count: tag.count + 1,
              timestamps: {
                ...tag.timestamps,
                updatedAt: new Date(),
              },
            },
          }
        );
      } catch (error) {
        console.error(`[tagStore.ts] Error adding tag to job: ${jobId}`, error);
        set({
          error: `Failed to add tag [${tagId}] to job [${jobId}]: ${error}`,
        });
      } finally {
        set({ isLoading: false });
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

    getTagsFromJob(job: Job) {
      if (!job.tagIds) return [];
      return job.tagIds
        .map((tagId) => get().tagMap[tagId])
        .filter((tag): tag is Tag => tag != undefined);
    },
  } as TagStorePlusPrivate;
});
