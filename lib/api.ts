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
import { handleApiError } from './apiErrorHandler';

// Helper function to get the current user's ID
const getUserId = (): string | null => {
  return auth.currentUser?.uid || null;
};

// API functions for Jobs
export const jobsApi = {
  fetchJobs: async (): Promise<Job[]> => {
    try {
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
      }).then((response) => {
        if (!response.ok) {
          return Promise.reject(response?.statusText || 'Failed to fetch jobs');
        }
        return response;
      });

      const data = await response.json();
      return data.jobs;
    } catch (error) {
      handleApiError(error, 'fetching', 'jobs');
      throw error; // Re-throw to allow calling code to handle it
    }
  },

  addJob: async (job: JobNotSavedInDB): Promise<Job> => {
    try {
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
      }).then((response) => {
        if (!response.ok) {
          return Promise.reject(response?.statusText || 'Failed to fetch jobs');
        }
        return response;
      });

      const data = await response.json();
      return data.job;
    } catch (error) {
      handleApiError(error, 'addJob', `${job.position} at ${job.company}`);
      throw error;
    }
  },

  updateJob: async (job: Job): Promise<Job> => {
    try {
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
      }).then((response) => {
        if (!response.ok) {
          return Promise.reject(response?.statusText || 'Failed to fetch jobs');
        }
        return response;
      });

      const data = await response.json();
      return data.job;
    } catch (error) {
      handleApiError(error, 'updateJob', `${job.position} at ${job.company}`);
      throw error;
    }
  },

  deleteJob: async (job: Job): Promise<string> => {
    try {
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
      }).then((response) => {
        if (!response.ok) {
          return Promise.reject(response?.statusText || 'Failed to fetch jobs');
        }
        return response;
      });

      const data = await response.json();
      return data.jobId;
    } catch (error) {
      handleApiError(error, 'deleteJob', `${job.position} at ${job.company}`);
      throw error;
    }
  },

  cleanupFieldValues: async (fieldId: string): Promise<boolean> => {
    try {
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
      }).then((response) => {
        if (!response.ok) {
          return Promise.reject(response?.statusText || 'Failed to fetch jobs');
        }
        return response;
      });

      const data = await response.json();
      return data;
    } catch (error) {
      handleApiError(error, 'cleanupFieldValues', fieldId);
      throw error;
    }
  },
};

// API functions for Settings
export const settingsApi = {
  fetchSettings: async (): Promise<Settings> => {
    try {
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
      }).then((response) => {
        if (!response.ok) {
          return Promise.reject(response?.statusText || 'Failed to fetch jobs');
        }
        return response;
      });

      const data = await response.json();
      return data.settings;
    } catch (error) {
      handleApiError(error, 'fetchSettings');
      throw error;
    }
  },

  updateSettings: async (settings: Settings): Promise<Settings> => {
    try {
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
      }).then((response) => {
        if (!response.ok) {
          return Promise.reject(response?.statusText || 'Failed to fetch jobs');
        }
        return response;
      });

      const data = await response.json();
      return data.settings;
    } catch (error) {
      handleApiError(error, 'updateSettings');
      throw error;
    }
  },

  updateSetting: async <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ): Promise<Settings> => {
    try {
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
      }).then((response) => {
        if (!response.ok) {
          return Promise.reject(response?.statusText || 'Failed to fetch jobs');
        }
        return response;
      });

      const data = await response.json();
      return data.settings;
    } catch (error) {
      handleApiError(error, 'updateSetting', String(key));
      throw error;
    }
  },
};

// API functions for Statuses
export const statusesApi = {
  fetchStatuses: async (): Promise<StatusMap> => {
    try {
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
      }).then((response) => {
        if (!response.ok) {
          return Promise.reject(response?.statusText || 'Failed to fetch jobs');
        }
        return response;
      });

      const data = await response.json();
      return data.statusMap;
    } catch (error) {
      handleApiError(error, 'fetchStatuses');
      throw error;
    }
  },

  createStatus: async (
    status: Partial<JobStatusNotSavedInDB>
  ): Promise<JobStatus> => {
    try {
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
      }).then((response) => {
        if (!response.ok) {
          return Promise.reject(response?.statusText || 'Failed to fetch jobs');
        }
        return response;
      });

      const data = await response.json();
      return data.status;
    } catch (error) {
      handleApiError(error, 'createStatus', status.statusName);
      throw error;
    }
  },

  updateStatus: async (status: JobStatus): Promise<JobStatus> => {
    try {
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
      }).then((response) => {
        if (!response.ok) {
          return Promise.reject(response?.statusText || 'Failed to fetch jobs');
        }
        return response;
      });

      const data = await response.json();
      return data.status;
    } catch (error) {
      handleApiError(error, 'updateStatus', status.statusName);
      throw error;
    }
  },

  deleteStatus: async (statusId: string): Promise<string> => {
    try {
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
      }).then((response) => {
        if (!response.ok) {
          return Promise.reject(response?.statusText || 'Failed to fetch jobs');
        }
        return response;
      });

      const data = await response.json();
      return data.statusMap;
    } catch (error) {
      handleApiError(error, 'deleteStatus', statusId);
      throw error;
    }
  },

  resetStatuses: async (): Promise<StatusMap> => {
    try {
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
      }).then((response) => {
        if (!response.ok) {
          return Promise.reject(response?.statusText || 'Failed to fetch jobs');
        }
        return response;
      });

      const data = await response.json();
      return data.statusMap;
    } catch (error) {
      handleApiError(error, 'resetStatuses');
      throw error;
    }
  },
};

