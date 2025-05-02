// pages/_error.tsx
import { NextPageContext } from 'next';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

interface ErrorProps {
  statusCode?: number;
}

function Error({ statusCode }: ErrorProps) {
  statusCode = undefined;
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <h1 className="text-4xl font-bold text-text-primary mb-4">
        {statusCode
          ? t('error.title', { statusCode })
          : t('error.defaultTitle')}
      </h1>
      <p className="text-text-primary mb-6 transition-colors duration-text">
        {t('error.description')}
      </p>
      <Link
        href="/"
        className="px-4 py-2 bg-accent-primary text-text-accent rounded-md
                  hover:brightness-[80%] transition-colors duration-text"
      >
        {t('404.button')}
      </Link>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
