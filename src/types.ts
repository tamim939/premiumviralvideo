export interface DownloadLink {
  label: string;
  url: string;
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  isPremium: boolean;
  adLink: string;
  adLinks?: string[]; // Array of rotating ad links
  timer?: number; // Optional ad timer in seconds
  downloadLinks: DownloadLink[];
  createdAt: any;
}

export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  link: string;
  createdAt: any;
}

export interface UserProfile {
  id: string; // telegramId
  username?: string;
  firstName: string;
  photoUrl?: string;
  isSubscribed: boolean;
  subscriptionExpiresAt?: any;
  role: 'user' | 'admin';
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: any;
    };
  }
}

export type Category = string;

export const DEFAULT_CATEGORIES: Category[] = ['All', 'Movie', 'CID', 'Bachelor Point', 'Series', 'Others'];
