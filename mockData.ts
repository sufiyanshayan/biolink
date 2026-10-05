/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile, LinkItem, SocialItem, ClickAnalytic } from './types';

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 11);

// Static image references from our generated high-fidelity assets
export const BRAND_LOGO_URL = '/src/assets/images/brand_logo_1790689768780.jpg';
export const MALE_AVATAR_URL = '/src/assets/images/avatar_male_1790689795605.jpg';
export const FEMALE_AVATAR_URL = '/src/assets/images/avatar_female_1790689813262.jpg';

// Initial Users
export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-admin',
    username: 'admin',
    email: 'admin@bongolink.com',
    role: 'admin',
    password: 'adminpassword',
    name: 'BongoLink Master',
    bio: 'Platform administration console.',
    avatar: BRAND_LOGO_URL,
    theme: 'dark',
    customBg: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    customText: '#f8fafc',
    customBtnBg: '#e2e8f0',
    customBtnRadius: 'md',
    maintenanceMode: false,
    enabled: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
  },
  {
    id: 'user-ratul',
    username: 'ratul',
    email: 'ratulmridha190@gmail.com',
    role: 'customer',
    password: 'password123',
    name: 'Ratul Mridha',
    bio: 'Digital Craftsman & Full-Stack Engineer. Passionate about beautiful, high-fidelity interfaces and AI technologies. Building web solutions for the modern world.',
    avatar: MALE_AVATAR_URL,
    theme: 'custom',
    customBg: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', // Indigo night
    customText: '#ffffff',
    customBtnBg: '#ec4899', // Pink
    customBtnRadius: 'full',
    maintenanceMode: false,
    enabled: true,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() // 15 days ago
  },
  {
    id: 'user-anika',
    username: 'anika',
    email: 'anika@bongolink.com',
    role: 'customer',
    password: 'password123',
    name: 'Anika Rahman',
    bio: 'Travel Photographer & Video Content Creator. Documenting stories from Bengal to the Himalayas. Join my adventure!',
    avatar: FEMALE_AVATAR_URL,
    theme: 'light',
    customBg: '#fafaf9', // warm white
    customText: '#1c1917', // warm black
    customBtnBg: '#f97316', // Orange
    customBtnRadius: 'md',
    maintenanceMode: false,
    enabled: false, // Disabled by default for Testing Blocked Accounts
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days ago
  }
];

// Initial Links
export const INITIAL_LINKS: LinkItem[] = [
  // Ratul's Links
  {
    id: 'link-ratul-portfolio',
    userId: 'user-ratul',
    title: '🌐 Main Portfolio & Work',
    url: 'https://bongocrafts.com',
    icon: 'Globe',
    visible: true,
    scheduleStart: '',
    scheduleEnd: '',
    order: 0
  },
  {
    id: 'link-ratul-github',
    userId: 'user-ratul',
    title: '🐙 Explore my Open Source Code',
    url: 'https://github.com/ratul-mridha',
    icon: 'Github',
    visible: true,
    scheduleStart: '',
    scheduleEnd: '',
    order: 1
  },
  {
    id: 'link-ratul-yt',
    userId: 'user-ratul',
    title: '🎥 Tech Tutorials & Devlogs',
    url: 'https://youtube.com/c/bongodevs',
    icon: 'Youtube',
    visible: true,
    scheduleStart: '',
    scheduleEnd: '',
    order: 2
  },
  {
    id: 'link-ratul-scheduled',
    userId: 'user-ratul',
    title: '⏳ [Limited Time] Exclusive E-Book',
    url: 'https://bongocrafts.com/ebook',
    icon: 'BookOpen',
    visible: true,
    scheduleStart: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // started 2 days ago
    scheduleEnd: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // ends in 5 days
    order: 3
  },

  // Anika's Links
  {
    id: 'link-anika-yt',
    userId: 'user-anika',
    title: '✈️ Travel Vlogs & River Diaries',
    url: 'https://youtube.com/anika-travels',
    icon: 'Youtube',
    visible: true,
    scheduleStart: '',
    scheduleEnd: '',
    order: 0
  },
  {
    id: 'link-anika-insta',
    userId: 'user-anika',
    title: '📸 Daily Photography & Behind-the-Scenes',
    url: 'https://instagram.com/anika.snaps',
    icon: 'Instagram',
    visible: true,
    scheduleStart: '',
    scheduleEnd: '',
    order: 1
  }
];

// Initial Socials
export const INITIAL_SOCIALS: SocialItem[] = [
  // Ratul's Socials
  {
    id: 'social-ratul-fb',
    userId: 'user-ratul',
    platform: 'facebook',
    url: 'https://facebook.com/ratul.mridha',
    visible: true,
    order: 0
  },
  {
    id: 'social-ratul-linkedin',
    userId: 'user-ratul',
    platform: 'linkedin',
    url: 'https://linkedin.com/in/ratul-mridha',
    visible: true,
    order: 1
  },
  {
    id: 'social-ratul-github',
    userId: 'user-ratul',
    platform: 'github',
    url: 'https://github.com/ratul-mridha',
    visible: true,
    order: 2
  },

  // Anika's Socials
  {
    id: 'social-anika-insta',
    userId: 'user-anika',
    platform: 'instagram',
    url: 'https://instagram.com/anika.snaps',
    visible: true,
    order: 0
  },
  {
    id: 'social-anika-tiktok',
    userId: 'user-anika',
    platform: 'tiktok',
    url: 'https://tiktok.com/@anika.snaps',
    visible: true,
    order: 1
  }
];

