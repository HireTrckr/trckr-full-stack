import React, { JSX } from 'react';

export function SkeletonPreferencesPanelComponent(): JSX.Element {
  return (
    <>
      <div className="w-full min-h-[2rem] flex items-center">
        <div className="min-h-[1rem] w-32 bg-gray-700 rounded animate-pulse"></div>
      </div>
      <div className="flex-1 w-full flex flex-col gap-2 pt-2">
        <div className="flex flex-col gap-1">
          <div className="h-[1rem] w-40 bg-gray-700 rounded animate-pulse"></div>
          <div className="flex items-center justify-between">
            <div className="h-[1.25rem] w-28 bg-gray-700 rounded animate-pulse"></div>
            <div className="h-7 w-16 rounded-full bg-gray-700 animate-pulse"></div>
          </div>
        </div>

        <div className="w-full flex flex-col gap-1">
          <div className="h-[1rem] w-40 bg-gray-700 rounded animate-pulse"></div>
          <div className="flex items-center justify-between">
            <div className="h-[1.25rem] w-28 bg-gray-700 rounded animate-pulse"></div>
            <div className="h-7 w-[50%] rounded-full bg-gray-700 animate-pulse"></div>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="h-[1rem] w-40 bg-gray-700 rounded animate-pulse"></div>
          <div className="flex items-center min-h-7">
            <div className="h-[1.25rem] w-28 bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </>
  );
}
