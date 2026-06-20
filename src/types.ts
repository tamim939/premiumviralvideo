export interface DownloadLink {
  label: string;
  url: string;
}

export interface AdLink {
  url: string;
  duration: number; // Duration in hours
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  customId?: string;
  isPremium: boolean;
  isUpcoming?: boolean;
  views?: number;
  uploadTime?: string;
  channelName?: string;
  channelLogo?: string;
  adLink: string;
  adLinks?: AdLink[]; // Array of rotating ad links with durations
  timer?: number; // Ad watch timer in seconds
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

export interface AdSettings {
  adDuration: number;
  rewardInterval: number; // in hours
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
