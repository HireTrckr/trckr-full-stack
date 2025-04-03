import { TailwindColorName } from '../utils/generateRandomColor';

export type TailwindColor = {
  id: string;
  tailwindColorName: TailwindColorName;
  shade?: string;
  textColor: 'white' | 'black';
  status: 'active' | 'disabled' | 'default';
};

const _TailwindColors: TailwindColor[] = [
  {
    id: '1',
    tailwindColorName: 'red',
    shade: '500',
    textColor: 'white',
    status: 'active',
  },
  {
    id: '2',
    tailwindColorName: 'orange',
    shade: '500',
    textColor: 'white',
    status: 'active',
  },
  {
    id: '3',
    tailwindColorName: 'yellow',
    shade: '500',
    textColor: 'black',
    status: 'active',
  },
  {
    id: '4',
    tailwindColorName: 'lime',
    shade: '500',
    textColor: 'black',
    status: 'active',
  },
  {
    id: '5',
    tailwindColorName: 'green',
    shade: '500',
    textColor: 'white',
    status: 'active',
  },
  {
    id: '6',
    tailwindColorName: 'emerald',
    shade: '500',
    textColor: 'white',
    status: 'disabled',
  },
  {
    id: '7',
    tailwindColorName: 'teal',
    shade: '500',
    textColor: 'white',
    status: 'active',
  },
  {
    id: '8',
    tailwindColorName: 'cyan',
    shade: '500',
    textColor: 'white',
    status: 'active',
  },
  {
    id: '9',
    tailwindColorName: 'sky',
    shade: '500',
    textColor: 'black',
    status: 'disabled',
  },
  {
    id: '10',
    tailwindColorName: 'blue',
    shade: '500',
    textColor: 'white',
    status: 'active',
  },
  {
    id: '11',
    tailwindColorName: 'indigo',
    shade: '500',
    textColor: 'white',
    status: 'active',
  },
  {
    id: '12',
    tailwindColorName: 'violet',
    shade: '500',
    textColor: 'white',
    status: 'active',
  },
  {
    id: '13',
    tailwindColorName: 'purple',
    shade: '500',
    textColor: 'white',
    status: 'active',
  },
  {
    id: '14',
    tailwindColorName: 'fuchsia',
    shade: '500',
    textColor: 'white',
    status: 'active',
  },
  {
    id: '15',
    tailwindColorName: 'pink',
    shade: '500',
    textColor: 'white',
    status: 'active',
  },
  {
    id: '16',
    tailwindColorName: 'rose',
    shade: '500',
    textColor: 'white',
    status: 'disabled',
  },
];

export const TAILWIND_COLORS: TailwindColor[] = _TailwindColors
  .filter((color: TailwindColor) => color.status !== 'disabled')
  .map((color: TailwindColor) => ({
    ...color,
  }));
