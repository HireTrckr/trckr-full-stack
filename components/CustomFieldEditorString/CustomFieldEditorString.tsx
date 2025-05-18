import React, { JSX } from 'react';
import { CustomField } from '../../types/customField';

interface CustomFieldEditorStringProps {
  value: string;
  field: CustomField;
  onChange: (
    field: CustomField,
    value: string | number | boolean | Date | null
  ) => void;
}

export function CustomFieldEditorString({
  value,
  field,
  onChange,
}: CustomFieldEditorStringProps): JSX.Element {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(field, e.target.value)}
      placeholder={field.name}
      className="w-full px-4 py-2 rounded-lg
                     bg-background-primary 
                     text-text-primary
                     border border-background-secondary
                     focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50 focus:bg-background-secondary
                     placeholder-text-secondary/50
                     transition-all duration-text"
    />
  );
}
