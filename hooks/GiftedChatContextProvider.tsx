'use client';

import React from 'react';

// Mocked context that gifted-chat expects
const I18nContext = React.createContext({
  getLocale: () => 'en',
  formatDate: (date: Date) => date.toLocaleDateString(),
  formatTime: (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
});

export function GiftedChatProvider({ children }: { children: React.ReactNode }) {
  return (
    <I18nContext.Provider
      value={{
        getLocale: () => 'en',
        formatDate: (date: Date) => date.toLocaleDateString(),
        formatTime: (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}
