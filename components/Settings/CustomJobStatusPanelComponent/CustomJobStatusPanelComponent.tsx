import React, { JSX } from 'react';
import { ButtonsComponent } from '../../ButtonsComponent/ButtonsComponent';

export function CustomJobStatusPanelComponent(): JSX.Element {
  const handleReset = () => {
    // remove all custom status
  };

  return (
    <>
      <div className="w-full flex justify-between items-center">
        <span className="text-xs text-text-secondary">Status</span>
        <ButtonsComponent onReset={() => handleReset()} />
      </div>
      <div className="flex-1"></div>
    </>
  );
}
