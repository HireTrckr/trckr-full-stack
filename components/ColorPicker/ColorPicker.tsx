import { useEffect, useState, useRef } from 'react';
import { TAILWIND_COLORS, TailwindColor } from '../../types/tailwindColor';
import { TiArrowSortedDown } from 'react-icons/ti';

interface ColorPickerProps {
  color: TailwindColor;
  onColorSelect: (color: TailwindColor) => void;
  className?: string;
}

export function ColorPicker({
  color,
  onColorSelect,
  className,
}: ColorPickerProps) {
  const [statusDropDownOpen, setStatusDropDownOpen] = useState<boolean>(false);

  const [selectedColor, setSelectedColor] = useState<TailwindColor>(color);

  const colorDropDownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedColor(color);
  }, [color]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        colorDropDownRef.current &&
        !colorDropDownRef.current.contains(event.target as Node)
      ) {
        setStatusDropDownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleColorSelect = (color: TailwindColor) => {
    setSelectedColor(color);
    setStatusDropDownOpen(false);
    onColorSelect(color);
  };

  return (
    <div className={`relative w-full ${className ? ` ${className}` : ''}`}>
      <button
        className="w-full px-4 py-2 rounded-lg flex justify-between items-center relative bg-background-primary text-text-primary border border-background-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-opacity-50 transition-all duration-bg capitalize text-left focus:bg-background-secondary"
        onClick={() => setStatusDropDownOpen(!statusDropDownOpen)}
      >
        <div className="flex gap-2 items-center">
          <div
            className={`rounded-full aspect-square h-[1rem] bg-${selectedColor.tailwindColorName}-300`}
          />
          <span className="text-text-primary transition-all duration-text capitalize">
            {selectedColor.tailwindColorName}
          </span>
        </div>
        <TiArrowSortedDown
          className={`${
            statusDropDownOpen ? 'rotate-0' : 'rotate-90'
          } transition-all text-text-primary duration-text`}
        />
      </button>
      {statusDropDownOpen && (
        <div
          className="absolute right-0 top-full w-3/4 !mt-0 bg-background-secondary border border-accent-primary rounded-lg shadow-light text-text-primary z-50 h-[20dvh] overflow-y-scroll"
          ref={colorDropDownRef}
        >
          {TAILWIND_COLORS.filter(
            (color: TailwindColor) => color.status != 'disabled'
          ).map((color: TailwindColor) => (
            <button
              key={color.id}
              className={`flex gap-2 items-center px-4 py-2 text-sm hover:bg-background-primary rounded-lg w-full text-left capitalize transition-all duration-bg ease-in-out z-1 ${
                selectedColor === color
                  ? 'bg-background-primary text-text-primary'
                  : 'text-text-secondary'
              }`}
              role="menuitem"
              onClick={() => {
                handleColorSelect(color);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleColorSelect(color);
                }
              }}
            >
              <div
                className={`rounded-full aspect-square h-[1rem] bg-${color.tailwindColorName}-300`}
              />
              {color.tailwindColorName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
