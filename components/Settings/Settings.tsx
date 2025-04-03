import { useEffect, useState } from 'react';
import { useSettingsStore } from '../../context/settingStore';
import { ThemeSettings } from '../ThemeSettings/ThemeSettings';
import { ColorPicker } from '../ColorPicker/ColorPicker';
import { TailwindColor } from '../../types/tailwindColor';
import { useTheme } from '../../context/themeContext';
import { useTagStore } from '../../context/tagStore';
import { Tag } from '../../types/tag';
import { useModalStore } from '../../context/modalStore';
import { EditTagModalProps } from '../EditTagModal/EditTagModal';

export function Settings() {
  const settings = useSettingsStore((state) => state.settings);
  const isLoading = useSettingsStore((state) => state.isLoading);

  const openModal = useModalStore((state) => state.openTagCreatorModal);
  const openTagEditor = useModalStore((state) => state.openTagEditorModal);
  const closeModal = useModalStore((state) => state.closeModal);

  const tags = useTagStore((state) => state.tagMap);

  const updateSettings = useSettingsStore((state) => state.updateSettings);
  const { theme, toggleTheme } = useTheme();

  const [formData, setFormData] = useState(settings);

  const resetFormData = () => {
    // Reset form data to the initial settings, ensure re-render of color picker
    setFormData(settings);
  };

  const openCreateTagModal = () => {
    // Open modal to create a new tag
    openModal();
  };

  const getTagEditorProps = (tag: Tag): EditTagModalProps => {
    return {
      tag,
      onSave: async (updatedTag: Tag) => {
        // Handle saving the updated tag
        await useTagStore.getState().updateTag(updatedTag);
        closeModal();
      },
      onDelete: async (tag: Tag) => {
        // Handle deleting the tag
        await useTagStore.getState().deleteTag(tag.id);
        closeModal();
      },
      onClose: () => {
        // Handle closing the modal
        closeModal();
      },
    };
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

  const handleColorSelect = (color: TailwindColor) => {
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
    <div className="text-text-primary transition-all duration-bg w-full flex flex-col gap-4 items-center bg-background-primary">
      <span className="text-2xl font-semibold text-text-primary flex items-center transition-colors duration-text">
        Settings
      </span>
      <div className="flex w-full gap-4" id="settings-column-container">
        <div
          className="flex flex-col flex-1 items-start w-full ring-2 ring-background-secondary rounded-lg p-4 transition-all duration-bg"
          id="settings-theme-container"
        >
          <div className="w-full mb-2">
            <span className="text-xs text-text-secondary">
              Dark Mode: {theme === 'dark' ? 'ON' : 'OFF'}
            </span>
            <ThemeSettings />
          </div>

          <div className="w-full mb-2">
            <span className="text-xs text-text-secondary">Primary Color</span>
            <div
              className="w-full flex justify-evenly items-center gap-4"
              id="settings-color-picker-container"
            >
              <span className="text-text-primary text-md transition-all duration-text min-w-[25%]">
                Theme Color
              </span>
              <ColorPicker
                className="flex-1"
                color={formData.theme.primaryColor}
                onColorSelect={(color) => handleColorSelect(color)}
              />
            </div>
          </div>

          <div className="w-full mb-2">
            <span className="text-xs text-text-secondary">Language</span>
          </div>

          <div
            className="flex items-center justify-center w-full gap-4"
            id="settings-button-container"
          >
            <button
              className="bg-accent-primary hover:brightness-[80%] text-text-accent p-1.5 px-2 py-1 rounded-lg transition-colors duration-bg ease-in-out"
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
        </div>
        <div
          className="flex flex-col flex-1 items-start w-full ring-2 ring-background-secondary rounded-lg p-4 transition-all duration-bg gap-2 min-h-full"
          id="settings-tag-editor-container"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-text-secondary">Tags</span>
            <button
              className="hover:bg-background-secondary rounded-full aspect-square h-[2rem]"
              onClick={() => openCreateTagModal()}
            >
              +
            </button>
          </div>
          <div>
            {tags &&
              Object.values(tags).map((tag: Tag) => (
                <button
                  key={tag.id}
                  className={`flex justify-between items-center gap-2 w-full p-2 hover:bg-background-secondary cursor-pointer min-w-full max-w-full border-2 border-${tag.color}-500 rounded-lg transition-all duration-bg`}
                  onClick={() => {
                    // open modal
                    openTagEditor(getTagEditorProps(tag));
                  }}
                >
                  <span className="text-text-primary">{tag.name}</span>
                  <span className="text-text-secondary capitalize">
                    {tag.color}
                  </span>
                  <span className="text-text-secondary">
                    {tag.count} job{tag.count !== 1 && 's'}
                  </span>
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
