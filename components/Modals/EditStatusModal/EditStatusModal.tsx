import React, { JSX, useEffect, useState } from 'react';
import { JobStatus } from '../../../types/jobStatus';
import { ColorPicker } from '../../ColorPicker/ColorPicker';
import { getTailwindColorObjectFromName } from '../../../utils/getTailwindColorObject';
import { ToolTip } from '../../ToolTip/ToolTip';
import { TiWarningOutline } from 'react-icons/ti';
import { useTranslation } from 'react-i18next';

export interface EditStatusModalProps {
  status: JobStatus;
  onSave: (updatedStatus: JobStatus) => void;
  onClose: () => void;
  onDelete: (status: JobStatus) => void;
}

export function EditStatusModal({
  status,
  onSave,
  onClose,
  onDelete,
}: EditStatusModalProps): JSX.Element {
  const [formData, setFormData] = useState<JobStatus>(status);

  const [timeRemaining, setTimeRemaining] = useState(0);

  const lastUpdated: Date = status.timestamps.updatedAt.toDate();

  const { t } = useTranslation();

  useEffect(() => {
    if (!status.timestamps.updatedAt) return;

    const updateTimeRemaining = () => {
      const timeSinceUpdate = Date.now() - new Date(lastUpdated).getTime();
      const remainingSeconds = Math.max(
        0,
        30 - Math.floor(timeSinceUpdate / 1000)
      );
      setTimeRemaining(remainingSeconds);
    };

    updateTimeRemaining();

    // update every second
    const interval = setInterval(updateTimeRemaining, 1000);

    // unmount
    return () => clearInterval(interval);
  }, [status.timestamps?.updatedAt]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSave = () => {
    const updatedStatus: JobStatus = {
      ...status,
      ...formData,
    };
    onSave(updatedStatus);
    onClose();
  };

  const handleDelete = () => {
    onDelete(status);
    onClose();
  };

  return (
    <div
      className="flex flex-col items-center w-[25dvw] max-w-[25dvw]"
      id="edit-status-modal--form"
    >
      <h2 className="text-xl font-semibold mb-4 text-text-primary text-center transition-all duration-text w-full">
        {t('modals.status.edit.title')}
      </h2>

      <span className="text-xs text-text-secondary">
        {t('modals.status.edit.status-id')}: <i>{formData.id}</i>
      </span>

      <div className="mb-4 w-full">
        <label htmlFor="name" className="block text-text-primary text-xs">
          {t('modals.status.shared.name')}
        </label>
        <input
          type="text"
          id="name"
          name="statusName"
          placeholder={t('modals.status.shared.name-placeholder')}
          value={formData.statusName}
          onChange={handleChange}
          className="p-2 rounded w-full bg-background-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50 border: border-background-secondary transition-all duration-200 ease-in-out focus:bg-background-secondary"
        />
      </div>

      <div className="mb-4 w-full">
        <label htmlFor="color" className="block text-text-primary text-xs">
          {t('modals.status.shared.color')}
        </label>
        <ColorPicker
          color={getTailwindColorObjectFromName(formData.color)}
          onColorSelect={(color) => {
            setFormData({
              ...formData,
              color: color.tailwindColorName,
            });
          }}
        />
      </div>

      {status.timestamps?.updatedAt && (
        <div className="mb-2 flex justify-center items-center">
          <span className="text-xs text-text-secondary transition-all duration-text">
            {t('modals.shared.last-updated', {
              date: status.timestamps.updatedAt.toDate().toLocaleDateString(),
              time: status.timestamps.updatedAt.toDate().toLocaleTimeString(),
            })}
          </span>
        </div>
      )}

      <div className="mt-2 flex justify-center space-x-3">
        <button
          onClick={handleSave}
          className="bg-blue-300 hover:bg-blue-400 text-white px-4 py-2 rounded transition-colors duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={
            !formData.statusName || !formData.color || timeRemaining > 0
          }
        >
          {t('common.save')}
        </button>
        <button
          onClick={onClose}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition-colors duration-200 ease-in-out"
        >
          {t('common.cancel')}
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={timeRemaining > 0}
        >
          {t('common.delete')}
        </button>
      </div>

      {timeRemaining > 0 && (
        <div className="mt-1 flex flex justify-center items-center gap-1">
          <span className="text-xs text-text-secondary transition-all duration-text">
            {t('modals.shared.edit-wait-timer', { count: timeRemaining })}
          </span>
          <ToolTip
            text={t('modals.shared.rate-limit-message-tt')}
            position="bottom"
          >
            <TiWarningOutline className="text-xs text-text-secondary transition-all duration-text" />
          </ToolTip>
        </div>
      )}
    </div>
  );
}
