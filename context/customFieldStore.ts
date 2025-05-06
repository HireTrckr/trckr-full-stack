import { create } from 'zustand';
import {
  doc,
  getDoc,
  setDoc,
  deleteField,
  updateDoc,
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import {
  CustomField,
  CustomFieldNotSavedInDB,
  CustomFieldType,
} from '../types/customField';
import { useToastStore } from './toastStore';
import { ToastCategory } from '../types/toast';
import { useJobStore } from './jobStore';

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
      const fieldsRef = doc(
        db,
        `users/${auth.currentUser.uid}/metadata/customFields`
      );
      const fieldsDoc = await getDoc(fieldsRef);

      if (!fieldsDoc.exists()) {
        console.warn('[customFieldStore.ts] No custom fields file found');
        await setDoc(fieldsRef, {});
        set({ fieldMap: {}, isLoading: false });
        return true;
      }

      const fieldData = fieldsDoc.data();
      if (!fieldData) {
        console.warn('[customFieldStore.ts] No custom fields found');
        set({ fieldMap: {}, isLoading: false });
        return true;
      }

      const fieldMap: Record<string, CustomField> = {};

      if (fieldData) {
        for (const fieldId in fieldData) {
          const field = fieldData[fieldId] as CustomField;
          fieldMap[fieldId] = field;
        }

        set({ fieldMap });
      }
    } catch (err: any) {
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
      set({ error: `Failed to fetch fields: ${(err as Error).message}` });
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

      const fieldsRef = doc(
        db,
        `users/${auth.currentUser.uid}/metadata/customFields`
      );

      if (!fieldsRef) {
        throw new Error('Fields document not found');
      }

      await updateDoc(fieldsRef, {
        [fieldId]: deleteField(),
      });

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
        { name: newFieldMap[fieldId].name },
        {},
        ToastCategory.INFO,
        10000,
        () => {},
        (toast) => {
          // undo function
          get().createField(field);
        }
      );
    } catch (error) {
      console.error(`[customFieldStore.ts] Error deleting field`, error);
      createTranslatedToast(
        'toasts.errors.deleteField',
        true,
        'toasts.titles.error',
        { message: (error as Error).message },
        {},
        ToastCategory.ERROR,
        10000
      );
      set({ error: `Failed to delete field: ${error}` });
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

      const newField: CustomField = {
        id: newID,
        name: field.name,
        type: field.type,
        options: field.type === CustomFieldType.SELECT ? field.options : null,
        required: field.required ?? false,
        defaultValue: field.defaultValue ?? null,
        timestamps: {
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      const fieldsRef = doc(
        db,
        `users/${auth.currentUser.uid}/metadata/customFields`
      );

      if (!fieldsRef) {
        throw new Error('Fields document not found');
      }

      await updateDoc(fieldsRef, {
        [newField.id]: newField,
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
    } catch (error) {
      console.error(
        `[customFieldStore.ts] Error creating field: ${field.name}`,
        error
      );
      createTranslatedToast(
        'toasts.errors.createField',
        true,
        'toasts.titles.error',
        { name: field.name, message: (error as Error).message },
        {},
        ToastCategory.ERROR,
        10000
      );
      set({ error: `Failed to create field: ${error}` });
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
      field.timestamps.updatedAt = new Date();
      const fieldsRef = doc(
        db,
        `users/${auth.currentUser.uid}/metadata/customFields`
      );

      if (!fieldsRef) {
        throw new Error('Fields document not found');
      }

      await updateDoc(fieldsRef, {
        [field.id]: field,
      });

      set((state) => ({
        fieldMap: { ...state.fieldMap, [field.id]: field },
        isLoading: false,
      }));

      createTranslatedToast(
        'toasts.fieldUpdated',
        true,
        'toasts.titles.tagUpdated',
        { name: field.name },
        {},
        ToastCategory.INFO,
        3000
      );
    } catch (error) {
      console.error(`[customFieldStore.ts] Error updating field`, error);
      createTranslatedToast(
        'toasts.errors.updateField',
        true,
        'toasts.titles.error',
        { message: (error as Error).message },
        {},
        ToastCategory.ERROR,
        10000
      );
      set({ error: `Failed to update field: ${error}` });
    } finally {
      set({ isLoading: false });
    }

    return !get().error;
  },
  deleteAllFields: async () => {
    if (!auth.currentUser) return false;

    set({ isLoading: true, error: null });
    try {
      const fieldsRef = doc(
        db,
        `users/${auth.currentUser.uid}/metadata/customFields`
      );

      if (!fieldsRef) {
        throw new Error('Fields document not found');
      }

      setDoc(fieldsRef, {});

      set({ fieldMap: {}, isLoading: false });
    } catch (error) {
      console.error(`[customFieldStore.ts] Error deleting all fields`, error);
      createTranslatedToast(
        'toasts.errors.deleteAllFields',
        true,
        'toasts.titles.error',
        { message: (error as Error).message },
        {},
        ToastCategory.ERROR,
        10000
      );
      set({ error: `Failed to delete all fields: ${error}` });
    } finally {
      set({ isLoading: false });
    }

    return !get().error;
  },
}));
