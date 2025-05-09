import { auth } from './firebase';
import { Job, JobNotSavedInDB } from '../types/job';
import {
  StatusMap,
  JobStatusNotSavedInDB,
  JobStatus,
} from '../types/jobStatus';
import { TagMap, TagNotSavedInDB, Tag } from '../types/tag';
import { CustomField, CustomFieldNotSavedInDB } from '../types/customField';
import { Settings } from '../types/settings';

// Helper function to get the current user's ID
const getUserId = (): string | null => {
  return auth.currentUser?.uid || null;
};

// API functions for Jobs
export const jobsApi = {
  fetchJobs: async (): Promise<Job[]> => {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const response = await fetch('/api/jobs', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'user-id': userId,
      },
    });

    if (!response.ok) {
      throw new Error(response.statusText || 'Failed to fetch jobs');
    }

    const data = await response.json();
    return data.jobs;
  },

  addJob: async (job: JobNotSavedInDB): Promise<Job> => {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const response = await fetch('/api/jobs/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'user-id': userId,
      },
      body: JSON.stringify(job),
    });

    if (!response.ok) {
      throw new Error(response.statusText || 'Failed to add job');
    }

    const data = await response.json();
    return data.job;
  },

  updateJob: async (job: Job): Promise<Job> => {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const response = await fetch('/api/jobs/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'user-id': userId,
      },
      body: JSON.stringify(job),
    });

    if (!response.ok) {
      throw new Error(response.statusText || 'Failed to update job');
    }

    const data = await response.json();
    return data.job;
  },

  deleteJob: async (job: Job): Promise<string> => {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const response = await fetch('/api/jobs/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'user-id': userId,
      },
      body: JSON.stringify({
        jobId: job.id,
        timestamps: job.timestamps,
      }),
    });

    if (!response.ok) {
      throw new Error(response.statusText || 'Failed to delete job');
    }

    const data = await response.json();
    return data.jobId;
  },

  cleanupFieldValues: async (fieldId: string): Promise<boolean> => {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const response = await fetch('/api/jobs/cleanupFieldValues', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'user-id': userId,
      },
      body: JSON.stringify({ fieldId }),
    });

    if (!response.ok) {
      throw new Error(response.statusText || 'Failed to clean up field values');
    }

    return true;
  },
};

// API functions for Settings
export const settingsApi = {
  fetchSettings: async (): Promise<Settings> => {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const response = await fetch('/api/settings', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'user-id': userId,
      },
    });

    if (!response.ok) {
      throw new Error(response.statusText || 'Failed to fetch settings');
    }

    const data = await response.json();
    return data.settings;
  },

  updateSettings: async (settings: Settings): Promise<Settings> => {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const response = await fetch('/api/settings/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'user-id': userId,
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      throw new Error(response.statusText || 'Failed to update settings');
    }

    const data = await response.json();
    return data.settings;
  },

  updateSetting: async <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ): Promise<Settings> => {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const response = await fetch('/api/settings/updateSetting', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'user-id': userId,
      },
      body: JSON.stringify({ key, value }),
    });

    if (!response.ok) {
      throw new Error(response.statusText || 'Failed to update setting');
    }

    const data = await response.json();
    return data.settings;
  },
};

// API functions for Statuses
export const statusesApi = {
  fetchStatuses: async (): Promise<StatusMap> => {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const response = await fetch('/api/statuses', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'user-id': userId,
      },
    });

    if (!response.ok) {
      throw new Error(response.statusText || 'Failed to fetch statuses');
    }

    const data = await response.json();
    return data.statusMap;
  },

  createStatus: async (
    status: Partial<JobStatusNotSavedInDB>
  ): Promise<JobStatus> => {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const response = await fetch('/api/statuses/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'user-id': userId,
      },
      body: JSON.stringify(status),
    });

    if (!response.ok) {
      throw new Error(response.statusText || 'Failed to create status');
    }

    const data = await response.json();
    return data.status;
  },

  updateStatus: async (status: JobStatus): Promise<JobStatus> => {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const response = await fetch('/api/statuses/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'user-id': userId,
      },
      body: JSON.stringify(status),
    });

    if (!response.ok) {
      throw new Error(response.statusText || 'Failed to update status');
    }

    const data = await response.json();
    return data.status;
  },

  deleteStatus: async (statusId: string): Promise<string> => {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const response = await fetch('/api/statuses/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'user-id': userId,
      },
      body: JSON.stringify({ statusId }),
    });

    if (!response.ok) {
      throw new Error(response.statusText || 'Failed to delete status');
    }

    const data = await response.json();
    return data.statusId;
  },

  resetStatuses: async (): Promise<StatusMap> => {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const response = await fetch('/api/statuses/reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'user-id': userId,
      },
    });

    if (!response.ok) {
      throw new Error(response.statusText || 'Failed to reset statuses');
    }

    const data = await response.json();
    return data.statusMap;
  },
};

