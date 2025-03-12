// context/tagStore.ts

import { create } from "zustand";
import { TagMap, TagStatus } from "../types/tag";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { doc } from "firebase/firestore";
import { timestampToDate } from "../utils/timestampUtils";
import { Job } from "../types/job";
import { useJobStore } from "./jobStore";
import { Tag } from "../types/tag";

type TagStore = {
  tagMap: TagMap;
  isLoading: boolean;
  error: string | null;

  // actions
  fetchTags: () => Promise<void>;
  deleteTag: (tagId: string) => void;

  clearTags: () => void; // doesn't delete from server, only clears locally saved tags
};

const TAGS_PER_RECORD = 5;

export const useTagStore = create<TagStore>((set, get) => ({
  tagMap: {},

  isLoading: false,

  error: null,

  fetchTags: async () => {
    if (!auth.currentUser) return;

    set({ isLoading: true, error: null });
    try {
      // not using query as tags are in one document
      const tagsRef = doc(db, `users/${auth.currentUser.uid}/metadata/tags`);
      const tagsDoc = await getDoc(tagsRef);

      if (!tagsDoc.exists()) {
        console.warn("[tagStore.ts] No tags file found");
        await setDoc(tagsRef, { tagMap: {} });
        set({ tagMap: {}, isLoading: false });
        return;
      }

      const tagData = tagsDoc.data();
      const tagMap: TagMap = {};

      if (tagData.tagMap) {
        Object.entries(tagData.tagMap).forEach(
          ([tagId, tagData]: [string, any]) => {
            if (!tagData || typeof tagData !== "object") return;

            if (tagData.status === TagStatus.DELETED) return;

            tagMap[tagId] = {
              id: tagId,
              name: tagData.name,
              color: tagData.color,
              count: tagData.count,
              timestamps: {
                createdAt: tagData.timestamps?.createdAt.toDate(),
                updatedAt: timestampToDate(tagData.timestamps?.updatedAt),
                deletedAt: timestampToDate(tagData.timestamps?.deletedAt),
              },
            };
          }
        );
      }

      set({ tagMap });
    } catch (error) {
      console.error("[tagStore.ts] Error fetching tags:", error);
      set({ error: `Failed to fetch tags: ${error}` });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteTag: async (tagId: string) => {
    if (!auth.currentUser) return;
    if (!tagId) return;

    set({ isLoading: true, error: null });
    try {
      // check if any jobs use tag
      const jobsWithTag = get().tagMap[tagId]
        ? useJobStore.getState().getJobsWithTags([tagId])
        : [];

      if (jobsWithTag.length > 0) {
        // remove tag from jobs
        const jobStore = useJobStore.getState();
        jobsWithTag.forEach((job: Job) => {
          const updatedTags = job.tagIds?.filter((tag) => tag !== tagId) || [];
          jobStore.updateJob({ ...job, tagIds: updatedTags });
        });
      }

      const tagsRef = doc(db, `users/${auth.currentUser.uid}/metadata/tags`);
      const tagToDelete = get().tagMap[tagId];

      if (!tagToDelete) {
        set({ error: "Tag not found" });
        set({ isLoading: false });
        return;
      }

      await updateDoc(tagsRef, {
        [`tagMap.${tagId}`]: {
          ...tagToDelete,
          status: TagStatus.DELETED,
          timestamps: {
            ...tagToDelete.timestamps,
            deletedAt: serverTimestamp(),
          },
        },
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

  addTagToJob: async (jobId: Job["id"], tagId: Tag["id"]) => {
    if (!auth.currentUser) return;

    try {
      set({ isLoading: true, error: null });

      // update job with tag
      const jobStore = useJobStore.getState();
      const job = jobStore.jobs.find((job: Job) => job.id === jobId);
      if (!job) {
        console.error(`[tagStore.ts] Job not found: ${jobId}`);
        throw new Error("Job not found");
      }

      // check if job has reached tag limit already
      if (job.tags && job.tags.length > TAGS_PER_RECORD) {
        set({
          error: `Job [${jobId}] has reached the maximum number of tags (${TAGS_PER_RECORD})`,
        });
        throw new Error("Job has reached the maximum number of tags");
      }

      const updatedJob: Job = {
        ...job,
        tags: job.tags ? [...job.tags, tagId] : [tagId],
        timestamps: {
          ...job.timestamps,
          updatedAt: new Date(),
        },
      };
      await jobStore.updateJob(updatedJob);

      const tag = get().tagMap[tagId];
      if (!tag) {
        console.error(`[tagStore.ts] Tag not found: ${tagId}`);
        throw new Error("Tag not found");
      }
      await updateDoc(doc(db, `users/${auth.currentUser.uid}/metadata/tags`), {
        [`tagMap.${tagId}`]: {
          ...tag,
          count: tag.count + 1,
          timestamps: {
            ...tag.timestamps,
            updatedAt: new Date(),
          },
        },
      });
    } catch (error) {
      console.error(`[tagStore.ts] Error adding tag to job: ${jobId}`, error);
      set({
        error: `Failed to add tag [${tagId}] to job [${jobId}]: ${error}`,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  clearTags: () => {
    set({ tagMap: {} });
  },
}));
