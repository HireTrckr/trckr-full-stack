import React, { JSX } from 'react';
import { ButtonsComponent } from '../../ButtonsComponent/ButtonsComponent';

export function CustomJobFieldPanelComponent(): JSX.Element {
  const handleReset = () => {};

  return (
    <>
      <div className="w-full flex justify-between items-center">
        <span className="text-xs text-text-secondary">Fields</span>
        <ButtonsComponent onReset={() => handleReset()} />
      </div>
      <div className="flex-1"></div>
    </>
  );
}
