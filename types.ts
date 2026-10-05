/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'customer';

export interface UserProfile {
  id: string;
  username: string; // unique, e.g. "ratul"
  email: string;
  role: UserRole;
  password?: string;
  name: string;
  bio: string;
  avatar: string; // image path or data URL
  theme: 'light' | 'dark' | 'custom';
  customBg: string; // hex, gradient, or preset name
  customText: string; // text color hex or preset
  customBtnBg: string; // button background color hex
  customBtnRadius: 'none' | 'md' | 'full'; // button border radius
  maintenanceMode: boolean;
  enabled: boolean;
  createdAt: string;
}

export interface LinkItem {
  id: string;
  userId: string;
  title: string;
  url: string;
  icon: string; // lucide icon name or emoji
  visible: boolean;
  scheduleStart: string; // empty string or ISO date string
  scheduleEnd: string; // empty string or ISO date string
  order: number;
}

export interface SocialItem {
  id: string;
  userId: string;
  platform: 'facebook' | 'instagram' | 'youtube' | 'linkedin' | 'github' | 'twitter' | 'tiktok' | 'email' | 'whatsapp' | 'telegram' | 'phone' | 'about' | 'website';
  url: string;
  visible: boolean;
  order: number;
  title?: string;
}

export interface ClickAnalytic {
  id: string;
  userId: string;
  targetId: string; // 'profile_view', 'social_[platform]', or linkId
  timestamp: string; // ISO date string
  browser: string;
  device: string;
  country: string;
}

export type Language = 'en' | 'bn';
