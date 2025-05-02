import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';
import { useJobStore } from '../../../context/jobStore';
import { useTagStore } from '../../../context/tagStore';
import {
  LoadingIndicatorItemProps,
  LoadingIndicatorItem,
} from './LoadingIndicatorItem/LoadingIndicatorItem';
import { useSettingsStore } from '../../../context/settingStore';
import { useStatusStore } from '../../../context/statusStore';

export function LoadingIndicator() {
  const [notifications, setNotifications] = useState<
    LoadingIndicatorItemProps[]
  >([]);

  const isJobsLoading = useJobStore((state) => state.isLoading);
  const isJobsError = useJobStore((state) => state.error);
  const isTagsLoading = useTagStore((state) => state.isLoading);
  const isTagsError = useTagStore((state) => state.error);
  const isSettingsLoading = useSettingsStore((state) => state.isLoading);
  const isSettingsError = useSettingsStore((state) => state.error);
  const isStatusLoading = useStatusStore((state) => state.isLoading);
  const isStatusError = useStatusStore((state) => state.error);

  useEffect(() => {
    if (isJobsError || isTagsError || isSettingsError || isStatusError) {
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        {
          isError: true,
          errorMessage: isJobsError
            ? isJobsError
            : isTagsError
              ? isTagsError
              : isSettingsError
                ? isSettingsError
                : isStatusError
                  ? isStatusError
                  : 'Unknown Error',
        },
      ]);
    }
  }, [isJobsError, isTagsError, isStatusError, isSettingsError]);

  //if (!mounted) return null;

  if (notifications.length == 0) return <></>;

  return (
    <div className="fixed z-[100]" id="loading-indicator-overlay">
      <div className="mr-4">
        {isJobsLoading ||
        isTagsLoading ||
        isSettingsLoading ||
        isStatusLoading ? (
          <LoadingIndicatorItem isError={false} />
        ) : (
          <span>lol</span>
        )}
        {notifications.map((notification) => (
          <LoadingIndicatorItem
            isError={notification.isError}
            errorMessage={notification?.errorMessage}
          />
        ))}
      </div>
    </div>
  );
}
