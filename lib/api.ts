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
import { reqOptions } from '../types/reqOptions';

// Rate limiting middleware to prevent DoS attacks
const createApiMiddleware = () => {
  const userTimestamps = new Map<string, number>();
  const RATE_LIMIT_MS = 500; // 500ms between requests
  const whitelistedSources = new Set<string>(['system']);

  return {
    checkRateLimit(userId: string): boolean {
      const now = Date.now();
      const lastRequest = userTimestamps.get(userId) || 0;

      if (now - lastRequest < RATE_LIMIT_MS) {
        return false;
      }

      userTimestamps.set(userId, now);
      return true;
    },

    withRateLimit<T>(
      userId: string,
      fn: () => Promise<T>,
      source?: string
    ): Promise<T> {
      // Skip rate limiting for whitelisted sources
      if (source && whitelistedSources.has(source)) {
        return fn();
      }

      if (!this.checkRateLimit(userId)) {
        return Promise.reject('Rate limit exceeded. Please try again later.');
      }
      return fn();
    },
  };
};

const apiMiddleware = createApiMiddleware();

// Helper function to get the current user's ID
const getUserId = (): string | null => {
  return auth.currentUser?.uid || null;
};

// API functions for Jobs
export const jobsApi = {
  fetchJobs: async (options?: reqOptions): Promise<Job[]> => {
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      return apiMiddleware.withRateLimit(
        userId,
        async () => {
          const response = await fetch('/api/jobs', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'user-id': userId,
            },
          }).then((response) => {
            if (!response.ok) {
              return Promise.reject(
                response?.statusText || 'Failed to fetch jobs'
              );
            }
            return response;
          });

          const data = await response.json();
          return data.jobs;
        },
        options?.source
      );
    } catch (error) {
      console.log('catch error');
      handleApiError(error, 'fetching', 'jobs');
      throw error; // Re-throw to allow calling code to handle it
    }
  },

  addJob: async (job: JobNotSavedInDB, options?: reqOptions): Promise<Job> => {
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      return apiMiddleware.withRateLimit(
        userId,
        async () => {
          const response = await fetch('/api/jobs/add', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'user-id': userId,
            },
            body: JSON.stringify(job),
          }).then((response) => {
            if (!response.ok) {
              return Promise.reject(
                response?.statusText || 'Failed to fetch jobs'
              );
            }
            return response;
          });

          const data = await response.json();
          return data.job;
        },
        options?.source
      );
    } catch (error) {
      handleApiError(error, 'addJob', `${job.position} at ${job.company}`);
      throw error;
    }
  },

  updateJob: async (job: Job, options?: reqOptions): Promise<Job> => {
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      return apiMiddleware.withRateLimit(
        userId,
        async () => {
          const response = await fetch('/api/jobs/update', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'user-id': userId,
            },
            body: JSON.stringify(job),
          }).then((response) => {
            if (!response.ok) {
              return Promise.reject(
                response?.statusText || 'Failed to fetch jobs'
              );
            }
            return response;
          });

          const data = await response.json();
          return data.job;
        },
        options?.source
      );
    } catch (error) {
      handleApiError(error, 'updateJob', `${job.position} at ${job.company}`);
      throw error;
    }
  },

  deleteJob: async (job: Job, options?: reqOptions): Promise<string> => {
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      return apiMiddleware.withRateLimit(
        userId,
        async () => {
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
              return Promise.reject(
                response?.statusText || 'Failed to fetch jobs'
              );
            }
            return response;
          });

          const data = await response.json();
          return data.jobId;
        },
        options?.source
      );
    } catch (error) {
      handleApiError(error, 'deleteJob', `${job.position} at ${job.company}`);
      throw error;
    }
  },

  cleanupFieldValues: async (
    fieldId: string,
    options?: reqOptions
  ): Promise<boolean> => {
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      return apiMiddleware.withRateLimit(
        userId,
        async () => {
          const response = await fetch('/api/jobs/cleanupFieldValues', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'user-id': userId,
            },
            body: JSON.stringify({ fieldId }),
          }).then((response) => {
            if (!response.ok) {
              return Promise.reject(
                response?.statusText || 'Failed to fetch jobs'
              );
            }
            return response;
          });

          const data = await response.json();
          return data;
        },
        options?.source
      );
    } catch (error) {
      handleApiError(error, 'cleanupFieldValues', fieldId);
      throw error;
    }
  },
};

