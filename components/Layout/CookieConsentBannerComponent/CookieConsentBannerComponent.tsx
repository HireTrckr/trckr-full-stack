import React, { JSX } from 'react';
import CookieConsent from 'react-cookie-consent';

export function CookieConsentBannerComponent(): JSX.Element {
  return (
    <CookieConsent
      location="bottom"
      buttonText="Acknowledge"
      cookieName="cookieConsent"
      style={{
        background: 'var(--background-primary)',
      }}
    >
      <span className="text-text-primary transition-all duration text">
        This website uses cookies to ensure you are kept logged in.
      </span>
    </CookieConsent>
  );
}
