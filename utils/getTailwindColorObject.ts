import { TailwindColor, TAILWIND_COLORS } from '../types/tailwindColor';

export const getTailwindColorObjectFromName = (
  target: string
): TailwindColor => {
  const colorObject = TAILWIND_COLORS.find(
    (color: TailwindColor) => color.tailwindColorName === target
  );

  if (colorObject) {
    return colorObject;
  }

  return TAILWIND_COLORS[0]; // Default to the first color if not found
};

export const getDefaultTailwindColorObject = (): TailwindColor => {
  return (
    TAILWIND_COLORS.find(
      (color: TailwindColor) => color.status === 'default'
    ) || TAILWIND_COLORS[0]
  );
};
