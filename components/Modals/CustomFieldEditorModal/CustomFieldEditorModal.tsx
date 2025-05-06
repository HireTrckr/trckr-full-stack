import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CustomField, CustomFieldType } from '../../../types/customField';
import { TiArrowSortedDown } from 'react-icons/ti';

export interface CustomFieldEditorModalProps {
  field: CustomField;
  onSave: (field: CustomField) => Promise<void>;
  onDelete: (field: CustomField) => Promise<void>;
  onClose: () => void;
}

export function CustomFieldEditorModal({
  field,
  onSave,
  onDelete,
  onClose,
}: CustomFieldEditorModalProps) {
  const { t } = useTranslation();
  const [fieldName, setFieldName] = useState(field.name);
  const [fieldType] = useState<CustomFieldType>(field.type); // Type cannot be changed after creation
  const [isRequired, setIsRequired] = useState(field.required);
  const [options, setOptions] = useState<string>(
    field.options?.map((opt) => opt.label).join(', ') || ''
  );

  const [defaultValue, setDefaultValue] = useState<CustomField['defaultValue']>(
    field.defaultValue
  );
  const [defaultValueDropDownIsOpen, setDefaultValueDropDownIsOpen] =
    useState<boolean>(false);
  const defaultValueDropDownMenuRef = React.useRef<HTMLDivElement>(null);
  const defaultValueDropdownMenuButtonRef =
    React.useRef<HTMLButtonElement>(null);

  const handleSave = async () => {
    if (!fieldName.trim()) {
      return;
    }

    try {
      const updatedField: CustomField = {
        ...field,
        name: fieldName.trim(),
        required: isRequired,
        defaultValue: defaultValue,
      };

      // Update options for SELECT type
      if (fieldType === CustomFieldType.SELECT && options.trim()) {
        const optionsList = options
          .split(',')
          .map((option) => option.trim())
          .filter(Boolean);
        if (optionsList.length === 0) {
          return;
        }

        // Preserve existing option IDs where possible
        const existingOptions = field.options || [];
        updatedField.options = optionsList.map((option, index) => {
          const existingOption = existingOptions.find(
            (opt) => opt.label === option
          );
          if (existingOption) {
            return existingOption;
          }
          return {
            id: `option-${field.id}-${index}`,
            label: option,
            value: option.toLowerCase().replace(/\s+/g, '-'),
          };
        });
      }

      await onSave(updatedField);
    } catch (error) {
      console.error('Error updating custom field:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(field);
    } catch (error) {
      console.error('Error deleting custom field:', error);
    }
  };

  const handleDefaultValueChange = (value: string) => {
    // ensure default value is the correct type
    switch (fieldType) {
      case CustomFieldType.STRING:
        setDefaultValue(value);
        break;
      case CustomFieldType.NUMBER:
        setDefaultValue(Number(value) || null);
        break;
      case CustomFieldType.BOOLEAN:
        setDefaultValue(Boolean(value) || null);
        break;
      case CustomFieldType.DATE:
        setDefaultValue(new Date(value) || null);
        break;
      case CustomFieldType.SELECT:
        setDefaultValue(value);
        break;
      default:
        setDefaultValue(null);
    }
  };

  const renderDefaultValueInput = () => {
    switch (fieldType) {
      case CustomFieldType.STRING:
      case CustomFieldType.NUMBER:
      case CustomFieldType.DATE:
        return (
          <input
            type={fieldType === CustomFieldType.DATE ? 'date' : 'text'}
            value={defaultValue as string}
            onChange={(e) => handleDefaultValueChange(e.target.value)}
            className="w-full px-4 py-2 rounded-lg
                       bg-background-primary 
                       text-text-primary
                       border border-background-secondary
                       focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50 focus:bg-background-secondary
                       placeholder-text-secondary/50
                       transition-all duration-text"
          />
        );

      case CustomFieldType.BOOLEAN:
        return (
          <div className="relative">
            <button
              className="w-full px-4 py-2 rounded-lg flex justify-between items-center bg-background-primary text-text-primary border border-background-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50 transition-all duration-text text-left"
              onClick={() =>
                setDefaultValueDropDownIsOpen(!defaultValueDropDownIsOpen)
              }
              ref={defaultValueDropdownMenuButtonRef}
              type="button"
            >
              <span>
                {defaultValue
                  ? defaultValue instanceof Date
                    ? defaultValue.toLocaleDateString()
                    : defaultValue
                  : 'Select an option'}
              </span>
              <TiArrowSortedDown
                className={`${
                  defaultValueDropDownIsOpen ? 'rotate-0' : 'rotate-90'
                } transition-all text-text-primary duration-text`}
              />
            </button>
            {defaultValueDropDownIsOpen && (
              <div
                className="absolute right-0 top-full w-3/4 !mt-0 bg-background-secondary border border-accent-primary rounded-lg shadow-light text-text-primary z-50 max-h-full overflow-y-auto min-h-[6rem]"
                ref={defaultValueDropDownMenuRef}
                onMouseLeave={() => setDefaultValueDropDownIsOpen(false)}
              >
                {['Yes', 'No'].map((type) => (
                  <button
                    key={type}
                    className={`block px-4 py-2 text-sm hover:bg-background-primary rounded-lg w-full text-left transition-all duration-bg ease-in-out z-1 ${
                      fieldType === type
                        ? 'bg-background-primary text-text-primary'
                        : 'text-text-secondary'
                    }`}
                    role="menuitem"
                    onClick={() => {
                      setDefaultValue(type);
                      setDefaultValueDropDownIsOpen(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setDefaultValue(type);
                        setDefaultValueDropDownIsOpen(false);
                      }
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      case CustomFieldType.SELECT:
        return (
          <div className="relative">
            <button
              className="w-full px-4 py-2 rounded-lg flex justify-between items-center bg-background-primary text-text-primary border border-background-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50 transition-all duration-text text-left"
              onClick={() =>
                setDefaultValueDropDownIsOpen(!defaultValueDropDownIsOpen)
              }
              ref={defaultValueDropdownMenuButtonRef}
              type="button"
            >
              <span>
                {defaultValue
                  ? defaultValue instanceof Date
                    ? defaultValue.toLocaleDateString()
                    : defaultValue
                  : 'Select an option'}
              </span>
              <TiArrowSortedDown
                className={`${
                  defaultValueDropDownIsOpen ? 'rotate-0' : 'rotate-90'
                } transition-all text-text-primary duration-text`}
              />
            </button>
            {defaultValueDropDownIsOpen && (
              <div
                className="absolute right-0 top-full w-3/4 !mt-0 bg-background-secondary border border-accent-primary rounded-lg shadow-light text-text-primary z-50 max-h-full overflow-y-auto min-h-[6rem]"
                ref={defaultValueDropDownMenuRef}
                onMouseLeave={() => setDefaultValueDropDownIsOpen(false)}
              >
                {options
                  .split(',')
                  .map((option) => option.trim())
                  .map((type) => (
                    <button
                      key={type}
                      className={`block px-4 py-2 text-sm hover:bg-background-primary rounded-lg w-full text-left transition-all duration-bg ease-in-out z-1 ${
                        fieldType === type
                          ? 'bg-background-primary text-text-primary'
                          : 'text-text-secondary'
                      }`}
                      role="menuitem"
                      onClick={() => {
                        setDefaultValue(type);
                        setDefaultValueDropDownIsOpen(false);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setDefaultValue(type);
                          setDefaultValueDropDownIsOpen(false);
                        }
                      }}
                    >
                      {type}
                    </button>
                  ))}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col intems-center w-[25dvw] max-w-[25dvw]">
      <h2 className="text-xl font-semibold mb-4 text-text-primary text-center transition-all duration-text w-full">
        Edit Property
      </h2>

      <div className="mb-4 w-full">
        <label htmlFor="fieldName" className="block text-text-primary text-xs">
          Property Name
        </label>
        <input
          id="fieldName"
          type="text"
          value={fieldName}
          onChange={(e) => setFieldName(e.target.value)}
          className="p-2 rounded w-full bg-background-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50 border: border-background-secondary transition-all duration-200 ease-in-out focus:bg-background-secondary"
          placeholder="e.g., Salary, Remote, Interview Date"
        />
      </div>

      <div className="mb-4 w-full">
        <label htmlFor="fieldType" className="block text-text-primary text-xs">
          Property Type
        </label>
        <input
          id="fieldType"
          type="text"
          value={t(`types.${fieldType}`)}
          disabled
          className="p-2 rounded w-full bg-background-primary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50 border: border-background-secondary transition-all duration-200 ease-in-out focus:bg-background-secondary"
        />
        <p className="text-xs text-text-secondary">
          Property type cannot be changed after creation
        </p>
      </div>

      {fieldType === CustomFieldType.SELECT && (
        <div className="mb-4 w-full">
          <label htmlFor="options" className="block text-text-primary text-xs">
            Options (comma separated)
          </label>
          <input
            id="options"
            type="text"
            value={options}
            onChange={(e) => setOptions(e.target.value)}
            className="flex flex-wrap gap-2 items-center w-full px-4 py-2 rounded-lg bg-background-primary text-text-primary border border-background-secondary focus-within:outline-none focus-within:ring-2 focus-within:ring-accent-primary focus-within:ring-opacity-50 focus-within:bg-background-secondary placeholder-text-secondary/50 transition-all duration-text cursor-text"
            placeholder="e.g., Option 1, Option 2, Option 3"
          />
        </div>
      )}

      <div className="mb-4 w-full flex justify-center gap-2">
        <input
          id="isRequired"
          type="checkbox"
          checked={isRequired}
          onChange={(e) => setIsRequired(e.target.checked)}
          className="h-4 w-4 accent-accent-primary rounded-lg"
        />
        <label htmlFor="isRequired" className="text-text-primary text-xs">
          Required field
        </label>
      </div>

      {isRequired && (
        <div className="mb-4 w-full">
          <label
            htmlFor="defaultValue"
            className="block text-text-primary text-xs"
          >
            Default Value
          </label>
          {renderDefaultValueInput()}
        </div>
      )}

      <div className="flex justify-center space-x-3 mt-2">
        <button
          onClick={handleSave}
          className="bg-blue-300 hover:bg-blue-400 text-white px-4 py-2 rounded transition-colors duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={
            !fieldName.trim() ||
            (fieldType == CustomFieldType.SELECT && !field.options) ||
            (isRequired && !defaultValue)
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
        >
          Delete
        </button>
      </div>
    </div>
  );
}
