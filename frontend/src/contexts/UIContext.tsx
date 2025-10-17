import React, { createContext, useContext, useState } from 'react';

type UIContextType = {
  loading: boolean;
  setLoading: (v: boolean) => void;
  toast: string | null;
  showToast: (msg: string) => void;
  clearToast: () => void;
};

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <UIContext.Provider value={{ loading, setLoading, toast, showToast, clearToast: () => setToast(null) }}>
      {children}
    </UIContext.Provider>
  );
};

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used inside UIProvider');
  return ctx;
}