// API functions for Settings
export const settingsApi = {
  fetchSettings: async (options?: reqOptions): Promise<Settings> => {
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      return apiMiddleware.withRateLimit(
        userId,
        async () => {
          const response = await fetch('/api/settings', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'user-id': userId,
            },
          }).then((response) => {
            if (!response.ok) {
              return Promise.reject(
                response?.statusText || 'Failed to fetch jobs'
              );
            }
            return response;
          });

          const data = await response.json();
          return data.settings;
        },
        options?.source
      );
    } catch (error) {
      handleApiError(error, 'fetchSettings');
      throw error;
    }
  },

  updateSettings: async (
    settings: Settings,
    options?: reqOptions
  ): Promise<Settings> => {
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      return apiMiddleware.withRateLimit(
        userId,
        async () => {
          const response = await fetch('/api/settings/update', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'user-id': userId,
            },
            body: JSON.stringify(settings),
          }).then((response) => {
            if (!response.ok) {
              return Promise.reject(
                response?.statusText || 'Failed to fetch jobs'
              );
            }
            return response;
          });

          const data = await response.json();
          return data.settings;
        },
        options?.source
      );
    } catch (error) {
      handleApiError(error, 'updateSettings');
      throw error;
    }
  },

  updateSetting: async <K extends keyof Settings>(
    key: K,
    value: Settings[K],
    options?: reqOptions
  ): Promise<Settings> => {
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      return apiMiddleware.withRateLimit(
        userId,
        async () => {
          const response = await fetch('/api/settings/updateSetting', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'user-id': userId,
            },
            body: JSON.stringify({ key, value }),
          }).then((response) => {
            if (!response.ok) {
              return Promise.reject(
                response?.statusText || 'Failed to fetch jobs'
              );
            }
            return response;
          });

          const data = await response.json();
          return data.settings;
        },
        options?.source
      );
    } catch (error) {
      handleApiError(error, 'updateSetting', String(key));
      throw error;
    }
  },
};

// API functions for Statuses
export const statusesApi = {
  fetchStatuses: async (options?: reqOptions): Promise<StatusMap> => {
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      return apiMiddleware.withRateLimit(
        userId,
        async () => {
          const response = await fetch('/api/statuses', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'user-id': userId,
            },
          }).then((response) => {
            if (!response.ok) {
              return Promise.reject(
                response?.statusText || 'Failed to fetch jobs'
              );
            }
            return response;
          });

          const data = await response.json();
          return data.statusMap;
        },
        options?.source
      );
    } catch (error) {
      handleApiError(error, 'fetchStatuses');
      throw error;
    }
  },

  createStatus: async (
    status: Partial<JobStatusNotSavedInDB>,
    options?: reqOptions
  ): Promise<JobStatus> => {
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      return apiMiddleware.withRateLimit(
        userId,
        async () => {
          const response = await fetch('/api/statuses/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'user-id': userId,
            },
            body: JSON.stringify(status),
          }).then((response) => {
            if (!response.ok) {
              return Promise.reject(
                response?.statusText || 'Failed to fetch jobs'
              );
            }
            return response;
          });

          const data = await response.json();
          return data.status;
        },
        options?.source
      );
    } catch (error) {
      handleApiError(error, 'createStatus', status.statusName);
      throw error;
    }
  },

  updateStatus: async (
    status: JobStatus,
    options?: reqOptions
  ): Promise<JobStatus> => {
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      return apiMiddleware.withRateLimit(
        userId,
        async () => {
          const response = await fetch('/api/statuses/update', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'user-id': userId,
            },
            body: JSON.stringify(status),
          }).then((response) => {
            if (!response.ok) {
              return Promise.reject(
                response?.statusText || 'Failed to fetch jobs'
              );
            }
            return response;
          });

          const data = await response.json();
          return data.status;
        },
        options?.source
      );
    } catch (error) {
      handleApiError(error, 'updateStatus', status.statusName);
      throw error;
    }
  },

  deleteStatus: async (
    statusId: string,
    options?: reqOptions
  ): Promise<string> => {
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      return apiMiddleware.withRateLimit(
        userId,
        async () => {
          const response = await fetch('/api/statuses/delete', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'user-id': userId,
            },
            body: JSON.stringify({ statusId }),
          }).then((response) => {
            if (!response.ok) {
              return Promise.reject(
                response?.statusText || 'Failed to fetch jobs'
              );
            }
            return response;
          });

          const data = await response.json();
          return data.statusMap;
        },
        options?.source
      );
    } catch (error) {
      handleApiError(error, 'deleteStatus', statusId);
      throw error;
    }
  },

  resetStatuses: async (options?: reqOptions): Promise<StatusMap> => {
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      return apiMiddleware.withRateLimit(
        userId,
        async () => {
          const response = await fetch('/api/statuses/reset', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'user-id': userId,
            },
          }).then((response) => {
            if (!response.ok) {
              return Promise.reject(
                response?.statusText || 'Failed to fetch jobs'
              );
            }
            return response;
          });

          const data = await response.json();
          return data.statusMap;
        },
        options?.source
      );
    } catch (error) {
      handleApiError(error, 'resetStatuses');
      throw error;
    }
  },
};

