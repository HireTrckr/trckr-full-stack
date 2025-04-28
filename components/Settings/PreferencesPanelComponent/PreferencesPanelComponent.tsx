import React, { JSX, use, useEffect, useState } from 'react';
import { ThemeSettings } from '../../ThemeSettings/ThemeSettings';
import { ColorPicker } from '../../ColorPicker/ColorPicker';
import { useSettingsStore } from '../../../context/settingStore';
import { TailwindColor } from '../../../types/tailwindColor';
import { SkeletonPreferencesPanelComponent } from './SkeletonPreferencesPanelComponent/SkeletonPreferencesPanelComponent';
import { ButtonsComponent } from '../../ButtonsComponent/ButtonsComponent';
import { Settings, SupportedLanguage } from '../../../types/settings';
import { LanguageSelectorComponent } from '../../LanguageSelectorComponent/LanguageSelectorComponent';

export function PreferencesPanelComponent(): JSX.Element {
  const settings = useSettingsStore((state) => state.settings);
  const isLoading = useSettingsStore((state) => state.isLoading);
  const updateSettings = useSettingsStore((state) => state.updateSettings);

  const [formData, setFormData] = useState<Settings>(settings);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const resetFormData = () => {
    // Reset form data to the initial settings, ensure re-render of color picker
    setFormData(settings);
  };

  const handleSave = async () => {
    //compare but ignore timestamps
    const { timestamps: _, ...formDataWithoutTimestamps } = formData;
    const { timestamps: __, ...settingsWithoutTimestamps } = settings;
    if (
      JSON.stringify(formDataWithoutTimestamps) ===
      JSON.stringify(settingsWithoutTimestamps)
    ) {
      return;
    }
    if (!(await updateSettings(formData))) {
      console.error('Failed to update settings');
      return;
    }
  };

  const handleColorSelect = (color: TailwindColor) => {
    setFormData((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        primaryColor: color,
      },
    }));
  };

  const handleLanguageSelect = (language: SupportedLanguage) => {
    setFormData((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        language,
      },
    }));
  };

  if (isLoading) return <SkeletonPreferencesPanelComponent />;

  return (
    <>
      <div className="w-full">
        <span className="text-xs flex items-center text-text-secondary min-h-[2rem]">
          Preferences
        </span>
      </div>
      <div className="flex-1 w-full flex flex-col justify-evenly">
        <div className="w-full">
          <ThemeSettings />
        </div>

        <div className="w-full">
          <LanguageSelectorComponent
            defaultLanguage={formData.preferences.language}
            onSelect={(language) => handleLanguageSelect(language)}
          />
        </div>

        <div className="w-full">
          <span className="text-xs text-text-secondary">Primary Color</span>
          <ColorPicker
            color={formData.theme.primaryColor}
            onColorSelect={(color) => handleColorSelect(color)}
          />
        </div>
      </div>

      <div className="w-[25%]" id="settings-button-container">
        <ButtonsComponent
          onSave={() => handleSave()}
          onCancel={() => resetFormData()}
        />
      </div>
    </>
  );
}
