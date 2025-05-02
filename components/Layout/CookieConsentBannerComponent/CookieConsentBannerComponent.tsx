import React, { JSX } from 'react';
import CookieConsent from 'react-cookie-consent';
import { useTranslation } from 'react-i18next';

export function CookieConsentBannerComponent(): JSX.Element {
  const { t } = useTranslation();
  
  return (
    <CookieConsent
      location="bottom"
      buttonText={t('cookies.acknowledge', 'Acknowledge')}
      cookieName="cookieConsent"
      style={{
        background: 'var(--background-primary)',
      }}
    >
      <span className="text-text-primary transition-all duration text">
        {t('cookies.message', 'This website uses cookies to ensure you are kept logged in.')}
      </span>
    </CookieConsent>
  );
}
