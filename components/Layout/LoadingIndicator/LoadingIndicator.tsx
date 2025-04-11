import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';
import { useJobStore } from '../../../context/jobStore';
import { useTagStore } from '../../../context/tagStore';
import {
  LoadingIndicatorItemProps,
  LoadingIndicatorItem,
} from './LoadingIndicatorItem/LoadingIndicatorItem';

export function LoadingIndicator() {
  const [mounted, setMounted] = useState(false);

  const [notifications, setNotifications] = useState<
    LoadingIndicatorItemProps[]
  >([]);

  const isJobsLoading = useJobStore((state) => state.isLoading);
  const isJobsError = useJobStore((state) => state.error);
  const isTagsLoading = useTagStore((state) => state.isLoading);
  const isTagsError = useTagStore((state) => state.error);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isJobsError || isTagsError) {
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        {
          isError: true,
          errorMessage: isJobsError
            ? isJobsError
            : isTagsError
              ? isTagsError
              : 'Unknown error',
        },
      ]);
    }
  }, [isJobsError, isTagsError]);

  if (!mounted) return null;

  if (notifications.length == 0) return null;

  return createPortal(
    <div className="fixed inset top-0 left-0 flex items-end justify-end z-0">
      <div className="flex gap-2">
        {isJobsLoading || isTagsLoading ? (
          <LoadingIndicatorItem isError={false} />
        ) : null}
        {notifications.map((notification) => (
          <LoadingIndicatorItem
            isError={notification.isError}
            errorMessage={notification?.errorMessage}
          />
        ))}
      </div>
    </div>,
    document.body
  );
}
