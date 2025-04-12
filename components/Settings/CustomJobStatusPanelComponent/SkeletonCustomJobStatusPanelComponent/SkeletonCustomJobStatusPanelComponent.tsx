import React, { JSX } from 'react';
import { getSkeletonStatusCards } from '../../../../utils/generateSkeletonData';

export function SkeletonCustomJobStatusPanelComponent(): JSX.Element {
  return (
    <>
      <div className="w-full min-h-[2rem] flex items-center flex justify-between">
        <div className="min-h-[1rem] w-32 bg-gray-700 rounded animate-pulse"></div>
        <button className="rounded-full aspect-square h-[2rem] cursor-not-allowed">
          +
        </button>
      </div>
      <div className="grid grid-cols-4 grid-flow-row auto-rows-[25%] min-w-full overflow-y-scroll flex-1 gap-2">
        {getSkeletonStatusCards(8)}
      </div>
    </>
  );
}
