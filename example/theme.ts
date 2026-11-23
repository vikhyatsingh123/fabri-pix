import { createContext, useContext } from 'react';

export type Theme = 'light' | 'dark';

/** the theme of the site, demo editors follow it */
export const SiteThemeContext = createContext<Theme>('light');

export const useSiteTheme = () => useContext(SiteThemeContext);
