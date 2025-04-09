import React, { JSX } from 'react';

interface ButtonsComponentProps {
  onSave?: () => void;
  onCancel?: () => void;
  onReset?: () => void;
  onDelete?: () => void;
}

export function ButtonsComponent({
  onSave,
  onReset,
  onCancel,
  onDelete,
}: ButtonsComponentProps): JSX.Element {
  return (
    <div className="flex flex-row justify-evenly gap-2">
      {onSave != null && (
        <button
          className="bg-accent-primary hover:brightness-[80%] text-text-accent p-1.5 px-2 py-1 rounded-lg transition-colors duration-bg ease-in-out"
          onClick={onSave}
        >
          Save
        </button>
      )}
      {onReset != null && (
        <button
          className="hover:brightness-[80%] hover:underline rounded-lg p-1.5 px-2 py-1 rounded-lg transition-all duration-text text-text-primary"
          onClick={onReset}
        >
          Reset
        </button>
      )}
      {onCancel != null && (
        <button
          className="bg-red-300 hover:brightness-[80%] rounded-lg p-1.5 px-2 py-1 rounded-lg transition-colors duration-bg ease-in-out text-white"
          onClick={onCancel}
        >
          Cancel
        </button>
      )}
      {onDelete != null && (
        <button
          className="bg-red-300 hover:brightness-[80%] rounded-lg p-1.5 px-2 py-1 rounded-lg transition-colors duration-bg ease-in-out text-white"
          onClick={onDelete}
        >
          Delete
        </button>
      )}
    </div>
  );
}
