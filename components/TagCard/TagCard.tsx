import { TiDeleteOutline } from 'react-icons/ti';
import { Tag } from '../../types/tag';
import { useState } from 'react';

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
  if (!tag) return null;
  const [showDeleteButton, setShowDeleteButton] = useState<Boolean>(false);

  return (
    <div
      className={`${tag.color ? `bg-${tag.color}-300` : 'bg-accent-primary'} rounded-lg flex items-center justify-between px-2 py-1 min-w-[60px]`}
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
        <span key={tag.id} className="text-text-primary text-xs">
          {tag?.name || tag.id}
        </span>
      </div>

      {showDeleteButton && (
        <div className="flex-shrink-0 max-h-[16px] flex items-center justify-end">
          <button
            type="button"
            className="text-white focus:outline-none rounded-full text-center hover:scale-110"
            onClick={() => {
              if (editable) onRemoveButtonClick(tag.id);
            }}
          >
            <TiDeleteOutline />
          </button>
        </div>
      )}
    </div>
  );
}
