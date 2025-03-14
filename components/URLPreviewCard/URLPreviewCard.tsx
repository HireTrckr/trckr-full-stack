import React, { JSX, useEffect } from 'react';
import { Job } from '../../types/job';
import { SiteMetadata } from '../../types/siteMetadata';

interface URLPreviewCardProps {
  job: Job;
  size: 'small' | 'large';
}

export function UrlPreviewCard({
  job,
  size = 'small',
}: URLPreviewCardProps): JSX.Element {
  const [isLoaded, setIsLoaded] = React.useState<boolean>(true);
  const [error, setError] = React.useState<boolean>(false);
  const [metadata, setMetadata] = React.useState<SiteMetadata | null>(null);

  const link: Job['URL'] = job?.URL;

  if (!link) {
    return <></>;
  }

  useEffect(() => {
    if (!link) return;

    setIsLoaded(false);

    try {
      const url = new URL(link);
      if (!url.protocol.startsWith('http')) {
        setError(true);
        setIsLoaded(true);
        return;
      }

      const favicon = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=32`;

      setMetadata({
        favicon,
        siteName: url.hostname,
      });
    } catch (e) {
      setError(true);

      console.error('[URL-Preview-Card]:', e);
    }
    setIsLoaded(true);
  }, [link]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {isLoaded && !error && metadata && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className={`rounded-full h-full aspect-square text-text-primary ${
            size == 'large'
              ? 'border-4 border-accent-primary p-1 hover:border-accent-hover hover:underline hover:border-2 hover:scale-105'
              : ''
          }`}
        >
          <div className="h-full w-full flex flex-col items-center justify-center gap-2">
            <img
              src={metadata.favicon}
              alt={metadata.siteName}
              className="rounded-md"
            />
            {size == 'large' && (
              <span className="text-xs text-text-primary ">
                {metadata.siteName}
              </span>
            )}
          </div>
        </a>
      )}
      {!isLoaded && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-text-primary p-1 hover:scale-105"
        >
          <div className="h-full w-full flex flex-col items-center justify-center gap-2">
            <div
              className="w-5 h-5 border-4 border-accent-primary
                        border-t-transparent rounded-full 
                        animate-spin"
            />
          </div>
        </a>
      )}
    </div>
  );
}
