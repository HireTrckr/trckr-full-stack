import React, { JSX, useState } from 'react';
import { IoIosSettings } from 'react-icons/io';
import { LanguageSelectorComponent } from '../LanguageSelectorComponent/LanguageSelectorComponent';
import { SupportedLanguage } from '../../types/settings';
import i18n from '../../lib/i18n';

interface MaintenanceComponentProps {
  className: string;
}

export function MaintenanceComponent({
  className,
}: MaintenanceComponentProps): JSX.Element {
  const [langauge, setLanguage] = useState<SupportedLanguage>('en');

  function handleLanguageSelect(lang: SupportedLanguage) {
    setLanguage(lang);
  }

  const getTranslationForLanguage = (
    key: string,
    language: SupportedLanguage
  ) => {
    // Get the resources for the formData language
    const resources = i18n.getResourceBundle(language, 'translation');

    // Split the key by dots to traverse the nested object
    const keys = key.split('.');
    let value = resources;

    // Traverse the nested object
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key; // Return the key if translation is not found
      }
    }

    return value || key;
  };

  return (
    <div
      className={`fixed inset flex flex-col items-center justify-center text-lg text-text-primary transition-all duraiton-text ${className ? className : ''}`}
    >
      <IoIosSettings className="h-[20dvh] w-[20dvw] animate-bounce" />
      <span>{getTranslationForLanguage('maintenance.message', langauge)}</span>
      <LanguageSelectorComponent
        onSelect={handleLanguageSelect}
        defaultLanguage="en"
      />
    </div>
  );
}
