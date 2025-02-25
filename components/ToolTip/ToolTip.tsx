import React, { JSX, useState } from "react";

export function ToolTip({
  text,
  children,
  position = "top",
}: {
  text: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}): JSX.Element {
  const [isVisible, setIsVisible] = useState(false);

  const positions = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div
          className={`
    absolute z-50 
    ${positions[position]}
    px-2 py-1 
    text-sm text-text-primary 
    bg-background-primary
    rounded-md 
    whitespace-nowrap
  `}
        >
          {text}
        </div>
      )}
    </div>
  );
}
