// pages/_document.tsx
import Document, { Html, Head, Main, NextScript } from 'next/document';
import { SpeedInsights } from '@vercel/speed-insights/next';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <meta charSet="UTF-8" />

          <link rel="icon" href="/HireTrckr.png" />
          <link rel="apple-touch-icon" href="/HireTrckr.png" />

          <meta name="og:title" content="Trckr" />
          <meta name="twitter:title" content="Trckr" />

          <meta name="description" content="Track your job applications" />
          <meta name="og:description" content="Track your job applications" />
          <meta
            name="twitter:description"
            content="Track your job applications"
          />

          <meta name="og:image" content="/HireTrckr.png" />
          <meta name="twitter:image" content="/HireTrckr.png" />

          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    // Check for saved theme in localStorage
                    const savedTheme = localStorage.getItem('theme');
                    let theme = 'light'; // Default theme
                    
                    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
                      theme = savedTheme;
                    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                      // If no saved theme, check system preference
                      theme = 'dark';
                    }
                    
                    // Apply theme to document
                    document.documentElement.setAttribute('data-theme', theme);
                    
                    // Store the theme for consistency
                    if (!savedTheme) {
                      localStorage.setItem('theme', theme);
                    }
                    
                    // Apply theme color to meta tags
                    const color = theme === 'light' ? '#ffffff' : '#1a1a1a';
                    
                    // Create meta tags for theme color
                    const createMeta = (name, content) => {
                      const meta = document.createElement('meta');
                      meta.setAttribute('name', name);
                      meta.setAttribute('content', content);
                      document.head.appendChild(meta);
                    };
                    
                    createMeta('theme-color', color);
                    createMeta('apple-mobile-web-app-status-bar-style', color);
                    createMeta('apple-mobile-web-app-capable', 'yes');
                    createMeta('msapplication-navbutton-color', color);
                  } catch (e) {
                    console.error('Error setting initial theme:', e);
                  }
                })();
              `,
            }}
          />
        </Head>
        <body className="bg-background-secondary">
          <Main />
          <NextScript />
          <SpeedInsights />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
