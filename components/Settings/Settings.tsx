import { CustomJobStatusPanelComponent } from './CustomJobStatusPanelComponent/CustomJobStatusPanelComponent';
import { CustomJobFieldPanelComponent } from './CustomJobFieldPanelComponent/CustomJobFieldPanelComponent';
import { TagSettingsPanelComponent } from './TagSettingsPanelComponent/TagSettingsPanelComponent';
import { PreferencesPanelComponent } from './PreferencesPanelComponent/PreferencesPanelComponent';
import { useTranslation } from 'react-i18next';

export function Settings() {
  const { t } = useTranslation();
  return (
    <div className="text-text-primary transition-all duration-bg w-full flex flex-col gap-4 items-center bg-background-primary">
      <span className="text-2xl font-semibold text-text-primary flex items-center transition-colors duration-text">
        {t('settings.title')}
      </span>
      <div
        className="grid grid-cols-2 w-full gap-4 auto-rows-[16rem]"
        id="settings-column-container"
      >
        <div
          className="flex flex-col items-center w-full ring-2 ring-background-secondary rounded-lg py-2 px-4 transition-all duration-bg"
          id="settings-theme-container"
        >
          <PreferencesPanelComponent />
        </div>
        <div
          className="flex flex-col items-start w-full ring-2 ring-background-secondary rounded-lg py-2 px-4 transition-all duration-bg"
          id="settings-tag-editor-container"
        >
          <TagSettingsPanelComponent />
        </div>
        <div
          className="flex flex-col items-start w-full ring-2 ring-background-secondary rounded-lg py-2 px-4 transition-all duration-bg"
          id="settings-status-editor-container"
        >
          <CustomJobStatusPanelComponent />
        </div>
        <div
          className="flex flex-col items-start w-full ring-2 ring-background-secondary rounded-lg py-2 px-4 transition-all duration-bg"
          id="settings-field-editor-container"
        >
          <CustomJobFieldPanelComponent />
        </div>
      </div>
    </div>
  );
}
