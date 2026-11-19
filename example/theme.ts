import { createContext, useContext } from 'react';

export type Theme = 'light' | 'dark';

export const SiteThemeContext = createContext<Theme>('light');

export const useSiteTheme = () => useContext(SiteThemeContext);
