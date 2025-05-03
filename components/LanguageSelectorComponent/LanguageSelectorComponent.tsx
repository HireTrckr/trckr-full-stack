// components/LanguageSelector/LanguageSelector.tsx
import React, { useEffect, useState } from 'react';
import { SupportedLanguage } from '../../types/settings';
import { useTranslation } from 'react-i18next';

const languages: { value: SupportedLanguage; label: string }[] = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
  { value: 'es', label: 'Español' },
  { value: 'zh-HK', label: '繁體中文' },
  { value: 'zh-CN', label: '简体中文' },
];

interface LanguageSelectorProps {
  onSelect: (language: SupportedLanguage) => void;
  defaultLanguage: SupportedLanguage;
  className?: string;
}

export function LanguageSelectorComponent({
  onSelect,
  defaultLanguage,
  className,
}: LanguageSelectorProps) {
  const [currentLanguage, setCurrentLanguage] =
    useState<SupportedLanguage>(defaultLanguage);

  useEffect(() => {
    setCurrentLanguage(defaultLanguage);
  }, [defaultLanguage]);

  const handleLanguageChange = (language: SupportedLanguage) => {
    setCurrentLanguage(language);
    onSelect(language);
  };

  return (
    <div
      className={`flex gap-2 justify-evenly ${className ? ` ${className}` : ''}`}
    >
      {languages.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => handleLanguageChange(value)}
          className={`px-3 py-1 rounded-md text-sm transition-all duration-text text-nowrap ${
            currentLanguage === value
              ? 'bg-accent text-text-primary border border-accent-primary'
              : 'hover:bg-background-secondary text-text-secondary'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
