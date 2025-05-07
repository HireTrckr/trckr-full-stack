import { TiDeleteOutline } from 'react-icons/ti';
import { Tag } from '../../types/tag';
import { useState } from 'react';
import { getTailwindColorObjectFromName } from '../../utils/getTailwindColorObject';

interface TagCardProps {
  tag: Tag;
  editable: boolean;
  onRemoveButtonClick: (tagId: Tag['id']) => void;
}

export function TagCard({
  tag,
  onRemoveButtonClick,
  editable = true,
}: TagCardProps) {
  const [showDeleteButton, setShowDeleteButton] = useState<boolean>(false);

  if (!tag) return null;
  const color = getTailwindColorObjectFromName(tag.color);
  return (
    <div
      className={`${tag.color ? `bg-${color.tailwindColorName}-300` : 'bg-accent-primary text-text-accent'} rounded-lg flex items-center justify-between px-2 py-1`}
      onMouseEnter={() => {
        if (editable) setShowDeleteButton(true);
      }}
      onMouseLeave={() => setShowDeleteButton(false)}
    >
      <div
        className={`transition-all duration-200 flex ${
          showDeleteButton ? 'justify-start' : 'justify-center'
        } w-full`}
      >
        <span
          key={tag.id}
          className={`${tag.color ? 'text-text-primary' : 'text-text-accent'} text-xs`}
          style={{ color: color.textColor }}
        >
          {tag?.name || tag.id}
        </span>
      </div>

      {showDeleteButton && (
        <div className="flex-shrink-0 flex items-center justify-end">
          <button
            type="button"
            className="focus:outline-none rounded-full text-center hover:scale-110"
            onClick={() => {
              if (editable) onRemoveButtonClick(tag.id);
            }}
            style={{ color: color.textColor }}
          >
            <TiDeleteOutline />
          </button>
        </div>
      )}
    </div>
  );
}
