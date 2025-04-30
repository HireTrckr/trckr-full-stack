import React, { JSX } from 'react';
import { useTranslation } from 'react-i18next';

interface ButtonsComponentProps {
  onSave?: () => void;
  saveText?: string;
  onCancel?: () => void;
  cancelText?: string;
  onReset?: () => void;
  resetText?: string;
  onDelete?: () => void;
  deleteText?: string;
}

export function ButtonsComponent({
  onSave,
  saveText,
  onReset,
  resetText,
  onCancel,
  cancelText,
  onDelete,
  deleteText,
}: ButtonsComponentProps): JSX.Element {
  const { t } = useTranslation();
  return (
    <div className="flex flex-row justify-evenly gap-2">
      {onSave != null && (
        <button
          className="bg-accent-primary hover:brightness-[80%] text-text-accent p-1.5 px-2 py-1 rounded-lg transition-colors duration-bg ease-in-out"
          onClick={onSave}
        >
          {saveText ?? t('common.save')}
        </button>
      )}
      {onReset != null && (
        <button
          className="hover:brightness-[80%] hover:underline rounded-lg p-1.5 px-2 py-1 rounded-lg transition-all duration-text text-text-primary"
          onClick={onReset}
        >
          {resetText ?? t('common.reset')}
        </button>
      )}
      {onCancel != null && (
        <button
          className="bg-red-300 hover:brightness-[80%] rounded-lg p-1.5 px-2 py-1 rounded-lg transition-colors duration-bg ease-in-out text-white"
          onClick={onCancel}
        >
          {cancelText ?? t('common.cancel')}
        </button>
      )}
      {onDelete != null && (
        <button
          className="bg-red-300 hover:brightness-[80%] rounded-lg p-1.5 px-2 py-1 rounded-lg transition-colors duration-bg ease-in-out text-white"
          onClick={onDelete}
        >
          {deleteText ?? t('common.delete')}
        </button>
      )}
    </div>
  );
}
