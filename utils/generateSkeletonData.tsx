import React, { JSX } from 'react';

export const getSkeletonStatusCards = (count: number): JSX.Element[] => {
  return [...Array(count)].map((_, index) => (
    <div
      key={index}
      className="flex justify-evenly items-center gap-2 w-full p-2 min-w-full max-w-full border-2 border-gray-700 rounded-lg"
    >
      <div className="rounded-full aspect-square h-[1rem] bg-background-secondary animate-pulse" />
      <div className="flex-1 overflow-x-auto">
        <div className="h-[1rem] w-32 bg-background-secondary rounded animate-pulse"></div>
      </div>
    </div>
  ));
};
