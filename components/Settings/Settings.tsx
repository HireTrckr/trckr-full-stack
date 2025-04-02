import { useEffect, useState } from 'react';
import { useSettingsStore } from '../../context/settingStore';
import { ThemeSettingsDropdown } from '../ThemeSettingsDropdown/ThemeSettingsDropdown';
import { ColorPicker } from '../ColorPicker/ColorPicker';

export function Settings() {
  const settings = useSettingsStore((state) => state.settings);
  const isLoading = useSettingsStore((state) => state.isLoading);

  const updateSettings = useSettingsStore((state) => state.updateSettings);

  const [formData, setFormData] = useState(settings);

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
      console.log('no changes');
      return;
    }
    if (!(await updateSettings(formData))) {
      console.error('Failed to update settings');
      return;
    }
  };

  const handleColorSelect = (color: string) => {
    setFormData((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        primaryColor: color,
      },
    }));
  };

  if (isLoading) {
    return <p className="text-text-secondary min-h-[250px]">Loading...</p>;
  }

  return (
    <div className="text-text-primary transition-all duration-text w-full flex flex-col gap-4 items-center bg-background-primary">
      <span className="text-2xl font-semibold text-text-primary flex items-center transition-colors duration-text">
        Settings
      </span>
      <div
        className="flex w-full gap-4 items-center items-start"
        id="settings-column-container"
      >
        <div
          className="flex flex-col flex-1 items-start w-full"
          id="settings-theme-container"
        >
          <span className="text-xs text-text-secondary">Theme</span>
          <ThemeSettingsDropdown />

          <div
            className="w-full flex justify-evenly items-center gap-4"
            id="settings-color-picker-container"
          >
            <span className="text-text-primary transition-all duration-text">
              Primary Color
            </span>
            <ColorPicker
              className="flex-1"
              color={formData.theme.primaryColor}
              onColorSelect={(color) => handleColorSelect(color)}
            />
          </div>
        </div>
        <div
          className="flex flex-col flex-1 items-start w-full"
          id="settings-preferences-container"
        >
          <span className="text-xs text-text-secondary">Preferences</span>
          <span className="text-sm text-text-primary">
            {JSON.stringify(settings.preferences)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4" id="settings-button-container">
        <button
          className="bg-blue-300 hover:brightness-[80%] text-white p-1.5 px-2 py-1 rounded-lg transition-colors duration-bg ease-in-out"
          onClick={() => handleSave()}
        >
          Save
        </button>
        <button
          className="bg-red-300 hover:brightness-[80%] rounded-lg p-1.5 px-2 py-1 rounded-lg transition-colors duration-bg ease-in-out text-white"
          onClick={() => resetFormData()}
        >
          Cancel
        </button>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-md text-text-secondary">Tags</span>
      </div>
    </div>
  );
}
