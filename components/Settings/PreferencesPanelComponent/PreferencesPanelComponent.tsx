import React, { JSX, useState } from 'react';
import { ThemeSettings } from '../../ThemeSettings/ThemeSettings';
import { useTheme } from '../../../context/themeContext';
import { ColorPicker } from '../../ColorPicker/ColorPicker';
import { useSettingsStore } from '../../../context/settingStore';
import { TailwindColor } from '../../../types/tailwindColor';
import { SkeletonPreferencesPanelComponent } from './SkeletonPreferencesPanelComponent/SkeletonPreferencesPanelComponent';
import { ButtonsComponent } from '../../ButtonsComponent/ButtonsComponent';
import { Settings } from '../../../types/settings';

export function PreferencesPanelComponent(): JSX.Element {
  const { theme } = useTheme();

  const settings = useSettingsStore((state) => state.settings);
  const isLoading = useSettingsStore((state) => state.isLoading);
  const updateSettings = useSettingsStore((state) => state.updateSettings);

  const [formData, setFormData] = useState<Settings>(settings);

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

  if (isLoading) return <SkeletonPreferencesPanelComponent />;

  return (
    <>
      <div className="w-full">
        <span className="text-xs flex items-center text-text-secondary min-h-[2rem]">
          Preferences
        </span>
      </div>
      <div className="flex-1 w-full flex flex-col gap-2">
        <div className="w-full">
          <span className="text-xs text-text-secondary">
            Dark Mode: {theme === 'dark' ? 'ON' : 'OFF'}
          </span>
          <ThemeSettings />
        </div>

        <div className="w-full">
          <span className="text-xs text-text-secondary">Primary Color</span>
          <div
            className="w-full flex justify-evenly items-center gap-4"
            id="settings-color-picker-container"
          >
            <span className="text-text-primary text-sm transition-all duration-text min-w-[25%]">
              Theme Color
            </span>
            <ColorPicker
              className="flex-1"
              color={formData.theme.primaryColor}
              onColorSelect={(color) => handleColorSelect(color)}
            />
          </div>
        </div>

        <div className="w-full flex flex-col">
          <span className="text-xs text-text-secondary">Language</span>
          <span>EN | FR | ZH-HK | ZH-CN</span>
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