// Generating 7 Days of Rich Mock Analytics
const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge'];
const devices = ['Mobile', 'Desktop', 'Tablet'];
const countries = ['Bangladesh', 'United States', 'United Kingdom', 'Canada', 'Germany'];

const generateMockAnalytics = (): ClickAnalytic[] => {
  const analytics: ClickAnalytic[] = [];
  const linkIds = ['link-ratul-portfolio', 'link-ratul-github', 'link-ratul-yt', 'link-ratul-scheduled'];
  const socials = ['social_facebook', 'social_linkedin', 'social_github'];

  // Loop over last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Daily views and clicks count
    const viewsCount = 45 + Math.floor(Math.random() * 30); // 45 to 75 views per day
    const clicksCount = 20 + Math.floor(Math.random() * 25); // 20 to 45 clicks per day

    // Views
    for (let v = 0; v < viewsCount; v++) {
      const viewHour = Math.floor(Math.random() * 24);
      const viewTime = new Date(date);
      viewTime.setHours(viewHour, Math.floor(Math.random() * 60));

      analytics.push({
        id: `view-${i}-${v}`,
        userId: 'user-ratul',
        targetId: 'profile_view',
        timestamp: viewTime.toISOString(),
        browser: browsers[Math.floor(Math.random() * browsers.length)],
        device: devices[Math.random() > 0.45 ? 0 : Math.random() > 0.3 ? 1 : 2], // bias mobile
        country: countries[Math.floor(Math.random() * countries.length)]
      });
    }

    // Clicks
    for (let c = 0; c < clicksCount; c++) {
      const clickHour = Math.floor(Math.random() * 24);
      const clickTime = new Date(date);
      clickTime.setHours(clickHour, Math.floor(Math.random() * 60));
      
      const isSocial = Math.random() > 0.8;
      const targetId = isSocial 
        ? socials[Math.floor(Math.random() * socials.length)]
        : linkIds[Math.floor(Math.random() * linkIds.length)];

      analytics.push({
        id: `click-${i}-${c}`,
        userId: 'user-ratul',
        targetId,
        timestamp: clickTime.toISOString(),
        browser: browsers[Math.floor(Math.random() * browsers.length)],
        device: devices[Math.random() > 0.4 ? 0 : Math.random() > 0.3 ? 1 : 2],
        country: countries[Math.floor(Math.random() * countries.length)]
      });
    }
  }

  // Also generate some smaller analytics for Anika
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const viewsCount = 12 + Math.floor(Math.random() * 10);
    for (let v = 0; v < viewsCount; v++) {
      const viewTime = new Date(date);
      analytics.push({
        id: `view-anika-${i}-${v}`,
        userId: 'user-anika',
        targetId: 'profile_view',
        timestamp: viewTime.toISOString(),
        browser: 'Safari',
        device: 'Mobile',
        country: 'Bangladesh'
      });
    }
  }

  return analytics;
};

export const INITIAL_ANALYTICS: ClickAnalytic[] = generateMockAnalytics();

// Database Access Layer helper methods using localStorage
export const getDB = () => {
  if (typeof window === 'undefined') {
    return {
      users: INITIAL_USERS,
      links: INITIAL_LINKS,
      socials: INITIAL_SOCIALS,
      analytics: INITIAL_ANALYTICS
    };
  }

  const users = localStorage.getItem('bongolink_users');
  const links = localStorage.getItem('bongolink_links');
  const socials = localStorage.getItem('bongolink_socials');
  const analytics = localStorage.getItem('bongolink_analytics');

  if (!users) {
    // Seed database
    localStorage.setItem('bongolink_users', JSON.stringify(INITIAL_USERS));
    localStorage.setItem('bongolink_links', JSON.stringify(INITIAL_LINKS));
    localStorage.setItem('bongolink_socials', JSON.stringify(INITIAL_SOCIALS));
    localStorage.setItem('bongolink_analytics', JSON.stringify(INITIAL_ANALYTICS));
    return {
      users: INITIAL_USERS,
      links: INITIAL_LINKS,
      socials: INITIAL_SOCIALS,
      analytics: INITIAL_ANALYTICS
    };
  }

  return {
    users: JSON.parse(users),
    links: JSON.parse(links || '[]'),
    socials: JSON.parse(socials || '[]'),
    analytics: JSON.parse(analytics || '[]')
  };
};

export const saveDB = (data: {
  users: UserProfile[];
  links: LinkItem[];
  socials: SocialItem[];
  analytics: ClickAnalytic[];
}) => {
  localStorage.setItem('bongolink_users', JSON.stringify(data.users));
  localStorage.setItem('bongolink_links', JSON.stringify(data.links));
  localStorage.setItem('bongolink_socials', JSON.stringify(data.socials));
  localStorage.setItem('bongolink_analytics', JSON.stringify(data.analytics));
};
