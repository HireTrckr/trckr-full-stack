const TAILWIND_COLORS = [
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
] as const;

export type TailwindColor = (typeof TAILWIND_COLORS)[number];

export const getRandomTailwindColor = (): TailwindColor => {
  const randomIndex = Math.floor(Math.random() * TAILWIND_COLORS.length);
  return TAILWIND_COLORS[randomIndex];
};
