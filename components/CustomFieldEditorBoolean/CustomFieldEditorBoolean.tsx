import React, { JSX } from 'react';
import { CustomField } from '../../types/customField';

interface CustomFieldEditorBooleanProps {
  value: boolean;
  field: CustomField;
  onChange: (field: CustomField, value: boolean) => void;
}

export function CustomFieldEditorBoolean({
  value,
  field,
  onChange,
}: CustomFieldEditorBooleanProps): JSX.Element {
  if (value !== true) {
    return (
      <div
        onClick={() => onChange(field, true)}
        className="max-h-4 aspect-square rounded-md bg-background-secondary cursor-pointer"
      ></div>
    );
  }

  return (
    <input
      type="checkbox"
      checked={true}
      onChange={(e) => onChange(field, false)}
      className="h-4 w-4 rounded-lg accent-accent-primary cursor-pointer"
    />
  );
}
