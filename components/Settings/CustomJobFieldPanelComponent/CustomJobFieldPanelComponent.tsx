import React, { JSX } from 'react';
import { ButtonsComponent } from '../../ButtonsComponent/ButtonsComponent';
import { useTranslation } from 'react-i18next';

export function CustomJobFieldPanelComponent(): JSX.Element {
  const handleReset = () => {};

  const { t } = useTranslation();

  return (
    <>
      <div className="w-full flex justify-between items-center">
        <span className="text-xs text-text-secondary">
          {t('settings.fields.title')}
        </span>
        <div className="text-xs">
          <ButtonsComponent onReset={() => handleReset()} />
        </div>
      </div>
      <div className="flex-1"></div>
    </>
  );
}
