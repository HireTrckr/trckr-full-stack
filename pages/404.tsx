import { useTranslation } from 'react-i18next';

export default function Custom404() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold text-text-primary mb-4">
        {t('404.title')}
      </h1>
      <p className="text-text-primary mb-6 transition-colors duration-text">
        {t('404.description')}
      </p>
      <a
        href="/"
        className="px-4 py-2 bg-accent-primary text-text-accent rounded-md
                  hover:brightness-[80%] transition-colors duration-text"
      >
        {t('404.button')}
      </a>
    </div>
  );
}
