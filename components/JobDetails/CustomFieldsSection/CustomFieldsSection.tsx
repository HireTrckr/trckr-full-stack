import React from 'react';
import { useCustomFieldStore } from '../../../context/customFieldStore';
import { CustomField, CustomFieldValue } from '../../../types/customField';
import { JobNotSavedInDB } from '../../../types/job';
import { CustomFieldEditor } from '../../CustomFieldEditor/CustomFieldEditor';

interface CustomFieldsSectionProps {
  job: JobNotSavedInDB;
  onValid: () => void;
  onInvalid: () => void;
  onChange: (value: CustomFieldValue) => void;
}

export function CustomFieldsSection({
  job,
  onValid,
  onInvalid,
  onChange,
}: CustomFieldsSectionProps) {
  const fields = useCustomFieldStore((state) => state.fieldMap);

  if (Object.keys(fields).length === 0) {
    return null;
  }

  function handleChange(
    field: CustomField,
    value: string | number | boolean | Date | null
  ) {
    onChange({ fieldId: field.id, value });
    if (field.required && (value === null || value === '')) {
      onInvalid();
    } else {
      onValid();
    }
  }

  return (
    <div className="my-4 w-full max-h-[2rem]">
      {Object.values(fields).map((field) => (
        <CustomFieldEditor job={job} field={field} onChange={handleChange} />
      ))}
    </div>
  );
}
