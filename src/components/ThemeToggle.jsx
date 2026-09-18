import { useTheme } from "../context/ThemeContext";
import { MoonIcon, SunIcon } from "./icons";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-2 hover:text-ink ${className}`}
    >
      <SunIcon className={`absolute h-[18px] w-[18px] transition-all duration-300 ${isDark ? "scale-0 opacity-0 rotate-45" : "scale-100 opacity-100 rotate-0"}`} />
      <MoonIcon className={`absolute h-[18px] w-[18px] transition-all duration-300 ${isDark ? "scale-100 opacity-100 rotate-0" : "scale-0 opacity-0 -rotate-45"}`} />
    </button>
  );
}
