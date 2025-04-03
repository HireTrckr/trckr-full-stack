const _tailwindColorNames: string[] = [
  'red',
  'orange',
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

export type TailwindColorName = (typeof _tailwindColorNames)[number];

export const getRandomTailwindColor = (): TailwindColorName => {
  const randomIndex = Math.floor(Math.random() * _tailwindColorNames.length);
  return _tailwindColorNames[randomIndex];
};
