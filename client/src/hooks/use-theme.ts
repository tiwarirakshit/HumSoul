import { useTheme as useThemeContext } from '@/context/theme-context';

export function useTheme() {
  return useThemeContext();
}
