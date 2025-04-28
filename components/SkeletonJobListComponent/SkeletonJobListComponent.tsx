import { SkeletonJobListingComponent } from '../SkeletonJobListingComponent/SkeletonJobListingComponent';

const skeletonItems = Array(3).fill(null);

export const SkeletonJobListComponent: React.FC = () => {
  // Create an array of 3 items to show multiple skeleton cards

  return (
    <div className="w-full transition-colors duration-bg">
      <div className="flex justify-center items-center mb-3">
        <span className="text-2xl font-semibold text-text-primary flex items-center transition-colors duration-text">
          Loading Job Applications...
        </span>
      </div>

      <ul className="relative px-3">
        {skeletonItems.map((_, index) => (
          <li
            key={index}
            className="relative rounded-lg transition-all duration-bg ease-in-out bg-background-primary z-10"
          >
            <SkeletonJobListingComponent />
          </li>
        ))}
      </ul>
    </div>
  );
};
