import { create } from 'zustand';
import { auth } from '../lib/firebase';
import {
  CustomField,
  CustomFieldNotSavedInDB,
  CustomFieldType,
} from '../types/customField';
import { useToastStore } from './toastStore';
import { ToastCategory } from '../types/toast';
import { useJobStore } from './jobStore';
import { fieldsApi } from '../lib/api';

interface CustomFieldStore {
  fieldMap: Record<string, CustomField>;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadFields: () => Promise<boolean>;
  createField: (field: CustomFieldNotSavedInDB) => Promise<string | null>;
  updateField: (field: CustomField) => Promise<boolean>;
  deleteField: (fieldId: string) => Promise<boolean>;
  deleteAllFields: () => Promise<boolean>;
}

const { createTranslatedToast } = useToastStore.getState();
const { cleanupFieldValuesFromJobs } = useJobStore.getState();

export const useCustomFieldStore = create<CustomFieldStore>((set, get) => ({
  fieldMap: {},
  isLoading: false,
  error: null,

  loadFields: async () => {
    if (!auth.currentUser) return false;

    set({ isLoading: true, error: null });
    try {
      // Use the API client instead of direct Firebase access
      const fieldMap = await fieldsApi.fetchFields();

      set({ fieldMap });
    } catch (err: unknown) {
      console.error('[customFieldStore.ts] Error loading custom fields:', err);
      createTranslatedToast(
        'toasts.errors.fetchFields',
        true,
        'toasts.titles.error',
        { message: (err as Error).message },
        {},
        ToastCategory.ERROR,
        10000
      );
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      set({ error: `Failed to fetch fields: ${errorMessage}` });
    } finally {
      set({ isLoading: false });
    }

    return !get().error;
  },

  deleteField: async (fieldId: string) => {
    if (!auth.currentUser) return false;

    set({ isLoading: true, error: null });
    try {
      const field = get().fieldMap[fieldId];

      if (!field) {
        throw new Error('Field not found');
      }

      // Use the API client instead of direct Firebase access
      await fieldsApi.deleteField(fieldId);

      // remove field from local state
      const newFieldMap = { ...get().fieldMap };
      delete newFieldMap[fieldId];
      set({ fieldMap: newFieldMap });

      // remove field from jobs
      await cleanupFieldValuesFromJobs(fieldId);

      createTranslatedToast(
        'toasts.fieldDeleted',
        true,
        'toasts.titles.fieldDeleted',
        { name: field.name },
        {},
        ToastCategory.INFO,
        10000,
        () => {},
        (toast) => {
          // undo function
          get().createField(field);
        }
      );
    } catch (error: unknown) {
      console.error(`[customFieldStore.ts] Error deleting field`, error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      createTranslatedToast(
        'toasts.errors.deleteField',
        true,
        'toasts.titles.error',
        { message: errorMessage },
        {},
        ToastCategory.ERROR,
        10000
      );
      set({ error: `Failed to delete field: ${errorMessage}` });
    } finally {
      set({ isLoading: false });
    }

    return !get().error;
  },

  createField: async (field: Partial<CustomFieldNotSavedInDB>) => {
    if (!auth.currentUser) return null;
    if (!field.name || !field.type) return null;

    set({ isLoading: true, error: null });
    try {
      const newID = field.name.toLowerCase().replace(/\s/g, '-');

      if (get().fieldMap[newID]) {
        throw new Error('Field already exists');
      }

      // check there is a default value if required
      if (field.required && field.defaultValue === null) {
        throw new Error('Default value is required');
      }

      // Use the API client instead of direct Firebase access
      const newField = await fieldsApi.createField({
        name: field.name,
        type: field.type,
        options: field.type === CustomFieldType.SELECT ? field.options : null,
        required: field.required ?? false,
        defaultValue: field.defaultValue ?? null,
      });

      set((state) => ({
        fieldMap: { ...state.fieldMap, [newField.id]: newField },
        isLoading: false,
      }));

      createTranslatedToast(
        'toasts.fieldCreated',
        true,
        'toasts.titles.fieldCreated',
        { name: newField.name },
        {},
        ToastCategory.INFO,
        5000,
        () => {},
        () => {
          get().deleteField(newField.id);
        }
      );
      return newField.id;
    } catch (error: unknown) {
      console.error(
        `[customFieldStore.ts] Error creating field: ${field.name}`,
        error
      );
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      createTranslatedToast(
        'toasts.errors.createField',
        true,
        'toasts.titles.error',
        { name: field.name, message: errorMessage },
        {},
        ToastCategory.ERROR,
        10000
      );
      set({ error: `Failed to create field: ${errorMessage}` });
      return null;
    } finally {
      set({ isLoading: false });
    }
  },

  updateField: async (field: CustomField) => {
    if (!auth.currentUser) return false;
    if (!field.id) return false;
    if (!get().fieldMap[field.id]) return false;

    set({ isLoading: true, error: null });
    try {
      // Use the API client instead of direct Firebase access
      const updatedField = await fieldsApi.updateField(field);

      set((state) => ({
        fieldMap: { ...state.fieldMap, [updatedField.id]: updatedField },
        isLoading: false,
      }));

      createTranslatedToast(
        'toasts.fieldUpdated',
        true,
        'toasts.titles.tagUpdated',
        { name: updatedField.name },
        {},
        ToastCategory.INFO,
        3000
      );
    } catch (error: unknown) {
      console.error(`[customFieldStore.ts] Error updating field`, error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      createTranslatedToast(
        'toasts.errors.updateField',
        true,
        'toasts.titles.error',
        { message: errorMessage },
        {},
        ToastCategory.ERROR,
        10000
      );
      set({ error: `Failed to update field: ${errorMessage}` });
    } finally {
      set({ isLoading: false });
    }

    return !get().error;
  },
  deleteAllFields: async () => {
    if (!auth.currentUser) return false;

    set({ isLoading: true, error: null });
    try {
      // Use the API client instead of direct Firebase access
      await fieldsApi.deleteAllFields();

      // Clear fields from local state
      set({ fieldMap: {}, isLoading: false });

      createTranslatedToast(
        'toasts.allFieldsDeleted',
        true,
        'toasts.titles.fieldsDeleted',
        {},
        {},
        ToastCategory.INFO,
        5000
      );
    } catch (error: unknown) {
      console.error(`[customFieldStore.ts] Error deleting all fields`, error);
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      createTranslatedToast(
        'toasts.errors.deleteAllFields',
        true,
        'toasts.titles.error',
        { message: errorMessage },
        {},
        ToastCategory.ERROR,
        10000
      );
      set({ error: `Failed to delete all fields: ${errorMessage}` });
    } finally {
      set({ isLoading: false });
    }

    return !get().error;
  },
}));
