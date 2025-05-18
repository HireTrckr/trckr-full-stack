import React, { JSX, useState } from 'react';
import { CustomField } from '../../types/customField';

interface CustomFieldEditorNumberProps {
  value: number;
  field: CustomField;
  onChange: (
    field: CustomField,
    value: string | number | boolean | Date | null
  ) => void;
}

export function CustomFieldEditorNumber({
  value,
  field,
  onChange,
}: CustomFieldEditorNumberProps): JSX.Element {
  const [valueState, setValueState] = useState<string>(String(value ?? ''));

  function handleNumberChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (
      e.target.value.trim() == '' ||
      /^(?:\d{1,3}(?:,\d{3})*|\d+)(?:\.\d{2})?$/.test(e.target.value)
    ) {
      setValueState(e.target.value);
      onChange(field, Number(e.target.value.replace(/, /g, '')));
    }
  }

  return (
    <input
      type="text"
      value={valueState}
      onChange={handleNumberChange}
      placeholder={field.name}
      className="w-full px-4 py-2 rounded-lg bg-background-primary text-text-primary border border-background-secondary focus:outline-none focus:ring- focus:ring-accent-primary focus:ring-opacity-50 focus:bg-background-secondary placeholder-text-secondary/50 transition-all duration-text"
    />
  );
}
