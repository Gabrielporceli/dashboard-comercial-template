import React, { createContext, useContext, useState, useEffect } from 'react';

interface MotionContextType {
  animationsEnabled: boolean;
  toggleAnimations: () => void;
}

const MotionContext = createContext<MotionContextType | undefined>(undefined);

export const MotionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [animationsEnabled, setAnimationsEnabled] = useState(() => {
    const saved = localStorage.getItem('animations-enabled');
    return saved !== null ? saved === 'true' : true;
  });

  const toggleAnimations = () => {
    setAnimationsEnabled((prev) => {
      const newValue = !prev;
      localStorage.setItem('animations-enabled', String(newValue));
      return newValue;
    });
  };

  return (
    <MotionContext.Provider value={{ animationsEnabled, toggleAnimations }}>
      {children}
    </MotionContext.Provider>
  );
};

export const useMotion = () => {
  const context = useContext(MotionContext);
  if (context === undefined) {
    throw new Error('useMotion must be used within a MotionProvider');
  }
  return context;
};