// API functions for Tags
export const tagsApi = {
  fetchTags: async (options?: reqOptions): Promise<TagMap> => {
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      return apiMiddleware.withRateLimit(
        userId,
        async () => {
          const response = await fetch('/api/tags', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'user-id': userId,
            },
          }).then((response) => {
            if (!response.ok) {
              return Promise.reject(
                response?.statusText || 'Failed to fetch jobs'
              );
            }
            return response;
          });

          const data = await response.json();
          return data.tagMap;
        },
        options?.source
      );
    } catch (error) {
      handleApiError(error, 'fetchTags');
      throw error;
    }
  },

  createTag: async (
    tag: Partial<TagNotSavedInDB>,
    options?: reqOptions
  ): Promise<Tag> => {
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      return apiMiddleware.withRateLimit(
        userId,
        async () => {
          const response = await fetch('/api/tags/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'user-id': userId,
            },
            body: JSON.stringify(tag),
          }).then((response) => {
            if (!response.ok) {
              return Promise.reject(
                response?.statusText || 'Failed to fetch jobs'
              );
            }
            return response;
          });

          const data = await response.json();
          return data.tag;
        },
        options?.source
      );
    } catch (error) {
      handleApiError(error, 'createTag', tag.name);
      throw error;
    }
  },

  updateTag: async (tag: Tag, options?: reqOptions): Promise<Tag> => {
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      return apiMiddleware.withRateLimit(
        userId,
        async () => {
          const response = await fetch('/api/tags/update', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'user-id': userId,
            },
            body: JSON.stringify(tag),
          }).then((response) => {
            if (!response.ok) {
              return Promise.reject(
                response?.statusText || 'Failed to fetch jobs'
              );
            }
            return response;
          });

          const data = await response.json();
          return data.tag;
        },
        options?.source
      );
    } catch (error) {
      handleApiError(error, 'updateTag', tag.name);
      throw error;
    }
  },

  deleteTag: async (tagId: string, options?: reqOptions): Promise<string> => {
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      return apiMiddleware.withRateLimit(
        userId,
        async () => {
          const response = await fetch('/api/tags/delete', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'user-id': userId,
            },
            body: JSON.stringify({ tagId }),
          }).then((response) => {
            if (!response.ok) {
              return Promise.reject(
                response?.statusText || 'Failed to fetch jobs'
              );
            }
            return response;
          });

          const data = await response.json();
          return data.tagId;
        },
        options?.source
      );
    } catch (error) {
      handleApiError(error, 'deleteTag', tagId);
      throw error;
    }
  },

  addTagToJob: async (
    jobId: string,
    tagId: string,
    options?: reqOptions
  ): Promise<{ updatedTag: Tag; updatedJob: Job }> => {
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      return apiMiddleware.withRateLimit(
        userId,
        async () => {
          const response = await fetch('/api/tags/addToJob', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'user-id': userId,
            },
            body: JSON.stringify({ jobId, tagId }),
          }).then((response) => {
            if (!response.ok) {
              return Promise.reject(
                response?.statusText || 'Failed to fetch jobs'
              );
            }
            return response;
          });

          const data: { tag: Tag; job: Job } = await response.json();
          return { updatedTag: data.tag, updatedJob: data.job };
        },
        options?.source
      );
    } catch (error) {
      handleApiError(error, 'addTagToJob');
      throw error;
    }
  },

  removeTagFromJob: async (
    jobId: string,
    tagId: string,
    options?: reqOptions
  ): Promise<{ updatedTag: Tag; updatedJob: Job }> => {
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      return apiMiddleware.withRateLimit(
        userId,
        async () => {
          const response = await fetch('/api/tags/removeFromJob', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'user-id': userId,
            },
            body: JSON.stringify({ jobId, tagId }),
          }).then((response) => {
            if (!response.ok) {
              return Promise.reject(
                response?.statusText || 'Failed to fetch jobs'
              );
            }
            return response;
          });

          const data: { tag: Tag; job: Job } = await response.json();
          return { updatedTag: data.tag, updatedJob: data.job };
        },
        options?.source
      );
    } catch (error) {
      handleApiError(error, 'removeTagFromJob');
      throw error;
    }
  },
};

