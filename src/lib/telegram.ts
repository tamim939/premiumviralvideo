export const getTelegramUser = () => {
  if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
    const webApp = (window as any).Telegram.WebApp;
    return webApp.initDataUnsafe?.user || null;
  }
  return null;
};

export const expandTelegramWebApp = () => {
  if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
    (window as any).Telegram.WebApp.expand();
  }
};

export const closeTelegramWebApp = () => {
  if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
    (window as any).Telegram.WebApp.close();
  }
};

export const hapticFeedback = () => {
  if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
    (window as any).Telegram.WebApp.HapticFeedback.impactOccurred('medium');
  }
};
