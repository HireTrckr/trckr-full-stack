import React, { JSX, useRef, useState } from 'react';
import { CustomField, CustomFieldOption } from '../../types/customField';
import { TiArrowSortedDown } from 'react-icons/ti';

interface CustomFieldEditorSelectProps {
  value: string;
  field: CustomField;
  onChange: (field: CustomField, value: string) => void;
}

export function CustomFieldEditorSelect({
  value,
  field,
  onChange,
}: CustomFieldEditorSelectProps): JSX.Element {
  if (field.options === null) return <></>;
  if (field.options === undefined) return <></>;
  if (field.options.length === 0) return <></>;

  const [optionsDropdownOpen, setOptionsDropdownOpen] =
    useState<boolean>(false);

  const optionDropdownButtonRef = useRef<HTMLButtonElement>(null);
  const optionDropdownRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <button
        className='className="w-full px-4 py-2 rounded-lg flex justify-between items-center bg-background-primary text-text-primary border border-background-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50 transition-all duration-text text-left"'
        type="button"
        onClick={() => setOptionsDropdownOpen(!optionsDropdownOpen)}
        ref={optionDropdownButtonRef}
      >
        {field.options.find((option) => option.value === value)?.label ??
          field.name}
        <TiArrowSortedDown
          className={`${
            optionsDropdownOpen ? 'rotate-0' : 'rotate-90'
          } transition-all text-text-primary duration-text`}
        />
      </button>
      {optionsDropdownOpen && (
        <div
          className="absolute right-0 top-full w-3/4 !mt-0 bg-background-secondary border border-accent-primary rounded-lg shadow-light text-text-primary z-50 max-h-full overflow-y-auto"
          ref={optionDropdownRef}
          onMouseLeave={() => setOptionsDropdownOpen(false)}
        >
          {field.options.map((option: CustomFieldOption) => (
            <button
              key={option.id}
              className={`block px-4 py-2 text-sm hover:bg-background-primary rounded-lg w-full text-left transition-all duration-bg ease-in-out z-1 ${
                value === option.value
                  ? 'bg-background-primary text-text-primary'
                  : 'text-text-secondary'
              }`}
              role="menuitem"
              onClick={() => onChange(field, option.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onChange(field, option.id);
                }
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
