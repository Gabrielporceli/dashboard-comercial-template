import { useEffect } from "react";

export const useTheme = () => {
  useEffect(() => {
    // Detecta o tema do sistema
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const applyTheme = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    // Aplica o tema inicial
    applyTheme(mediaQuery);

    // Escuta mudanças no tema do sistema
    mediaQuery.addEventListener("change", applyTheme);

    return () => {
      mediaQuery.removeEventListener("change", applyTheme);
    };
  }, []);
};
