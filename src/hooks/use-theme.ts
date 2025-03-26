import { useTheme as useThemeContext } from "../providers/theme-provider";

// Re-export the hook for easier usage across the application
const useTheme = useThemeContext;

export default useTheme;
