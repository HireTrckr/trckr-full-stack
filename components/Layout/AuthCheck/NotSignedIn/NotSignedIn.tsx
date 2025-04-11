import React, { JSX } from 'react';

import { signInWithGoogle } from '../../../../utils/authUtils';

export function NotSignedIn(): JSX.Element {
  return (
    <div className="bg-background-primary rounded-lg p-6 transition-all duration-bg ease-in-out flex flex-col items-center hover:scale-[1.02]">
      <h2 className="text-2xl font-semibold text-text-primary flex items-center transition-colors duration-text capitalize mb-6">
        please sign in to continue
      </h2>
      <button
        onClick={signInWithGoogle}
        className="px-3 py-1.5 rounded-lg text-sm font-medium
             bg-accent-primary hover:brightness-[80%]
             text-text-accent
             transition-all duration-text ease-in-out
             flex items-center gap-2 shadow-light"
      >
        Sign In
      </button>
    </div>
  );
}