// API functions for Custom Fields
export const fieldsApi = {
  fetchFields: async (options?: {
    source?: string;
  }): Promise<Record<string, CustomField>> => {
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      return apiMiddleware.withRateLimit(
        userId,
        async () => {
          const response = await fetch('/api/fields', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'user-id': userId,
            },
          }).then((response) => {
            if (!response.ok) {
              return Promise.reject(
                response?.statusText || 'Failed to fetch jobs'
              );
            }
            return response;
          });

          const data = await response.json();
          return data.fieldMap;
        },
        options?.source
      );
    } catch (error) {
      handleApiError(error, 'fetchFields');
      throw error;
    }
  },

  createField: async (
    field: Partial<CustomFieldNotSavedInDB>,
    options?: reqOptions
  ): Promise<CustomField> => {
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      return apiMiddleware.withRateLimit(
        userId,
        async () => {
          const response = await fetch('/api/fields/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'user-id': userId,
            },
            body: JSON.stringify(field),
          }).then((response) => {
            if (!response.ok) {
              return Promise.reject(
                response?.statusText || 'Failed to fetch jobs'
              );
            }
            return response;
          });

          const data = await response.json();
          return data.field;
        },
        options?.source
      );
    } catch (error) {
      handleApiError(error, 'createField', field.name);
      throw error;
    }
  },

  updateField: async (
    field: CustomField,
    options?: reqOptions
  ): Promise<CustomField> => {
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      return apiMiddleware.withRateLimit(
        userId,
        async () => {
          const response = await fetch('/api/fields/update', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'user-id': userId,
            },
            body: JSON.stringify(field),
          }).then((response) => {
            if (!response.ok) {
              return Promise.reject(
                response?.statusText || 'Failed to fetch jobs'
              );
            }
            return response;
          });

          const data = await response.json();
          return data.field;
        },
        options?.source
      );
    } catch (error) {
      handleApiError(error, 'updateField', field.name);
      throw error;
    }
  },

  deleteField: async (
    fieldId: string,
    options?: reqOptions
  ): Promise<string> => {
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }

      return apiMiddleware.withRateLimit(
        userId,
        async () => {
          const response = await fetch('/api/fields/delete', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'user-id': userId,
            },
            body: JSON.stringify({ fieldId }),
          }).then((response) => {
            if (!response.ok) {
              return Promise.reject(
                response?.statusText || 'Failed to fetch jobs'
              );
            }
            return response;
          });

          const data = await response.json();
          return data.fieldId;
        },
        options?.source
      );
    } catch (error) {
      handleApiError(error, 'deleteField', fieldId);
      throw error;
    }
  },

  deleteAllFields: async (options?: reqOptions): Promise<boolean> => {
    try {
      const userId = getUserId();
      if (!userId) {
        throw new Error('User not authenticated');
      }
      return apiMiddleware.withRateLimit(
        userId,
        async () => {
          const response = await fetch('/api/fields/deleteAll', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'user-id': userId,
            },
          }).then((response) => {
            if (!response.ok) {
              return Promise.reject(
                response?.statusText || 'Failed to fetch jobs'
              );
            }
            return response;
          });

          const data = response.json();

          return data;
        },
        options?.source
      );
    } catch (error) {
      handleApiError(error, 'deleteAllFields');
      throw error;
    }
  },
};
