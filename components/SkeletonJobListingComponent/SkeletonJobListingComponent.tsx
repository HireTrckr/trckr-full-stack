import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export function SkeletonJobListingComponent() {
  return (
    <div className="relative flex items-center justify-between p-4 z-0">
      <div className="flex gap-2 items-center min-h-full min-w-full">
        <div className="rounded-lg max-h-10 max-w-10">
          <Skeleton
            borderRadius={'0.5rem'}
            width={'2rem'}
            height={'2rem'}
            baseColor="var(--background-secondary)"
            highlightColor="var(--background-primary)"
          />
        </div>

        <div className="flex flex-col justify-between flex-1">
          <div className="flex items-center gap-2 max-h-[1.5rem] w-full">
            <Skeleton
              height={'1rem'}
              width={'15rem'}
              baseColor="var(--background-secondary)"
              highlightColor="var(--background-primary)"
            />
            <Skeleton
              height={'1rem'}
              width={'5rem'}
              baseColor="var(--background-secondary)"
              highlightColor="var(--background-primary)"
            />
          </div>
          <div className="max-h-[1rem]">
            <Skeleton
              height={'.75rem'}
              width={'10rem'}
              baseColor="var(--background-secondary)"
              highlightColor="var(--background-primary)"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
