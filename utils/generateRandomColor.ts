import { TAILWIND_COLORS, TailwindColor } from '../types/tailwindColor';

export const getRandomTailwindColor = (): TailwindColor => {
  const randomIndex = Math.floor(Math.random() * TAILWIND_COLORS.length);

  return TAILWIND_COLORS[randomIndex];
};
