import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function ThemeApplier() {
  const { theme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    const isAuthRoute = location.pathname === '/login' || location.pathname === '/signup';
    
    if (isAuthRoute) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme, location.pathname]);

  return null;
}
