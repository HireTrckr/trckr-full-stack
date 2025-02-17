import React, { JSX } from "react";
import { UserThumbnail } from "../UserThumbnail/UserThumbnail";
import Link from "next/link";

export function Navbar(): JSX.Element {
  return (
    <nav className="bg-background-primary border-b border-background-secondary text-text-primary transition-colors duration-bg ease-in-out grid grid-cols-[1fr_auto_1fr] w-full items-center px-4 py-2 shadow-light">
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
        <Link
          href="/list"
          className="text-text-primary hover:text-text-secondary transition-colors duration-text capitalize"
        >
          track
        </Link>
        <span className="text-text-secondary transition-all duration-text">
          |
        </span>
        <Link
          href="/new"
          className="text-text-primary hover:text-text-secondary transition-colors duration-text capitalize"
        >
          add new
        </Link>
        <span className="text-text-secondary transition-all duration-text">
          |
        </span>
        <Link
          href="/settings"
          className="text-text-primary hover:text-text-secondary transition-colors duration-text capitalize"
        >
          settings
        </Link>
      </div>
      <UserThumbnail />
    </nav>
  );
}
