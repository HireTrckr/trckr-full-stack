import { DefaultColors } from 'tailwindcss/types/generated/colors';
import colors from 'tailwindcss/colors';

export type TailwindColorName = keyof Omit<
  DefaultColors,
  'inherit' | 'current' | 'transparent' | 'black' | 'white'
>;

const colorKeys = Object.keys(colors) as TailwindColorName[];
const availableColors = colorKeys.filter((color) => {
  return !['inherit', 'current', 'transparent', 'black', 'white'].includes(
    color
  );
});

export const getRandomTailwindColor = (): TailwindColorName => {
  const randomIndex = Math.floor(Math.random() * availableColors.length);
  return availableColors[randomIndex];
};