// API functions for Tags
export const tagsApi = {
  fetchTags: async (): Promise<TagMap> => {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const response = await fetch('/api/tags', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'user-id': userId,
      },
    });

    if (!response.ok) {
      throw new Error(response.statusText || 'Failed to fetch tags');
    }

    const data = await response.json();
    return data.tagMap;
  },

  createTag: async (tag: Partial<TagNotSavedInDB>): Promise<Tag> => {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const response = await fetch('/api/tags/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'user-id': userId,
      },
      body: JSON.stringify(tag),
    });

    if (!response.ok) {
      throw new Error(response.statusText || 'Failed to create tag');
    }

    const data = await response.json();
    return data.tag;
  },

  updateTag: async (tag: Tag): Promise<Tag> => {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const response = await fetch('/api/tags/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'user-id': userId,
      },
      body: JSON.stringify(tag),
    });

    if (!response.ok) {
      throw new Error(response.statusText || 'Failed to update tag');
    }

    const data = await response.json();
    return data.tag;
  },

  deleteTag: async (tagId: string): Promise<string> => {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const response = await fetch('/api/tags/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'user-id': userId,
      },
      body: JSON.stringify({ tagId }),
    });

    if (!response.ok) {
      throw new Error(response.statusText || 'Failed to delete tag');
    }

    const data = await response.json();
    return data.tagId;
  },

  addTagToJob: async (jobId: string, tagId: string): Promise<Tag> => {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const response = await fetch('/api/tags/addToJob', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'user-id': userId,
      },
      body: JSON.stringify({ jobId, tagId }),
    });

    if (!response.ok) {
      throw new Error(response.statusText || 'Failed to add tag to job');
    }

    const data = await response.json();
    return data.tag;
  },

  removeTagFromJob: async (jobId: string, tagId: string): Promise<Tag> => {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const response = await fetch('/api/tags/removeFromJob', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'user-id': userId,
      },
      body: JSON.stringify({ jobId, tagId }),
    });

    if (!response.ok) {
      throw new Error(response.statusText || 'Failed to remove tag from job');
    }

    const data = await response.json();
    return data.tag;
  },
};

// API functions for Custom Fields
export const fieldsApi = {
  fetchFields: async (): Promise<Record<string, CustomField>> => {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const response = await fetch('/api/fields', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'user-id': userId,
      },
    });

    if (!response.ok) {
      throw new Error(response.statusText || 'Failed to fetch custom fields');
    }

    const data = await response.json();
    return data.fieldMap;
  },

  createField: async (
    field: Partial<CustomFieldNotSavedInDB>
  ): Promise<CustomField> => {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const response = await fetch('/api/fields/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'user-id': userId,
      },
      body: JSON.stringify(field),
    });

    if (!response.ok) {
      throw new Error(response.statusText || 'Failed to create field');
    }

    const data = await response.json();
    return data.field;
  },

  updateField: async (field: CustomField): Promise<CustomField> => {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const response = await fetch('/api/fields/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'user-id': userId,
      },
      body: JSON.stringify(field),
    });

    if (!response.ok) {
      throw new Error(response.statusText || 'Failed to update field');
    }

    const data = await response.json();
    return data.field;
  },

  deleteField: async (fieldId: string): Promise<string> => {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const response = await fetch('/api/fields/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'user-id': userId,
      },
      body: JSON.stringify({ fieldId }),
    });

    if (!response.ok) {
      throw new Error(response.statusText || 'Failed to delete field');
    }

    const data = await response.json();
    return data.fieldId;
  },

  deleteAllFields: async (): Promise<boolean> => {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const response = await fetch('/api/fields/deleteAll', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'user-id': userId,
      },
    });

    if (!response.ok) {
      throw new Error(response.statusText || 'Failed to delete all fields');
    }

    return true;
  },
};
