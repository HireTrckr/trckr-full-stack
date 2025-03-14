import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

type Theme = 'light' | 'dark';

const DEFAULT_THEME: Theme = 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (window && typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme;
      if (savedTheme) {
        return savedTheme;
      }

      // If no saved theme, check system preference
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
      return systemTheme.matches ? 'dark' : 'light';
    }

    // fallback
    return DEFAULT_THEME;
  });

  // save theme to local storage
  useEffect(() => {
    try {
      localStorage.setItem('theme', theme);
      document.documentElement.setAttribute('data-theme', theme);

      // Safely get computed style
      let color: string;
      try {
        color = getComputedStyle(document.documentElement)
          .getPropertyValue('--background-primary')
          .trim();

        // Ensure the color is in proper format (add # if it's missing)
        if (!color.startsWith('#')) {
          color = `#${color}`;
        }
      } catch (e) {
        console.warn('Could not get computed style:', e);
        // Fallback colors if CSS variable isn't available
        color = theme === 'light' ? '#ffffff' : '#1a1a1a';
      }

      // Function to safely update or create meta tag
      const updateMetaTag = (name: string, content: string) => {
        try {
          // Remove existing meta tag
          const existingMeta = document.querySelector(`meta[name="${name}"]`);
          if (existingMeta) {
            existingMeta.remove();
          }

          // Create and append new meta tag
          const meta = document.createElement('meta');
          meta.setAttribute('name', name);
          meta.setAttribute('content', content);
          document.head.appendChild(meta);
        } catch (e) {
          console.warn(`Error updating meta tag ${name}:`, e);
        }
      };

      // Update all meta tags
      updateMetaTag('theme-color', color);
      updateMetaTag('apple-mobile-web-app-status-bar-style', color);
      updateMetaTag('apple-mobile-web-app-capable', 'yes');
      updateMetaTag('msapplication-navbutton-color', color);

      // Force a repaint in some browsers
      const style = document.createElement('style');
      style.textContent = `
         @media (prefers-color-scheme: ${theme}) {
           :root { color-scheme: ${theme}; }
         }
       `;
      document.head.appendChild(style);

      // Clean up the temporary style element
      return () => {
        style.remove();
      };
    } catch (e) {
      console.error('Error in theme effect:', e);
    }
  }, [theme]);

  // switch from light to dark
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
