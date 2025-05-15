import { useToastStore } from '../context/toastStore';
import { ToastCategory } from '../types/toast';

/**
 * Helper function to create error toast notifications for API errors
 * 
 * @param error - The error object or message
 * @param operation - The operation that failed (e.g., 'fetchJobs', 'deleteStatus')
 * @param entityName - Optional name of the entity being operated on
 */
export const handleApiError = (
  error: unknown,
  operation: string,
  entityName?: string
): void => {
  const { createTranslatedToast } = useToastStore.getState();
  
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  
  // Use the existing toast translation keys from the localization file
  createTranslatedToast(
    `toasts.errors.${operation}`,
    true,
    'toasts.titles.error',
    {
      name: entityName || '',
      message: errorMessage,
      position: entityName || '',
      company: entityName || '',
    },
    {},
    ToastCategory.ERROR,
    10000
  );
  
  // Also log to console for debugging
  console.error(`[API Error] ${operation} ${entityName || ''}:`, error);
};