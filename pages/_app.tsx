import { AppProps } from 'next/app';
import Head from 'next/head';
import { ThemeProvider } from '../context/themeContext';
import '../styles/theme.css';
import '../styles/globals.css';
import { Layout } from '../components/Layout/Layout';
import { I18nextProvider } from 'react-i18next';
import i18n from '../lib/i18n';
import { useRouter } from 'next/router';
import { SpeedInsights } from '@vercel/speed-insights/react';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  return (
    <ThemeProvider>
      <I18nextProvider i18n={i18n}>
        <Head>
          <title>Trckr</title>
          <meta name="description" content="Track your job applications" />
          <meta charSet="UTF-8" />

          <link rel="shortcut icon" type="image/x-icon" href="/HireTrckr.png" />

          <link rel="icon" type="image/x-icon" href="/HireTrckr.png" />
          <link rel="apple-touch-icon" href="/HireTrckr.png" />

          <meta
            name="keywords"
            content="Job, Jobs, Applications, Application Management, Job Application Tracking"
          />

          <meta property="og:url" content="https://hire-trckr.vercel.app" />
          <meta property="og:type" content="website" />
          <meta property="og:title" content="Trckr" />
          <meta
            property="og:description"
            content="Track your job applications"
          />
          <meta
            property="og:image"
            content="https://hire-trckr.vercel.app/HireTrckr.png"
          />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />

          <meta name="twitter:card" content="summary_large_image" />
          <meta property="twitter:domain" content="hire-trckr.vercel.app" />
          <meta
            property="twitter:url"
            content="https://hire-trckr.vercel.app"
          />
          <meta name="twitter:title" content="Trckr" />
          <meta
            name="twitter:description"
            content="Track your job applications"
          />
          <meta
            name="twitter:image"
            content="https://hire-trckr.vercel.app/HireTrckr.png"
          />

          <meta name="author" content="Dylan Penney" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </I18nextProvider>
      <SpeedInsights route={router.pathname} />;
    </ThemeProvider>
  );
}

export default MyApp;
