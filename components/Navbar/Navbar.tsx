import React, { JSX } from 'react';
import { UserThumbnail } from '../UserThumbnail/UserThumbnail';
import Link from 'next/link';
import { NavBarOption } from '../../types/navBarOption';

const navBarOptions: NavBarOption[] = [
  { link: '/list', text: 'track' },
  { link: '/new', text: 'add new' },
  { link: '/settings', text: 'settings' },
];

export function Navbar(): JSX.Element {
  return (
    <nav className="fixed top-0 bg-background-primary border-b border-background-secondary text-text-primary transition-colors duration-bg ease-in-out grid grid-cols-[1fr_auto_1fr] w-full items-center px-4 py-2 shadow-light">
      <Link href="/">
        <div className="flex items-center space-x-2 p-1">
          <img
            src="/HireTrckr.png"
            alt="HireTrkr Logo"
            className="w-[15px] h-[15px] rounded-[50%]"
          />
          <h1 className="text-lg font-semibold text-text-primary transition-colors duration-text">
            HireTrkr
          </h1>
        </div>
      </Link>
      <div className="flex items-center gap-2 mx-auto">
        {navBarOptions.map((option: NavBarOption) => (
          <Link
            key={option.link}
            href={option.link}
            className="text-text-primary hover:text-text-secondary transition-colors duration-text capitalize"
          >
            {option.text}
          </Link>
        ))}
      </div>
      <UserThumbnail />
    </nav>
  );
}
