import { DefaultColors } from 'tailwindcss/types/generated/colors';

export type TailwindColor = {
  id: string;
  tailwindColorName: TailwindColorName;
  textColor: 'white' | 'black';
  status: 'active' | 'disabled' | 'default';
};

export type TailwindColorName = keyof Omit<
  DefaultColors,
  'inherit' | 'current' | 'transparent' | 'black' | 'white'
>;

const _TailwindColors: TailwindColor[] = [
  {
    id: '1',
    tailwindColorName: 'red',
    textColor: 'white',
    status: 'active',
  },
  {
    id: '2',
    tailwindColorName: 'orange',
    textColor: 'white',
    status: 'active',
  },
  {
    id: '3',
    tailwindColorName: 'yellow',
    textColor: 'black',
    status: 'active',
  },
  {
    id: '4',
    tailwindColorName: 'lime',
    textColor: 'black',
    status: 'active',
  },
  {
    id: '5',
    tailwindColorName: 'green',
    textColor: 'white',
    status: 'active',
  },
  {
    id: '6',
    tailwindColorName: 'emerald',
    textColor: 'white',
    status: 'disabled',
  },
  {
    id: '7',
    tailwindColorName: 'teal',
    textColor: 'white',
    status: 'active',
  },
  {
    id: '8',
    tailwindColorName: 'cyan',
    textColor: 'white',
    status: 'active',
  },
  {
    id: '9',
    tailwindColorName: 'sky',
    textColor: 'black',
    status: 'disabled',
  },
  {
    id: '10',
    tailwindColorName: 'blue',
    textColor: 'white',
    status: 'default',
  },
  {
    id: '11',
    tailwindColorName: 'indigo',
    textColor: 'white',
    status: 'active',
  },
  {
    id: '12',
    tailwindColorName: 'violet',
    textColor: 'white',
    status: 'active',
  },
  {
    id: '13',
    tailwindColorName: 'purple',
    textColor: 'white',
    status: 'active',
  },
  {
    id: '14',
    tailwindColorName: 'fuchsia',
    textColor: 'white',
    status: 'active',
  },
  {
    id: '15',
    tailwindColorName: 'pink',
    textColor: 'white',
    status: 'active',
  },
  {
    id: '16',
    tailwindColorName: 'rose',
    textColor: 'white',
    status: 'disabled',
  },
];

export const TAILWIND_COLORS: TailwindColor[] = _TailwindColors
  .filter((color: TailwindColor) => color.status !== 'disabled')
  .map((color: TailwindColor) => ({
    ...color,
  }));
