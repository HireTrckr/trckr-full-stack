import React, { JSX, useEffect } from 'react';
import { Job } from '../../types/job';
import { SiteMetadata } from '../../types/siteMetadata';
import Image from 'next/image';

interface URLPreviewCardProps {
  job: Job;
  size: 'small' | 'large';
}

const formatUrl = (url: string): string => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return url.startsWith('http://') || url.startsWith('https://')
    ? url
    : `https://${url}`;
};

export function UrlPreviewCard({
  job,
  size = 'small',
}: URLPreviewCardProps): JSX.Element {
  const [isLoaded, setIsLoaded] = React.useState<boolean>(true);
  const [error, setError] = React.useState<boolean>(false);
  const [metadata, setMetadata] = React.useState<SiteMetadata | null>(null);

  const link: Job['URL'] = job?.URL;

  const formattedURL = formatUrl(link ?? '');

  useEffect(() => {
    if (!link) return;

    setIsLoaded(false);

    try {
      if (!URL.canParse(formattedURL)) {
        setError(true);
        setIsLoaded(true);
        return;
      }
      const url = new URL(formattedURL);
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

  if (!link) {
    return <></>;
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <a
          href={formattedURL}
          target="_blank"
          rel="noopener noreferrer"
          className={`rounded-full h-full aspect-square text-text-primary ${
            size == 'large'
              ? 'border-4 border-accent-primary p-1 hover:border-accent-hover hover:underline hover:border-2 hover:scale-105'
              : ''
          }`}
        >
          <div className="h-full w-full flex flex-col items-center justify-center gap-2">
            <Image
              src="/images/website.png"
              alt="website"
              className="rounded-md"
              width={32}
              height={32}
            />
            {size == 'large' && (
              <span className="text-xs text-text-primary ">Website</span>
            )}
          </div>
        </a>
      </div>
    );
  }
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {isLoaded && !error && metadata && (
        <a
          href={formattedURL}
          target="_blank"
          rel="noopener noreferrer"
          className={`rounded-full h-full aspect-square text-text-primary ${
            size == 'large'
              ? 'border-4 border-accent-primary p-1 hover:border-accent-hover hover:underline hover:border-2 hover:scale-105'
              : ''
          }`}
        >
          <div className="h-full w-full flex flex-col items-center justify-center gap-2">
            <Image
              src={metadata.favicon || ''}
              alt={metadata.siteName || ''}
              className="rounded-md"
              width={32}
              height={32}
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
          href={formattedURL}
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
