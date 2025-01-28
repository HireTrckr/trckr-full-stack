import React, { JSX } from "react";
import Auth from "../Auth/Auth";

export default function Navbar(): JSX.Element {
  return (
    <nav className="bg-gray-800 p-1 text-white flex justify-between items-center w-full">
      <div className="flex items-center space-x-2 p-1">
        <img
          src="/HireTrckr.png"
          alt="HireTrkr Logo"
          className="w-[15px] h-[15px] rounded-[50%]"
        />
        <h1 className="text-sm font-semibold">HireTrkr</h1>
      </div>
      <Auth />
    </nav>
  );
}