// API functions for Tags
export const tagsApi = {
  fetchTags: async (): Promise<TagMap> => {
    try {
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
      }).then((response) => {
        if (!response.ok) {
          return Promise.reject(response?.statusText || 'Failed to fetch jobs');
        }
        return response;
      });

      const data = await response.json();
      return data.tagMap;
    } catch (error) {
      handleApiError(error, 'fetchTags');
      throw error;
    }
  },

  createTag: async (tag: Partial<TagNotSavedInDB>): Promise<Tag> => {
    try {
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
      }).then((response) => {
        if (!response.ok) {
          return Promise.reject(response?.statusText || 'Failed to fetch jobs');
        }
        return response;
      });

      const data = await response.json();
      return data.tag;
    } catch (error) {
      handleApiError(error, 'createTag', tag.name);
      throw error;
    }
  },

  updateTag: async (tag: Tag): Promise<Tag> => {
    try {
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
      }).then((response) => {
        if (!response.ok) {
          return Promise.reject(response?.statusText || 'Failed to fetch jobs');
        }
        return response;
      });

      const data = await response.json();
      return data.tag;
    } catch (error) {
      handleApiError(error, 'updateTag', tag.name);
      throw error;
    }
  },

  deleteTag: async (tagId: string): Promise<string> => {
    try {
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
      }).then((response) => {
        if (!response.ok) {
          return Promise.reject(response?.statusText || 'Failed to fetch jobs');
        }
        return response;
      });

      const data = await response.json();
      return data.tagId;
    } catch (error) {
      handleApiError(error, 'deleteTag', tagId);
      throw error;
    }
  },

  addTagToJob: async (
    jobId: string,
    tagId: string
  ): Promise<{ updatedTag: Tag; updatedJob: Job }> => {
    try {
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
      }).then((response) => {
        if (!response.ok) {
          return Promise.reject(response?.statusText || 'Failed to fetch jobs');
        }
        return response;
      });

      const data: { tag: Tag; job: Job } = await response.json();
      return { updatedTag: data.tag, updatedJob: data.job };
    } catch (error) {
      handleApiError(error, 'addTagToJob');
      throw error;
    }
  },

  removeTagFromJob: async (
    jobId: string,
    tagId: string
  ): Promise<{ updatedTag: Tag; updatedJob: Job }> => {
    try {
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
      }).then((response) => {
        if (!response.ok) {
          return Promise.reject(response?.statusText || 'Failed to fetch jobs');
        }
        return response;
      });

      const data: { tag: Tag; job: Job } = await response.json();
      return { updatedTag: data.tag, updatedJob: data.job };
    } catch (error) {
      handleApiError(error, 'removeTagFromJob');
      throw error;
    }
  },
};

// API functions for Custom Fields
export const fieldsApi = {
  fetchFields: async (): Promise<Record<string, CustomField>> => {
    try {
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
      }).then((response) => {
        if (!response.ok) {
          return Promise.reject(response?.statusText || 'Failed to fetch jobs');
        }
        return response;
      });

      const data = await response.json();
      return data.fieldMap;
    } catch (error) {
      handleApiError(error, 'fetchFields');
      throw error;
    }
  },

  createField: async (
    field: Partial<CustomFieldNotSavedInDB>
  ): Promise<CustomField> => {
    try {
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
      }).then((response) => {
        if (!response.ok) {
          return Promise.reject(response?.statusText || 'Failed to fetch jobs');
        }
        return response;
      });

      const data = await response.json();
      return data.field;
    } catch (error) {
      handleApiError(error, 'createField', field.name);
      throw error;
    }
  },

  updateField: async (field: CustomField): Promise<CustomField> => {
    try {
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
      }).then((response) => {
        if (!response.ok) {
          return Promise.reject(response?.statusText || 'Failed to fetch jobs');
        }
        return response;
      });

      const data = await response.json();
      return data.field;
    } catch (error) {
      handleApiError(error, 'updateField', field.name);
      throw error;
    }
  },

  deleteField: async (fieldId: string): Promise<string> => {
    try {
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
      }).then((response) => {
        if (!response.ok) {
          return Promise.reject(response?.statusText || 'Failed to fetch jobs');
        }
        return response;
      });

      const data = await response.json();
      return data.fieldId;
    } catch (error) {
      handleApiError(error, 'deleteField', fieldId);
      throw error;
    }
  },

  deleteAllFields: async (): Promise<boolean> => {
    try {
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
      }).then((response) => {
        if (!response.ok) {
          return Promise.reject(response?.statusText || 'Failed to fetch jobs');
        }
        return response;
      });

      const data = response.json();

      return data;
    } catch (error) {
      handleApiError(error, 'deleteAllFields');
      throw error;
    }
  },
};
