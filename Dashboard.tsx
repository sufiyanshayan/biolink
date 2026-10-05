/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import PublicProfile from './PublicProfile';
import { UserProfile, LinkItem, SocialItem, ClickAnalytic } from '../types';
import { translations } from '../locales';
import { 
  BarChart2, Link, Palette, Eye, EyeOff, ArrowUp, ArrowDown, Plus, 
  Trash2, Copy, Check, Calendar, Globe, Smartphone, Monitor, 
  Tv, Compass, Sparkles, Sliders, AlertTriangle, AlertCircle, ToggleLeft, ToggleRight, CheckSquare, Square, Key, Menu, User, X, LogOut, RotateCw
} from 'lucide-react';

const PLATFORM_LOGOS: Record<string, string> = {
  facebook: 'https://cdn.simpleicons.org/facebook/000000',
  instagram: 'https://cdn.simpleicons.org/instagram/000000',
  whatsapp: 'https://cdn.simpleicons.org/whatsapp/000000',
  tiktok: 'https://cdn.simpleicons.org/tiktok/000000',
  telegram: 'https://cdn.simpleicons.org/telegram/000000',
  twitter: 'https://cdn.simpleicons.org/x/000000',
  phone: 'https://cdn-icons-png.flaticon.com/512/597/597177.png',
  about: 'https://cdn.simpleicons.org/aboutdotme/000000',
  website: 'https://cdn-icons-png.flaticon.com/512/1006/1006771.png'
};

interface DashboardProps {
  lang: 'en' | 'bn';
  currentUser: UserProfile;
  users: UserProfile[];
  links: LinkItem[];
  socials: SocialItem[];
  analytics: ClickAnalytic[];
  onUpdateProfile: (updatedProfile: UserProfile) => void;
  onUpdateLinks: (updatedLinks: LinkItem[]) => void;
  onUpdateSocials: (updatedSocials: SocialItem[]) => void;
  onDeleteAccount: (password: string) => { success: boolean; error?: string };
  onLogout: () => void;
  onSetLang: (lang: 'en' | 'bn') => void;
}

export default function Dashboard({
  lang,
  currentUser,
  users,
  links,
  socials,
  analytics,
  onUpdateProfile,
  onUpdateLinks,
  onUpdateSocials,
  onDeleteAccount,
  onLogout,
  onSetLang
}: DashboardProps) {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'home' | 'links' | 'socials' | 'appearance' | 'security'>('home');
  const [copied, setCopied] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Link Form State
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newIcon, setNewIcon] = useState('Globe');
  const [newScheduleStart, setNewScheduleStart] = useState('');
  const [newScheduleEnd, setNewScheduleEnd] = useState('');
  const [linkError, setLinkError] = useState('');

  // Editing Link State
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editIcon, setEditIcon] = useState('');
  const [editScheduleStart, setEditScheduleStart] = useState('');
  const [editScheduleEnd, setEditScheduleEnd] = useState('');

  // Master list of Country Codes
  const COUNTRIES = [
    { name: 'Bangladesh', code: '880', flag: '🇧🇩' },
    { name: 'India', code: '91', flag: '🇮🇳' },
    { name: 'United States', code: '1', flag: '🇺🇸' },
    { name: 'United Kingdom', code: '44', flag: '🇬🇧' },
    { name: 'Canada', code: '1', flag: '🇨🇦' },
    { name: 'Australia', code: '61', flag: '🇦🇺' },
    { name: 'Saudi Arabia', code: '966', flag: '🇸🇦' },
    { name: 'United Arab Emirates', code: '971', flag: '🇦🇪' },
    { name: 'Pakistan', code: '92', flag: '🇵🇰' },
    { name: 'Nepal', code: '977', flag: '🇳🇵' },
    { name: 'Malaysia', code: '60', flag: '🇲🇾' },
    { name: 'Singapore', code: '65', flag: '🇸🇬' },
    { name: 'Qatar', code: '974', flag: '🇶🇦' },
    { name: 'Kuwait', code: '965', flag: '🇰🇼' },
    { name: 'Oman', code: '968', flag: '🇴🇲' },
    { name: 'Bahrain', code: '973', flag: '🇧🇭' },
    { name: 'Germany', code: '49', flag: '🇩🇪' },
    { name: 'France', code: '33', flag: '🇫🇷' },
    { name: 'Italy', code: '39', flag: '🇮🇹' },
    { name: 'Spain', code: '34', flag: '🇪🇸' },
    { name: 'Japan', code: '81', flag: '🇯🇵' },
    { name: 'South Korea', code: '82', flag: '🇰🇷' },
    { name: 'Turkey', code: '90', flag: '🇹🇷' },
    { name: 'Brazil', code: '55', flag: '🇧🇷' }
  ];

  interface LocalSocialItem {
    id: string;
    platform: 'facebook' | 'instagram' | 'whatsapp' | 'tiktok' | 'telegram' | 'twitter' | 'phone' | 'about' | 'website';
    title: string;
    username: string;
    countryCode?: string;
    whatsappType?: 'phone' | 'username';
  }

  // Unified list of social items (guarantees at least one field per platform - Request 2)
  const [localSocials, setLocalSocials] = useState<LocalSocialItem[]>(() => {
    const userSocs = socials.filter(s => s.userId === currentUser.id);
    const standardPlatforms = ['facebook', 'instagram', 'whatsapp', 'tiktok', 'telegram', 'twitter', 'phone', 'about', 'website'] as const;
    
    const mapped = userSocs.map(s => {
      let username = s.url;
      let waType: 'phone' | 'username' = 'phone';
      
      if (s.platform === 'facebook') {
        username = s.url.replace(/^https?:\/\/(www\.)?facebook\.com\//i, '');
      } else if (s.platform === 'instagram') {
        username = s.url.replace(/^https?:\/\/(www\.)?instagram\.com\//i, '');
      } else if (s.platform === 'tiktok') {
        username = s.url.replace(/^https?:\/\/(www\.)?tiktok\.com\/@/i, '');
      } else if (s.platform === 'telegram') {
        username = s.url.replace(/^https?:\/\/(www\.)?t\.me\//i, '');
      } else if (s.platform === 'twitter') {
        username = s.url.replace(/^https?:\/\/(www\.)?(x|twitter)\.com\//i, '');
      } else if (s.platform === 'website') {
        username = s.url;
      } else if (s.platform === 'whatsapp') {
        if (s.url.includes('@')) {
          waType = 'username';
          username = s.url.replace(/^https?:\/\/wa\.me\/@/i, '');
        } else {
          waType = 'phone';
          username = s.url.replace(/^https?:\/\/wa\.me\//i, '');
        }
      } else if (s.platform === 'phone') {
        username = s.url.replace(/^tel:(\+)?/i, '');
      } else if (s.platform === 'about') {
        username = s.url;
      }
      
      return {
        id: s.id,
        platform: s.platform as any,
        title: s.title || s.platform.charAt(0).toUpperCase() + s.platform.slice(1),
        username,
        countryCode: '880',
        whatsappType: waType
      };
    });

    // Ensure there's always at least one input field for every platform (Request 2)
    const resultList = [...mapped];
    standardPlatforms.forEach((platform) => {
      const hasEntry = resultList.some(r => r.platform === platform);
      if (!hasEntry) {
        resultList.push({
          id: `fs-seed-${platform}-${Math.random().toString(36).substring(2, 7)}`,
          platform,
          title: platform === 'phone' ? 'Call Me' : platform === 'about' ? 'About Me' : platform === 'twitter' ? 'Twitter (X)' : platform.charAt(0).toUpperCase() + platform.slice(1),
          username: '',
          countryCode: '880',
          whatsappType: 'phone'
        });
      }
    });

    // Sort according to standard platform sequence
    return resultList.sort((a, b) => {
      return standardPlatforms.indexOf(a.platform) - standardPlatforms.indexOf(b.platform);
    });
  });

  const [activeCCDropdownId, setActiveCCDropdownId] = useState<string | null>(null);
  const [countrySearch, setCountrySearch] = useState('');
  const [socialSuccess, setSocialSuccess] = useState('');

  // Account Deletion states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Local Password Change state
  const [dashOldPassword, setDashOldPassword] = useState('');
  const [dashNewPassword, setDashNewPassword] = useState('');
  const [dashConfirmNewPassword, setDashConfirmNewPassword] = useState('');
  const [dashPassError, setDashPassError] = useState('');
  const [dashPassSuccess, setDashPassSuccess] = useState('');
  const [showDashOldPassword, setShowDashOldPassword] = useState(false);
  const [showDashNewPassword, setShowDashNewPassword] = useState(false);
  const [showDashConfirmPassword, setShowDashConfirmPassword] = useState(false);
  const [socialError, setSocialError] = useState('');

  // Local Email Change state with OTP simulation (Request)
  const [newEmail, setNewEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [emailChangeError, setEmailChangeError] = useState('');
  const [emailChangeSuccess, setEmailChangeSuccess] = useState('');

  // Username State (Request 6)
  const [tempUsername, setTempUsername] = useState(currentUser.username);
  const [usernameSuccess, setUsernameSuccess] = useState('');
  const [usernameError, setUsernameError] = useState('');

  // Name State (Request 4)
  const [tempName, setTempName] = useState(currentUser.name);
  const [nameSuccess, setNameSuccess] = useState('');
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    setTempName(currentUser.name);
  }, [currentUser.name]);

  // Image Cropper States (Request 8)
  const [croppingImageSrc, setCroppingImageSrc] = useState<string | null>(null);
  const [croppingType, setCroppingType] = useState<'avatar' | 'theme_bg' | null>(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);

  // Image Crop Drag States (Request 3)
  const [isCropDragging, setIsCropDragging] = useState(false);
  const [cropDragStart, setCropDragStart] = useState({ x: 0, y: 0 });
  const [cropRotation, setCropRotation] = useState(0); // 0, 90, 180, 270

  // Resizable Crop Box State Variables (Vanilla JS Port)
  const [rect, setRect] = useState({ x: 10, y: 10, w: 80, h: 80 });
  const [isDraggingRect, setIsDraggingRect] = useState(false);
  const [isResizingRect, setIsResizingRect] = useState(false);
  const [resizeDir, setResizeDir] = useState<string | null>(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartY, setDragStartY] = useState(0);
  const [rectStart, setRectStart] = useState({ x: 10, y: 10, w: 80, h: 80 });

  // Theme Save Status (Request 10)
  const [themeSuccessAlert, setThemeSuccessAlert] = useState('');

  useEffect(() => {
    setTempUsername(currentUser.username);
  }, [currentUser.username]);

  // Custom Avatar upload Simulation State
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [avatarUploadAlert, setAvatarUploadAlert] = useState('');

  // Biography / Description edit state (Request)
  const [tempBio, setTempBio] = useState(currentUser.bio);
  const [bioSuccess, setBioSuccess] = useState(false);

  useEffect(() => {
    setTempBio(currentUser.bio);
  }, [currentUser.bio]);

  // Custom Theme Customizer State
  const [customBg, setCustomBg] = useState(currentUser.customBg);
  const [customText, setCustomText] = useState(currentUser.customText);
  const [customBtnBg, setCustomBtnBg] = useState(currentUser.customBtnBg);
  const [customBtnRadius, setCustomBtnRadius] = useState<'none' | 'md' | 'full'>(currentUser.customBtnRadius);

  // User list of specific links and socials
  const userLinks = links.filter(l => l.userId === currentUser.id).sort((a, b) => a.order - b.order);
  const userSocials = socials.filter(s => s.userId === currentUser.id).sort((a, b) => a.order - b.order);
  const userAnalytics = analytics.filter(a => a.userId === currentUser.id);

  // Analytics Math
  const totalViews = userAnalytics.filter(a => a.targetId === 'profile_view').length;
  const totalClicks = userAnalytics.filter(a => a.targetId !== 'profile_view').length;
  const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0';

  // Browser, device and geographic analytics processor
  const processStat = (key: 'browser' | 'device' | 'country') => {
    const counts: { [key: string]: number } = {};
    userAnalytics.forEach(item => {
      const val = item[key];
      if (val) {
        counts[val] = (counts[val] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  };

  const browserStats = processStat('browser');
  const deviceStats = processStat('device');
  const countryStats = processStat('country');

  // Copy Profile URL link helper
  const handleCopyLink = () => {
    const profileUrl = `${window.location.origin}/${currentUser.username}`;
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Profile URL helper
  const getProfileUrl = () => `${window.location.origin}/${currentUser.username}`;

  // Link Editor functions
  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    setLinkError('');

    if (!newTitle || !newUrl) {
      setLinkError(t.requiredFields);
      return;
    }

    // URL format validator
    try {
      new URL(newUrl);
    } catch {
      setLinkError(lang === 'en' ? "Please enter a valid URL (including https://)" : "অনুগ্রহ করে সঠিক লিঙ্ক দিন (https:// সহ)");
      return;
    }

    const newLinkItem: LinkItem = {
      id: `link-${Math.random().toString(36).substring(2, 11)}`,
      userId: currentUser.id,
      title: newTitle,
      url: newUrl,
      icon: newIcon,
      visible: true,
      scheduleStart: newScheduleStart,
      scheduleEnd: newScheduleEnd,
      order: links.length
    };

    onUpdateLinks([...links, newLinkItem]);
    setNewTitle('');
    setNewUrl('');
    setNewScheduleStart('');
    setNewScheduleEnd('');
  };

  const handleToggleLinkVisibility = (id: string) => {
    const updated = links.map(l => {
      if (l.id === id) {
        return { ...l, visible: !l.visible };
      }
      return l;
    });
    onUpdateLinks(updated);
  };

  const handleDeleteLink = (id: string) => {
    const updated = links.filter(l => l.id !== id);
    onUpdateLinks(updated);
  };

  const handleDuplicateLink = (link: LinkItem) => {
    const duplicated: LinkItem = {
      ...link,
      id: `link-${Math.random().toString(36).substring(2, 11)}`,
      title: `${link.title} (Copy)`,
      order: links.length
    };
    onUpdateLinks([...links, duplicated]);
  };

  const startEditLink = (link: LinkItem) => {
    setEditingLinkId(link.id);
    setEditTitle(link.title);
    setEditUrl(link.url);
    setEditIcon(link.icon);
    setEditScheduleStart(link.scheduleStart ? link.scheduleStart.substring(0, 16) : '');
    setEditScheduleEnd(link.scheduleEnd ? link.scheduleEnd.substring(0, 16) : '');
  };

  const saveEditLink = (id: string) => {
    const updated = links.map(l => {
      if (l.id === id) {
        return {
          ...l,
          title: editTitle,
          url: editUrl,
          icon: editIcon,
          scheduleStart: editScheduleStart ? new Date(editScheduleStart).toISOString() : '',
          scheduleEnd: editScheduleEnd ? new Date(editScheduleEnd).toISOString() : ''
        };
      }
      return l;
    });
    onUpdateLinks(updated);
    setEditingLinkId(null);
  };

  // Reorder Links
  const moveLink = (index: number, direction: 'up' | 'down') => {
    const updatedUserLinks = [...userLinks];
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === updatedUserLinks.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = updatedUserLinks[index];
    updatedUserLinks[index] = updatedUserLinks[targetIndex];
    updatedUserLinks[targetIndex] = temp;

    // Reset exact ordering index numbers
    const finalUserLinks = updatedUserLinks.map((link, idx) => ({ ...link, order: idx }));
    
    // Merge back into global links
    const otherUsersLinks = links.filter(l => l.userId !== currentUser.id);
    onUpdateLinks([...otherUsersLinks, ...finalUserLinks]);
  };

  const handleAddDuplicateSocialField = (platform: any) => {
    const newField: LocalSocialItem = {
      id: `fs-dup-${Math.random().toString(36).substring(2, 11)}`,
      platform,
      title: platform === 'phone' ? 'Call Me' : platform === 'about' ? 'About Me' : platform.charAt(0).toUpperCase() + platform.slice(1),
      username: '',
      countryCode: (platform === 'whatsapp' || platform === 'phone') ? '880' : undefined,
      whatsappType: platform === 'whatsapp' ? 'phone' : undefined
    };
    setLocalSocials([...localSocials, newField]);
  };

  const handleRemoveSocialField = (id: string) => {
    setLocalSocials(localSocials.filter(s => s.id !== id));
  };

  const handleUpdateSocialField = (id: string, updates: Partial<LocalSocialItem>) => {
    setLocalSocials(localSocials.map(s => {
      if (s.id === id) {
        return { ...s, ...updates };
      }
      return s;
    }));
  };

  // Social handles save
  const handleSaveSocials = (e: React.FormEvent) => {
    e.preventDefault();
    setSocialSuccess('');
    setSocialError('');

    const updatedSocials: SocialItem[] = [];
    const PLATFORM_ORDER = ['facebook', 'instagram', 'whatsapp', 'tiktok', 'telegram', 'twitter', 'phone', 'about', 'website'];
    
    // Sort localSocials so they are saved and displayed in the exact order requested
    const sortedLocal = [...localSocials].sort((a, b) => {
      const idxA = PLATFORM_ORDER.indexOf(a.platform);
      const idxB = PLATFORM_ORDER.indexOf(b.platform);
      return idxA - idxB;
    });

    let validationError = '';
    sortedLocal.forEach((item) => {
      if (item.username.trim()) {
        if (item.platform === 'phone' || (item.platform === 'whatsapp' && item.whatsappType === 'phone')) {
          const cleanPhone = item.username.trim().replace(/[\s\-\+]/g, '');
          if (!cleanPhone || !/^\d+$/.test(cleanPhone)) {
            validationError = lang === 'en'
              ? `Please enter a valid phone number with country code for ${item.title}`
              : `${item.title}-এর জন্য কান্ট্রি কোডসহ সঠিক নাম্বার লিখুন।`;
          }
        }
      }
    });

    if (validationError) {
      setSocialError(validationError);
      return;
    }

    sortedLocal.forEach((item, idx) => {
      if (item.username.trim()) {
        let finalUrl = item.username.trim();
        
        if (item.platform === 'facebook') {
          finalUrl = `https://facebook.com/${item.username.trim().replace(/^@/, '')}`;
        } else if (item.platform === 'instagram') {
          finalUrl = `https://instagram.com/${item.username.trim().replace(/^@/, '')}`;
        } else if (item.platform === 'tiktok') {
          finalUrl = `https://tiktok.com/@${item.username.trim().replace(/^@/, '')}`;
        } else if (item.platform === 'telegram') {
          finalUrl = `https://t.me/${item.username.trim().replace(/^@/, '')}`;
        } else if (item.platform === 'twitter') {
          finalUrl = `https://x.com/${item.username.trim().replace(/^@/, '')}`;
        } else if (item.platform === 'whatsapp') {
          if (item.whatsappType === 'username') {
            finalUrl = `https://wa.me/@${item.username.trim().replace(/^@/, '')}`;
          } else {
            const cleanPhone = item.username.trim().replace(/[\s\-\+]/g, '');
            finalUrl = `https://wa.me/${cleanPhone}`;
          }
        } else if (item.platform === 'phone') {
          const cleanPhone = item.username.trim().replace(/[\s\-\+]/g, '');
          finalUrl = `tel:+${cleanPhone}`;
        } else if (item.platform === 'website') {
          let url = item.username.trim();
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
          }
          finalUrl = url;
        } else if (item.platform === 'about') {
          finalUrl = item.username.trim();
        }

        updatedSocials.push({
          id: item.id.startsWith('fs-') && item.id.includes('dup') ? `social-${currentUser.id}-${Math.random().toString(36).substring(2, 11)}` : item.id,
          userId: currentUser.id,
          platform: item.platform,
          url: finalUrl,
          visible: true,
          order: idx,
          title: item.title
        });
      }
    });

    onUpdateSocials(updatedSocials);
    setSocialSuccess(lang === 'en' ? "Social profiles successfully updated!" : "সোশ্যাল মিডিয়া প্রোফাইল সফলভাবে আপডেট করা হয়েছে!");
    setTimeout(() => setSocialSuccess(''), 2000);
  };

  // Reset all social handles (Request)
  const handleResetSocials = () => {
    const cleared = localSocials.map(s => ({
      ...s,
      username: ''
    }));
    setLocalSocials(cleared);
    onUpdateSocials([]);
    setSocialSuccess(lang === 'en' ? "All social handles have been reset!" : "সকল সোশ্যাল মিডিয়া লিঙ্ক রিসেট করা হয়েছে!");
    setTimeout(() => setSocialSuccess(''), 2500);
  };

  // Custom profile / theme updater
  const handleUpdateTheme = (themeName: 'light' | 'dark' | 'custom') => {
    const updated = { ...currentUser, theme: themeName };
    if (themeName === 'light') {
      updated.customBg = '#ffffff';
      updated.customText = '#1e293b';
      updated.customBtnBg = '#3b82f6';
      updated.customBtnRadius = 'md';
    } else if (themeName === 'dark') {
      updated.customBg = '#0f172a';
      updated.customText = '#f8fafc';
      updated.customBtnBg = '#334155';
      updated.customBtnRadius = 'full';
    } else {
      updated.customBg = customBg;
      updated.customText = customText;
      updated.customBtnBg = customBtnBg;
      updated.customBtnRadius = customBtnRadius;
    }
    onUpdateProfile(updated);
  };

  const handleSaveThemeSettingsGlobal = () => {
    // If custom theme, save custom colors to profile as well
    onUpdateProfile({
      ...currentUser,
      customBg: currentUser.theme === 'custom' ? customBg : currentUser.customBg,
      customText: currentUser.theme === 'custom' ? customText : currentUser.customText,
      customBtnBg: currentUser.theme === 'custom' ? customBtnBg : currentUser.customBtnBg,
      customBtnRadius: currentUser.theme === 'custom' ? customBtnRadius : currentUser.customBtnRadius
    });
    setThemeSuccessAlert(lang === 'en' ? "Theme settings saved successfully!" : "থিম সেটিংস সফলভাবে সংরক্ষিত হয়েছে!");
    setTimeout(() => setThemeSuccessAlert(''), 3000);
  };

  const handleResetTheme = () => {
    // Reset custom inputs to defaults
    setCustomBg('#ffffff');
    setCustomText('#1e293b');
    setCustomBtnBg('#3b82f6');
    setCustomBtnRadius('md');

    // Also update profile custom style fields to defaults immediately
    onUpdateProfile({
      ...currentUser,
      theme: 'custom',
      customBg: '#ffffff',
      customText: '#1e293b',
      customBtnBg: '#3b82f6',
      customBtnRadius: 'md'
    });

    setThemeSuccessAlert(lang === 'en' ? "Custom theme has been reset to defaults!" : "কাস্টম থিম সফলভাবে রিসেট করা হয়েছে!");
    setTimeout(() => setThemeSuccessAlert(''), 3000);
  };

  // Maintenance mode toggle setting
  const [copiedProfileText, setCopiedProfileText] = useState(false);
  const handleToggleMaintenance = () => {
    onUpdateProfile({
      ...currentUser,
      maintenanceMode: !currentUser.maintenanceMode
    });
  };

  // Local password change handler
  const handleDashChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setDashPassError('');
    setDashPassSuccess('');

    if (!dashOldPassword || !dashNewPassword || !dashConfirmNewPassword) {
      setDashPassError(t.requiredFields);
      return;
    }

    if (dashOldPassword !== currentUser.password) {
      setDashPassError(lang === 'en' ? "Incorrect current password." : "বর্তমান পাসওয়ার্ডটি সঠিক নয়।");
      return;
    }

    if (dashNewPassword !== dashConfirmNewPassword) {
      setDashPassError(t.passwordMismatch);
      return;
    }

    onUpdateProfile({
      ...currentUser,
      password: dashNewPassword
    });

    setDashPassSuccess(t.passwordChanged);
    setDashOldPassword('');
    setDashNewPassword('');
    setDashConfirmNewPassword('');
    setTimeout(() => {
      setDashPassSuccess('');
    }, 3000);
  };

  // Simulated Custom Avatar Upload
  const handleSimulateAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarUploadAlert('');
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const dataUrl = uploadEvent.target?.result as string;
        // Launch crop engine instead of saving directly! (Request 8)
        setCroppingImageSrc(dataUrl);
        setCroppingType('avatar');
      };
      reader.readAsDataURL(file);
    }
  };

  // Direct URL Avatar Set helper
  const handleSetAvatarUrlDirect = () => {
    if (!customAvatarUrl) return;
    onUpdateProfile({
      ...currentUser,
      avatar: customAvatarUrl
    });
    setCustomAvatarUrl('');
    setAvatarUploadAlert(lang === 'en' ? "Avatar updated from external URL!" : "এক্সটার্নাল লিঙ্ক থেকে প্রোফাইল ছবি আপডেট হয়েছে!");
    setTimeout(() => setAvatarUploadAlert(''), 2000);
  };

  // Save Bio helper (Request)
  const handleSaveBio = () => {
    onUpdateProfile({
      ...currentUser,
      bio: tempBio
    });
    setBioSuccess(true);
    setTimeout(() => setBioSuccess(false), 3000);
  };

  // Send OTP helper for email change (Request)
  const handleSendEmailOtp = () => {
    setEmailChangeError('');
    setEmailChangeSuccess('');
    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setEmailChangeError(lang === 'en' ? "Please enter a valid email address." : "অনুগ্রহ করে একটি সঠিক ইমেইল আইডি লিখুন।");
      return;
    }
    if (newEmail !== confirmEmail) {
      setEmailChangeError(lang === 'en' ? "New email and confirm email do not match." : "নতুন ইমেইল এবং কনফার্ম ইমেইল মেলেনি।");
      return;
    }
    if (newEmail === currentUser.email) {
      setEmailChangeError(lang === 'en' ? "New email cannot be the same as your current email." : "নতুন ইমেইলটি বর্তমান ইমেইলের সমান হতে পারবে না।");
      return;
    }
    
    // Generate a secure, beautiful mock OTP code for high-fidelity security validation
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpSent(true);
    setEmailChangeSuccess(lang === 'en' ? `Verification code sent! [OTP: ${code}]` : `ভেরিফিকেশন কোড পাঠানো হয়েছে! [ওটিপি: ${code}]`);
  };

  // Verify and change email (Request)
  const handleVerifyAndChangeEmail = () => {
    setEmailChangeError('');
    setEmailChangeSuccess('');
    if (!emailOtp) {
      setEmailChangeError(lang === 'en' ? "Please enter the 6-digit OTP code." : "অনুগ্রহ করে ৬-সংখ্যার ওটিপি কোডটি লিখুন।");
      return;
    }
    if (emailOtp !== generatedOtp) {
      setEmailChangeError(lang === 'en' ? "Incorrect OTP verification code. Please try again." : "ভুল ওটিপি কোড। অনুগ্রহ করে আবার চেষ্টা করুন।");
      return;
    }

    // Success! Update email globally
    onUpdateProfile({
      ...currentUser,
      email: newEmail
    });
    setNewEmail('');
    setConfirmEmail('');
    setEmailOtp('');
    setGeneratedOtp('');
    setOtpSent(false);
    setEmailChangeSuccess(lang === 'en' ? "Email address changed successfully!" : "ইমেইল সফলভাবে পরিবর্তন করা হয়েছে!");
    setTimeout(() => setEmailChangeSuccess(''), 5000);
  };

  // Save custom username (Request 6)
  const handleSaveUsername = () => {
    setUsernameSuccess('');
    setUsernameError('');
    const clean = tempUsername.trim().toLowerCase();
    if (!clean) {
      setUsernameError(lang === 'en' ? "Username cannot be empty." : "ইউজারনেম খালি রাখা যাবে না।");
      return;
    }
    // Check if username is already taken by another user
    const exists = users.some(u => u.username === clean && u.id !== currentUser.id);
    if (exists) {
      setUsernameError(lang === 'en' ? "This username is already taken." : "এই ইউজারনেমটি ইতিমধ্যে অন্য কেউ ব্যবহার করছেন।");
      return;
    }

    onUpdateProfile({
      ...currentUser,
      username: clean
    });
    setUsernameSuccess(lang === 'en' ? "Username successfully updated!" : "ইউজারনেম সফলভাবে পরিবর্তন করা হয়েছে!");
    setTimeout(() => setUsernameSuccess(''), 3000);
  };

  // Save custom profile name (Request 4)
  const handleSaveName = () => {
    setNameSuccess('');
    setNameError('');
    const clean = tempName.trim();
    if (!clean) {
      setNameError(lang === 'en' ? "Name cannot be empty." : "নাম খালি রাখা যাবে না।");
      return;
    }

    onUpdateProfile({
      ...currentUser,
      name: clean
    });
    setNameSuccess(lang === 'en' ? "Name successfully updated!" : "নাম সফলভাবে পরিবর্তন করা হয়েছে!");
    setTimeout(() => setNameSuccess(''), 3000);
  };

  // Resizable & Draggable Crop Overlay Event Handlers (Vanilla JS Port - Request)
  const cropContainerRef = React.useRef<HTMLDivElement>(null);

  const handleContainerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const isHandle = target.classList.contains('resize-handle');
    const container = cropContainerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();

    if (isHandle) {
      setIsResizingRect(true);
      const dir = target.getAttribute('data-dir');
      setResizeDir(dir);
      setDragStartX(e.clientX);
      setDragStartY(e.clientY);
      setRectStart({ ...rect });
      e.preventDefault();
      return;
    }

    setIsDraggingRect(true);
    const rectLeftX = containerRect.left + (rect.x / 100) * containerRect.width;
    const rectTopY = containerRect.top + (rect.y / 100) * containerRect.height;
    setDragStartX(e.clientX - rectLeftX);
    setDragStartY(e.clientY - rectTopY);
    e.preventDefault();
  };

  const handleContainerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRect && !isResizingRect) return;
    const container = cropContainerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const percentX = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    const percentY = ((e.clientY - containerRect.top) / containerRect.height) * 100;

    if (isDraggingRect) {
      const newLeftPercent = ((e.clientX - dragStartX - containerRect.left) / containerRect.width) * 100;
      const newTopPercent = ((e.clientY - dragStartY - containerRect.top) / containerRect.height) * 100;

      setRect({
        x: Math.max(0, Math.min(100 - rect.w, newLeftPercent)),
        y: Math.max(0, Math.min(100 - rect.h, newTopPercent)),
        w: rect.w,
        h: rect.h
      });
    }

    if (isResizingRect && resizeDir) {
      const dxPercent = ((e.clientX - dragStartX) / containerRect.width) * 100;
      const dyPercent = ((e.clientY - dragStartY) / containerRect.height) * 100;

      let newX = rectStart.x;
      let newY = rectStart.y;
      let newW = rectStart.w;
      let newH = rectStart.h;

      const minSize = 8;

      if (resizeDir.includes('e')) {
        newW = Math.max(minSize, rectStart.w + dxPercent);
      }
      if (resizeDir.includes('w')) {
        newW = Math.max(minSize, rectStart.w - dxPercent);
        newX = rectStart.x + rectStart.w - newW;
      }
      if (resizeDir.includes('s')) {
        newH = Math.max(minSize, rectStart.h + dyPercent);
      }
      if (resizeDir.includes('n')) {
        newH = Math.max(minSize, rectStart.h - dyPercent);
        newY = rectStart.y + rectStart.h - newH;
      }

      if (newX + newW > 100) {
        newW = 100 - newX;
      }
      if (newY + newH > 100) {
        newH = 100 - newY;
      }

      setRect({
        x: Math.max(0, newX),
        y: Math.max(0, newY),
        w: Math.max(minSize, newW),
        h: Math.max(minSize, newH)
      });
    }
  };

  const handleContainerMouseUp = () => {
    setIsDraggingRect(false);
    setIsResizingRect(false);
    setResizeDir(null);
  };

  const handleContainerTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    
    const target = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement;
    const isHandle = target && target.classList.contains('resize-handle');
    const container = cropContainerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();

    if (isHandle) {
      setIsResizingRect(true);
      const dir = target.getAttribute('data-dir');
      setResizeDir(dir);
      setDragStartX(touch.clientX);
      setDragStartY(touch.clientY);
      setRectStart({ ...rect });
      return;
    }

    setIsDraggingRect(true);
    const rectLeftX = containerRect.left + (rect.x / 100) * containerRect.width;
    const rectTopY = containerRect.top + (rect.y / 100) * containerRect.height;
    setDragStartX(touch.clientX - rectLeftX);
    setDragStartY(touch.clientY - rectTopY);
  };

  const handleContainerTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDraggingRect && !isResizingRect) return;
    const touch = e.touches[0];
    if (!touch) return;

    const container = cropContainerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();

    if (isDraggingRect) {
      const newLeftPercent = ((touch.clientX - dragStartX - containerRect.left) / containerRect.width) * 100;
      const newTopPercent = ((touch.clientY - dragStartY - containerRect.top) / containerRect.height) * 100;

      setRect({
        x: Math.max(0, Math.min(100 - rect.w, newLeftPercent)),
        y: Math.max(0, Math.min(100 - rect.h, newTopPercent)),
        w: rect.w,
        h: rect.h
      });
    }

    if (isResizingRect && resizeDir) {
      const dxPercent = ((touch.clientX - dragStartX) / containerRect.width) * 100;
      const dyPercent = ((touch.clientY - dragStartY) / containerRect.height) * 100;

      let newX = rectStart.x;
      let newY = rectStart.y;
      let newW = rectStart.w;
      let newH = rectStart.h;

      const minSize = 8;

      if (resizeDir.includes('e')) {
        newW = Math.max(minSize, rectStart.w + dxPercent);
      }
      if (resizeDir.includes('w')) {
        newW = Math.max(minSize, rectStart.w - dxPercent);
        newX = rectStart.x + rectStart.w - newW;
      }
      if (resizeDir.includes('s')) {
        newH = Math.max(minSize, rectStart.h + dyPercent);
      }
      if (resizeDir.includes('n')) {
        newH = Math.max(minSize, rectStart.h - dyPercent);
        newY = rectStart.y + rectStart.h - newH;
      }

      if (newX + newW > 100) {
        newW = 100 - newX;
      }
      if (newY + newH > 100) {
        newH = 100 - newY;
      }

      setRect({
        x: Math.max(0, newX),
        y: Math.max(0, newY),
        w: Math.max(minSize, newW),
        h: Math.max(minSize, newH)
      });
    }
  };

  // Canvas Image Cropping & Saving engine (Vanilla JS Port - Request)
  const applyCropAndSave = () => {
    if (!croppingImageSrc) return;
    
    const img = new Image();
    img.src = croppingImageSrc;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;
        
        // Match percentage crop formula from requested code
        const cropX = (rect.x / 100) * imgWidth;
        const cropY = (rect.y / 100) * imgHeight;
        const cropW = (rect.w / 100) * imgWidth;
        const cropH = (rect.h / 100) * imgHeight;

        if (cropRotation === 90 || cropRotation === 270) {
          canvas.width = cropH;
          canvas.height = cropW;
        } else {
          canvas.width = cropW;
          canvas.height = cropH;
        }

        ctx.save();
        if (cropRotation === 90) {
          ctx.translate(cropH, 0);
          ctx.rotate(Math.PI / 2);
          ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
        } else if (cropRotation === 180) {
          ctx.translate(cropW, cropH);
          ctx.rotate(Math.PI);
          ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
        } else if (cropRotation === 270) {
          ctx.translate(0, cropW);
          ctx.rotate(-Math.PI / 2);
          ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
        } else {
          ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
        }
        ctx.restore();

        const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.95);
        
        if (croppingType === 'avatar') {
          onUpdateProfile({
            ...currentUser,
            avatar: croppedDataUrl
          });
          setAvatarUploadAlert(lang === 'en' ? "Profile picture cropped & successfully saved!" : "প্রোফাইল ছবি ক্রপ এবং সফলভাবে সেভ হয়েছে!");
          setTimeout(() => setAvatarUploadAlert(''), 3000);
        } else {
          onUpdateProfile({
            ...currentUser,
            theme: 'custom',
            customBg: `url(${croppedDataUrl})`
          });
          setCustomBg(`url(${croppedDataUrl})`);
          setThemeSuccessAlert(lang === 'en' ? "Custom image cropped & set as background successfully!" : "কাস্টম ব্যাকগ্রাউন্ড ইমেজ সফলভাবে সেভ হয়েছে!");
          setTimeout(() => setThemeSuccessAlert(''), 3000);
        }
      }
      
      setCroppingImageSrc(null);
      setCroppingType(null);
      setCropZoom(1);
      setCropX(0);
      setCropY(0);
      setCropRotation(0);
      setRect({ x: 10, y: 10, w: 80, h: 80 }); // reset crop box
    };
  };

  // SVG Chart analytics calculation
  const getClicksHistory = () => {
    const history: { [key: string]: { views: number; clicks: number } } = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString(lang === 'en' ? 'en-US' : 'bn-BD', { month: 'short', day: 'numeric' });
      history[key] = { views: 0, clicks: 0 };
    }

    userAnalytics.forEach(item => {
      const date = new Date(item.timestamp);
      const key = date.toLocaleDateString(lang === 'en' ? 'en-US' : 'bn-BD', { month: 'short', day: 'numeric' });
      if (history[key]) {
        if (item.targetId === 'profile_view') {
          history[key].views += 1;
        } else {
          history[key].clicks += 1;
        }
      }
    });

    return Object.entries(history).map(([day, val]) => ({ day, ...val }));
  };

  const clicksHistory = getClicksHistory();
  const maxHistoryValue = Math.max(...clicksHistory.flatMap(h => [h.views, h.clicks]), 10);

  return (
    <div className="space-y-6">
      {/* Collapsible Hamburger Menu Bar with Left Sliding Drawer */}
      <div className="relative">
        <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors cursor-pointer border border-slate-200/60 flex items-center justify-center"
              title={lang === 'en' ? "Open Dashboard Menu" : "মেনু দেখুন"}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block leading-none">
                {lang === 'en' ? 'BongoLink Portal' : 'বঙ্গলিংক পোর্টাল'}
              </span>
              <span className="text-xs font-bold text-slate-800 capitalize leading-none mt-1.5 block">
                {activeTab === 'home' && (lang === 'en' ? 'Home Page (Live Preview)' : 'হোম পেজ (লাইভ প্রোফাইল)')}
                {activeTab === 'socials' && t.socials}
                {activeTab === 'appearance' && t.appearance}
                {activeTab === 'security' && (lang === 'en' ? 'My Account' : 'আমার অ্যাকাউন্ট')}
              </span>
            </div>
          </div>
        </div>

        {/* Sliding Left Drawer Menu overlay and panel */}
        <div className={`fixed inset-0 z-50 transition-all duration-300 ${isMenuOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'}`}>
          {/* Backdrop overlay */}
          <div 
            onClick={() => setIsMenuOpen(false)}
            className={`absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`} 
          />
          
          {/* Left drawer panel */}
          <div 
            className={`absolute inset-y-0 left-0 w-72 max-w-[80vw] bg-white shadow-2xl border-r border-slate-100 flex flex-col p-6 transition-transform duration-300 ease-out ${
              isMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-5">
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest leading-none">
                  {lang === 'en' ? 'BongoLink Portal' : 'বঙ্গলিংক পোর্টাল'}
                </span>
                <span className="text-xs font-bold text-slate-800 leading-none mt-1.5">
                  {currentUser.name}
                </span>
              </div>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg transition-colors border border-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Menu Buttons list */}
            <div className="flex flex-col gap-2">
              {[
                { id: 'home', label: lang === 'en' ? 'Home Page' : 'হোম পেজ', icon: Globe },
                { id: 'socials', label: t.socials, icon: Compass },
                { id: 'appearance', label: t.appearance, icon: Palette },
                { id: 'security', label: lang === 'en' ? 'My Account' : 'আমার অ্যাকাউন্ট', icon: User }
              ].map((tab) => {
                const IconComp = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center gap-3.5 p-3.5 text-xs font-bold rounded-xl transition-all text-left cursor-pointer border ${
                      activeTab === tab.id
                        ? 'bg-slate-900 border-slate-950 text-white shadow-md'
                        : 'bg-slate-50/40 border-transparent hover:bg-slate-100/60 hover:border-slate-200/50 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <IconComp className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Action buttons (Copy Link & View Public Page) inside Drawer */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 p-3 rounded-xl text-xs font-bold transition-all cursor-pointer border border-indigo-100 w-full"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? t.copied : t.copyLink}</span>
              </button>
              
              <a
                href={`#@${currentUser.username}`}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white p-3 rounded-xl text-xs font-bold transition-all border border-slate-950 text-center w-full"
              >
                <Eye className="w-4 h-4" />
                <span>{t.viewPublicProfile}</span>
              </a>
            </div>

            {/* Language and Logout buttons at the bottom of the drawer */}
            <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => onSetLang(lang === 'en' ? 'bn' : 'en')}
                className="flex items-center justify-between p-3 text-xs font-bold rounded-xl transition-all cursor-pointer bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-700 w-full"
              >
                <span className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-slate-500" />
                  <span>{lang === 'en' ? 'Language / ভাষা' : 'ভাষা / Language'}</span>
                </span>
                <span className="bg-indigo-50 text-indigo-700 text-[10px] px-2 py-0.5 rounded-lg border border-indigo-100 font-sans">
                  {lang === 'en' ? 'বাংলা' : 'English'}
                </span>
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-2.5 p-3 text-xs font-bold rounded-xl transition-all text-left cursor-pointer border border-rose-100 bg-rose-50/50 hover:bg-rose-50 text-rose-700 w-full"
              >
                <LogOut className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{t.logout}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Tab Panels */}
      {activeTab === 'home' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-600 animate-pulse-subtle" />
              {lang === 'en' ? 'My Live Profile View' : 'আমার লাইভ প্রোফাইল'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {lang === 'en' 
                ? "This is exactly how your public page looks to visitors in real time. Share your link to start receiving clicks!"
                : "আপনার ভিজিটররা বর্তমানে আপনার প্রোফাইলটি ঠিক যেভাবে দেখছেন তা নিচে দেখানো হলো।"}
            </p>
          </div>

          <div className="border-t border-slate-200/60 pt-6">
            <div className="max-w-sm mx-auto overflow-hidden">
            <div className="h-[550px] overflow-y-auto bg-white custom-scrollbar">
              <PublicProfile 
                lang={lang}
                username={currentUser.username}
                users={users}
                links={links}
                socials={socials}
                analytics={analytics}
                onAddAnalytic={() => {}}
                onGoBack={() => {}}
              />
            </div>
          </div>
          </div>
        </div>
      )}

      {activeTab === 'links' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Add link panel */}
          <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm space-y-4 h-fit">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-rose-500" />
              {t.addLink}
            </h3>

            {linkError && (
              <div className="flex items-start gap-2 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200/60">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>{linkError}</div>
              </div>
            )}

            <form onSubmit={handleAddLink} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {t.linkTitle}
                </label>
                <input
                  type="text"
                  placeholder="e.g. My Coding Portfolio"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {t.linkUrl}
                </label>
                <input
                  type="text"
                  placeholder="e.g. https://mywork.com"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors font-medium font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {t.icon}
                </label>
                <select
                  value={newIcon}
                  onChange={(e) => setNewIcon(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                >
                  <option value="Globe">🌐 Website</option>
                  <option value="Github">🐙 GitHub</option>
                  <option value="Youtube">🎥 YouTube</option>
                  <option value="Instagram">📸 Instagram</option>
                  <option value="BookOpen">📖 E-Book/Blog</option>
                  <option value="Sparkles">✨ Projects</option>
                  <option value="Heart">❤️ Social Cause</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-lg transition-colors shadow-sm"
              >
                {t.addLink}
              </button>
            </form>
          </div>

          {/* Quick Social Media Handles inside My Links sidebar (Request 4) */}
          <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm space-y-4 h-fit">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
              <Compass className="w-4 h-4 text-indigo-600 animate-pulse-subtle" />
              {lang === 'en' ? "Quick Social Handles" : "সোশ্যাল মিডিয়া প্রোফাইলসমূহ"}
            </h3>
            
            <div className="space-y-4.5 max-h-[350px] overflow-y-auto pr-1">
              {localSocials.map(item => {
                const platform = item.platform;
                return (
                  <div key={item.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        {item.title}
                      </label>
                      {item.username.trim() !== '' && (
                        <span className="text-[9px] text-emerald-600 font-bold font-sans">✓ Added</span>
                      )}
                    </div>
                    
                    <div className="flex items-center relative">
                      <span className="bg-slate-100 border border-r-0 border-slate-200 rounded-l-lg px-2.5 py-1.5 text-slate-400 text-[10px] font-mono select-none">
                        {platform === 'facebook' && 'fb.com/'}
                        {platform === 'instagram' && 'ig.com/'}
                        {platform === 'tiktok' && 'tt.com/@'}
                        {platform === 'telegram' && 't.me/'}
                        {platform === 'twitter' && 'x.com/'}
                        {platform === 'website' && 'https://'}
                        {platform === 'whatsapp' && (item.whatsappType === 'username' ? 'wa.me/@' : 'wa.me/')}
                        {platform === 'phone' && 'tel:+'}
                        {platform === 'about' && '📝'}
                      </span>
                      
                      <input
                        type="text"
                        placeholder={platform === 'about' ? "Bio/Info text..." : "username"}
                        value={item.username}
                        onChange={(e) => handleUpdateSocialField(item.id, { username: e.target.value })}
                        className="w-full min-w-0 bg-slate-50 border border-slate-200 rounded-r-lg p-1.5 text-[11px] focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors font-mono"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleSaveSocials}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              {lang === 'en' ? 'Save Social Profiles' : 'সোশ্যাল লিংক সংরক্ষণ করুন'}
            </button>
          </div>

          {/* Links list and sorting */}
          <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800">
              {lang === 'en' ? "Manage & Reorder Links" : "লিংক এবং সাজানোর ক্রম"}
            </h3>

            {userLinks.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                {t.noLinks}
              </div>
            ) : (
              <div className="space-y-3">
                {userLinks.map((link, index) => (
                  <div 
                    key={link.id} 
                    className="border border-slate-200/80 rounded-xl p-3.5 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {/* Move Controls */}
                      <div className="flex flex-col gap-1 items-center pt-1 shrink-0">
                        <button
                          onClick={() => moveLink(index, 'up')}
                          disabled={index === 0}
                          className="p-1 hover:bg-slate-200 text-slate-400 disabled:opacity-30 rounded transition-colors"
                          title={lang === 'en' ? "Move Up" : "উপরে সরান"}
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveLink(index, 'down')}
                          disabled={index === userLinks.length - 1}
                          className="p-1 hover:bg-slate-200 text-slate-400 disabled:opacity-30 rounded transition-colors"
                          title={lang === 'en' ? "Move Down" : "নিচে সরান"}
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Link Item Details */}
                      <div className="flex-1 min-w-0 space-y-1">
                        {editingLinkId === link.id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs"
                            />
                            <input
                              type="text"
                              value={editUrl}
                              onChange={(e) => setEditUrl(e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-mono"
                            />
                            <div className="flex gap-1.5 pt-1">
                              <button
                                onClick={() => saveEditLink(link.id)}
                                className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded hover:bg-emerald-700"
                              >
                                {t.save}
                              </button>
                              <button
                                onClick={() => setEditingLinkId(null)}
                                className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded hover:bg-slate-300"
                              >
                                {t.cancel}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold text-slate-800 break-words">{link.title}</span>
                              {!link.visible && (
                                <span className="text-[9px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                                  {lang === 'en' ? 'Draft' : 'খসড়া'}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500 font-mono truncate max-w-xs sm:max-w-md">
                              {link.url}
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Right side status & action buttons */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center bg-slate-100 sm:bg-transparent px-2 py-1 sm:p-0 rounded-xl shrink-0">
                      {/* Toggle Visibility */}
                      <button
                        onClick={() => handleToggleLinkVisibility(link.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          link.visible ? 'text-indigo-600 hover:bg-indigo-50' : 'text-slate-400 hover:bg-slate-200'
                        }`}
                        title={link.visible ? "Hide Link" : "Show Link"}
                      >
                        {link.visible ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>

                      {/* Duplicate Link */}
                      <button
                        onClick={() => handleDuplicateLink(link)}
                        className="p-1.5 text-slate-500 hover:bg-slate-200 rounded-lg transition-colors"
                        title={t.duplicate}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit details */}
                      {editingLinkId !== link.id && (
                        <button
                          onClick={() => startEditLink(link)}
                          className="p-1.5 text-indigo-600 hover:bg-slate-200 rounded-lg transition-colors"
                          title={t.edit}
                        >
                          <Sliders className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteLink(link.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title={t.delete}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'socials' && (
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-800">
                {lang === 'en' ? "Social Accounts" : "সোশ্যাল মিডিয়া অ্যাকাউন্ট"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {lang === 'en' 
                  ? "Customize and add multiple handles with editable titles, custom country codes, and standard usernames."
                  : "সহজে একাধিক অ্যাকাউন্ট যুক্ত করুন, নাম পরিবর্তন করুন এবং কান্ট্রি কোড সিলেক্ট করুন।"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveSocials} className="space-y-6">
            <div className="space-y-6">
              {['facebook', 'instagram', 'whatsapp', 'tiktok', 'telegram', 'twitter', 'phone', 'about', 'website'].map(platform => {
                const platformItems = localSocials.filter(s => s.platform === platform);
                
                return (
                  <div key={platform} className="border border-slate-200/60 rounded-2xl p-4 bg-slate-50/20 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        {platform === 'phone' ? 'Call Me' : platform === 'about' ? 'About Me' : platform === 'twitter' ? 'Twitter (X)' : platform.toUpperCase()}
                      </span>
                      
                      {/* Plus button to add more handles of the same platform */}
                      <button
                        type="button"
                        onClick={() => handleAddDuplicateSocialField(platform as any)}
                        className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-xl transition-all cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        {lang === 'en' ? 'Add Field' : 'নতুন যুক্ত করুন'}
                      </button>
                    </div>

                    <div className="space-y-3">
                      {platformItems.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">
                          {lang === 'en' ? "No handles configured. Click 'Add Field' to add one." : "কোনো অ্যাকাউন্ট যুক্ত নেই। 'নতুন যুক্ত করুন' বাটনে চাপ দিন।"}
                        </p>
                      ) : (
                        platformItems.map((item) => {
                          return (
                            <div key={item.id} className="flex flex-col gap-2.5 p-3.5 bg-white border border-slate-200/60 rounded-xl shadow-xs relative">
                              {/* Customizable title / name */}
                              <div className="flex items-center justify-between gap-2">
                                <input
                                  type="text"
                                  value={item.title}
                                  onChange={(e) => handleUpdateSocialField(item.id, { title: e.target.value })}
                                  placeholder={platform.toUpperCase()}
                                  className="text-xs font-bold text-slate-800 border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none py-0.5 max-w-[180px] font-sans"
                                />
                                
                                {/* Delete item if it's a duplicate or if they want to clear it */}
                                {(platformItems.length > 1 || item.username) && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSocialField(item.id)}
                                    className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                                    title={lang === 'en' ? "Delete field" : "মুছে ফেলুন"}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>

                              {/* Prefix and Input row */}
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 relative">
                                {/* If WhatsApp, show selector for Phone vs Username */}
                                {platform === 'whatsapp' && (
                                  <div className="flex bg-slate-100 p-0.5 rounded-lg text-[9px] font-bold shrink-0 w-fit">
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateSocialField(item.id, { whatsappType: 'phone' })}
                                      className={`px-2.5 py-1 rounded transition-all ${
                                        item.whatsappType === 'phone' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500'
                                      }`}
                                    >
                                      {lang === 'en' ? 'Phone' : 'নাম্বার'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateSocialField(item.id, { whatsappType: 'username' })}
                                      className={`px-2.5 py-1 rounded transition-all ${
                                        item.whatsappType === 'username' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500'
                                      }`}
                                    >
                                      {lang === 'en' ? 'Username' : 'ইউজারনেম'}
                                    </button>
                                  </div>
                                )}

                                <div className="flex items-center gap-2 flex-1 min-w-0">


                                  {/* Dynamic Prefixes */}
                                  {platform !== 'about' && platform !== 'website' && (
                                    <div className="bg-slate-100 px-2.5 py-2 rounded-lg text-slate-400 text-xs font-mono font-bold select-none shrink-0 border border-slate-200/60 font-medium">
                                      {platform === 'facebook' && 'facebook.com/'}
                                      {platform === 'instagram' && 'instagram.com/'}
                                      {platform === 'tiktok' && 'tiktok.com/@'}
                                      {platform === 'telegram' && 't.me/'}
                                      {platform === 'twitter' && 'x.com/'}
                                      {platform === 'whatsapp' && (item.whatsappType === 'username' ? 'wa.me/@' : 'wa.me/')}
                                      {platform === 'phone' && 'tel:+'}
                                    </div>
                                  )}

                                  {/* Username / Description Input Field with inline plus button */}
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    {platform === 'about' ? (
                                      <textarea
                                        rows={2}
                                        placeholder={lang === 'en' ? "Enter biography text or paste an external URL link..." : "আপনার ডেসক্রিপশন লিখুন অথবা লিঙ্ক পেস্ট করুন..."}
                                        value={item.username}
                                        onChange={(e) => handleUpdateSocialField(item.id, { username: e.target.value })}
                                        className="flex-1 w-full min-w-0 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors font-sans font-medium resize-none"
                                      />
                                    ) : (
                                      <input
                                        type="text"
                                        placeholder={platform === 'website' ? "https://example.com" : "username"}
                                        value={item.username}
                                        onChange={(e) => handleUpdateSocialField(item.id, { username: e.target.value })}
                                        className="flex-1 w-full min-w-0 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors font-mono font-bold"
                                      />
                                    )}

                                    {/* Inline plus button when there is content in the input field (Request 10) */}
                                    {item.username.trim() !== '' && (
                                      <button
                                        type="button"
                                        onClick={() => handleAddDuplicateSocialField(platform as any)}
                                        className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors border border-indigo-200/50 cursor-pointer shrink-0"
                                        title={lang === 'en' ? "Add another link for this social" : "আরেকটি ফিল্ড যুক্ত করুন"}
                                      >
                                        <Plus className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-3 px-6 rounded-xl transition-all shadow-sm active:scale-[0.98] cursor-pointer"
              >
                {lang === 'en' ? 'Save Changes' : 'সংরক্ষণ করুন'}
              </button>

              <button
                type="button"
                onClick={handleResetSocials}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-3 px-6 rounded-xl transition-all shadow-sm active:scale-[0.98] cursor-pointer"
              >
                {lang === 'en' ? 'Reset All' : 'রিসেট অল'}
              </button>

              {socialSuccess && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200/60 font-semibold animate-pulse-subtle">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{socialSuccess}</span>
                </div>
              )}

              {socialError && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-800 text-xs rounded-xl border border-red-200/60 font-semibold animate-pulse-subtle">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{socialError}</span>
                </div>
              )}
            </div>
          </form>
        </div>
      )}

      {activeTab === 'appearance' && (
        <div className="max-w-2xl mx-auto bg-white border border-slate-200/80 rounded-2xl p-5 md:p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
              {t.appearance}
            </h3>
          </div>

          {socialSuccess && (
            <div className="flex items-start gap-2.5 p-3.5 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200/60">
              <Check className="w-4 h-4 shrink-0 mt-0.5" />
              <div>{socialSuccess}</div>
            </div>
          )}

          {/* Avatar picker & Upload simulation */}
          <div className="space-y-3">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              {t.avatarSelection}
            </label>

            {avatarUploadAlert && (
              <div className="text-xs text-indigo-600 font-semibold mb-2">
                ✓ {avatarUploadAlert}
              </div>
            )}

            <div className="flex items-start gap-4">
              {currentUser.avatar ? (
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  className="w-16 h-16 rounded-full object-cover border-2 border-slate-200 shadow-sm shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0 shadow-inner">
                  <User className="w-8 h-8" />
                </div>
              )}
              
              <div className="space-y-2 flex-1">
                {/* Local Upload Simulator */}
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSimulateAvatarUpload}
                    id="simulated-upload"
                    className="hidden"
                  />
                  <div className="flex gap-2 items-center flex-wrap">
                    <label
                      htmlFor="simulated-upload"
                      className="inline-block bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 px-3.5 rounded-lg cursor-pointer border border-slate-200 transition-colors text-center font-sans"
                    >
                      {lang === 'en' ? 'Upload & Crop Picture' : 'ছবি আপলোড ও ক্রপ করুন'}
                    </label>
                    {currentUser.avatar && (
                      <button
                        type="button"
                        onClick={() => onUpdateProfile({ ...currentUser, avatar: '' })}
                        className="bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold py-2 px-3 rounded-lg border border-red-200 transition-colors cursor-pointer"
                      >
                        {lang === 'en' ? 'Remove Picture' : 'ছবি রিমুভ'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Direct URL set */}
                <div className="flex gap-1 max-w-sm">
                  <input
                    type="text"
                    placeholder="Or enter custom avatar URL..."
                    value={customAvatarUrl}
                    onChange={(e) => setCustomAvatarUrl(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-[10px] flex-1 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleSetAvatarUrlDirect}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-2 py-1 rounded cursor-pointer"
                  >
                    Set
                  </button>
                </div>

                {/* Change Username (Request 6) */}
                <div className="pt-3.5 border-t border-slate-100 max-w-sm">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    {lang === 'en' ? 'Profile Username' : 'প্রোফাইল ইউজারনেম'}
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400 font-mono text-xs select-none">
                        @
                      </span>
                      <input
                        type="text"
                        value={tempUsername}
                        onChange={(e) => setTempUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                        placeholder="username"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-6 pr-2.5 text-xs font-bold font-mono focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveUsername}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      {lang === 'en' ? 'Save Username' : 'ইউজারনেম সেভ'}
                    </button>
                  </div>
                  {usernameSuccess && (
                    <p className="text-[10px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      {usernameSuccess}
                    </p>
                  )}
                  {usernameError && (
                    <p className="text-[10px] text-rose-600 font-bold mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {usernameError}
                    </p>
                  )}
                </div>

                {/* Change Name (Request 4) */}
                <div className="pt-3.5 border-t border-slate-100 max-w-sm">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    {lang === 'en' ? 'Profile Name' : 'প্রোফাইল নাম'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      placeholder="Your Name"
                      className="w-full flex-1 bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-2.5 text-xs font-bold focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                    />
                    <button
                      type="button"
                      onClick={handleSaveName}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      {lang === 'en' ? 'Save Name' : 'নাম সেভ'}
                    </button>
                  </div>
                  {nameSuccess && (
                    <p className="text-[10px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      {nameSuccess}
                    </p>
                  )}
                  {nameError && (
                    <p className="text-[10px] text-rose-600 font-bold mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {nameError}
                    </p>
                  )}
                </div>

                {/* Biography / Description edit field */}
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      {lang === 'en' ? 'Bio / Description' : 'নিজের সম্পর্কে তথ্য (Bio / Description)'}
                    </label>
                    <textarea
                      rows={3}
                      value={tempBio}
                      onChange={(e) => setTempBio(e.target.value)}
                      placeholder={lang === 'en' ? "Write a short, engaging description about yourself..." : "নিজের সম্পর্কে একটি সংক্ষিপ্ত বিবরণ লিখুন..."}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors font-medium resize-none leading-relaxed"
                    />
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleSaveBio}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer shadow-xs active:scale-[0.98]"
                    >
                      {lang === 'en' ? 'Save Bio' : 'বায়ো সেভ করুন'}
                    </button>

                    {bioSuccess && (
                      <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold font-sans">
                        <Check className="w-3.5 h-3.5" />
                        <span>{lang === 'en' ? 'Bio Saved!' : 'বায়ো সফলভাবে সংরক্ষিত!'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Theme selection buttons */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              {lang === 'en' ? "Theme Options" : "থিম অপশন"}
            </label>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleUpdateTheme('light')}
                className={`border p-3 rounded-xl text-center transition-all cursor-pointer ${
                  currentUser.theme === 'light'
                    ? 'border-indigo-600 bg-indigo-50/40 font-bold text-indigo-700'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <SunlitSunIcon className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                <span className="text-[10px] block font-sans">{t.themeLight}</span>
              </button>

              <button
                onClick={() => handleUpdateTheme('dark')}
                className={`border p-3 rounded-xl text-center transition-all cursor-pointer ${
                  currentUser.theme === 'dark'
                    ? 'border-indigo-600 bg-indigo-50/40 font-bold text-indigo-700'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Monitor className="w-5 h-5 mx-auto mb-1 text-slate-800" />
                <span className="text-[10px] block font-sans">{t.themeDark}</span>
              </button>

              <button
                onClick={() => handleUpdateTheme('custom')}
                className={`border p-3 rounded-xl text-center transition-all cursor-pointer ${
                  currentUser.theme === 'custom'
                    ? 'border-indigo-600 bg-indigo-50/40 font-bold text-indigo-700'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Palette className="w-5 h-5 mx-auto mb-1 text-pink-500" />
                <span className="text-[10px] block font-sans">{t.themeCustom}</span>
              </button>
            </div>
          </div>

          {/* Bespoke / Custom design controls */}
          {currentUser.theme === 'custom' && (
            <div className="border-t border-slate-100 pt-4 space-y-4">
              <h4 className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {lang === 'en' ? 'Custom Theme Settings' : 'কাস্টম থিম সেটিংস'}
              </h4>

              {/* Upload Custom Background Wallpaper (Request 7) */}
              <div className="space-y-1.5 border border-slate-200/60 p-3.5 rounded-xl bg-slate-50/40">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {lang === 'en' ? 'Custom Background Wallpaper' : 'কাস্টম ব্যাকগ্রাউন্ড ওয়ালপেপার (ছবি)'}
                </label>
                <p className="text-[10px] text-slate-400">
                  {lang === 'en' ? 'Upload an image from your device to use as background wallpaper.' : 'আপনার ব্যাকগ্রাউন্ড ওয়ালপেপার হিসেবে ব্যবহার করতে ডিভাইস থেকে যেকোনো ছবি আপলোড করুন।'}
                </p>
                <div className="flex gap-2 items-center flex-wrap mt-2">
                  <input
                    type="file"
                    accept="image/*"
                    id="theme-bg-upload"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          setCroppingImageSrc(ev.target?.result as string);
                          setCroppingType('theme_bg');
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <label
                    htmlFor="theme-bg-upload"
                    className="inline-block bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold py-2 px-3.5 rounded-lg cursor-pointer border border-indigo-200/40 transition-colors text-center font-sans"
                  >
                    {lang === 'en' ? 'Upload & Crop Image' : 'ছবি আপলোড ও ক্রপ করুন'}
                  </label>
                  
                  {currentUser.customBg.startsWith('url(') && (
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateProfile({ ...currentUser, customBg: '#ffffff' });
                        setCustomBg('#ffffff');
                      }}
                      className="bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold py-2 px-3 rounded-lg border border-red-200 transition-colors cursor-pointer"
                    >
                      {lang === 'en' ? 'Remove Wallpaper' : 'ওয়ালপেপার রিমুভ করুন'}
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                    {t.backgroundColor} (Color or Gradient code)
                  </label>
                  <input
                    type="text"
                    value={customBg}
                    disabled={currentUser.customBg.startsWith('url(')}
                    onChange={(e) => setCustomBg(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-mono disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                    {t.textColor}
                  </label>
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                    {t.buttonBg}
                  </label>
                  <input
                    type="text"
                    value={customBtnBg}
                    onChange={(e) => setCustomBtnBg(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                    {t.buttonRadius}
                  </label>
                  <select
                    value={customBtnRadius}
                    onChange={(e) => setCustomBtnRadius(e.target.value as 'none' | 'md' | 'full')}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs"
                  >
                    <option value="none">{t.radiusSharp}</option>
                    <option value="md">{t.radiusRounded}</option>
                    <option value="full">{t.radiusPill}</option>
                  </select>
                </div>
              </div>

            </div>
          )}

          {/* Theme Save Button (Request 10) */}
          <div className="border-t border-slate-100 pt-5 flex items-center justify-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleSaveThemeSettingsGlobal}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-6 rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              {lang === 'en' ? 'Save Theme Settings' : 'থিম সেভ করুন'}
            </button>

            {currentUser.theme === 'custom' && (
              <button
                type="button"
                onClick={handleResetTheme}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 px-6 rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                {lang === 'en' ? 'Reset Theme' : 'রিসেট থিম'}
              </button>
            )}

            {themeSuccessAlert && (
              <p className="text-xs text-emerald-600 font-bold flex items-center gap-1 font-sans animate-pulse-subtle w-full text-center mt-1.5 justify-center">
                <Check className="w-4 h-4 text-emerald-600" />
                {themeSuccessAlert}
              </p>
            )}
          </div>
        </div>
      )}



      {activeTab === 'security' && (
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm space-y-6 max-w-xl">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-800">
              {lang === 'en' ? 'My Account' : 'আমার অ্যাকাউন্ট'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'en' 
                ? "Manage your maintenance mode settings, password, and account lifecycle."
                : "আপনার মেইনটেন্যান্স মোড সেটিংস, পাসওয়ার্ড এবং অ্যাকাউন্ট পরিচালনা করুন।"}
            </p>
          </div>

          {/* Maintenance Mode Option */}
          <div className="pb-5 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800">
                  {t.maintenanceStatus} Setting
                </h4>
                <p className="text-[11px] text-slate-500">
                  {lang === 'en' 
                    ? "When active, your public page will display a Under Maintenance notice instead of your links."
                    : "সক্রিয় থাকলে পাবলিক প্রোফাইলে লিংকের পরিবর্তে সাময়িক রক্ষণাবেক্ষণের বার্তা প্রদর্শিত হবে।"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleToggleMaintenance}
                className={`p-1 rounded-full transition-colors cursor-pointer ${
                  currentUser.maintenanceMode ? 'text-rose-600' : 'text-slate-400'
                }`}
              >
                {currentUser.maintenanceMode ? (
                  <ToggleRight className="w-10 h-10" />
                ) : (
                  <ToggleLeft className="w-10 h-10" />
                )}
              </button>
            </div>
          </div>

          {/* Password Reset form */}
          <form onSubmit={handleDashChangePassword} className="space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {lang === 'en' ? 'Change Password' : 'পাসওয়ার্ড পরিবর্তন করুন'}
            </h4>

            {dashPassError && (
              <div className="flex items-start gap-2 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200/60">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>{dashPassError}</div>
              </div>
            )}

            {dashPassSuccess && (
              <div className="flex items-start gap-2 p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200/60">
                <Check className="w-4 h-4 shrink-0 mt-0.5" />
                <div>{dashPassSuccess}</div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {lang === 'en' ? 'Current Password' : 'বর্তমান পাসওয়ার্ড'}
                </label>
                <div className="relative">
                  <input
                    type={showDashOldPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={dashOldPassword}
                    onChange={(e) => setDashOldPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 pr-10 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowDashOldPassword(!showDashOldPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                  >
                    {showDashOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    {lang === 'en' ? 'New Password' : 'নতুন পাসওয়ার্ড'}
                  </label>
                  <div className="relative">
                    <input
                      type={showDashNewPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={dashNewPassword}
                      onChange={(e) => setDashNewPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 pr-10 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowDashNewPassword(!showDashNewPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                    >
                      {showDashNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    {t.confirmPassword}
                  </label>
                  <div className="relative">
                    <input
                      type={showDashConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={dashConfirmNewPassword}
                      onChange={(e) => setDashConfirmNewPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 pr-10 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowDashConfirmPassword(!showDashConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                    >
                      {showDashConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-6 rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              {lang === 'en' ? 'Change Password' : 'পাসওয়ার্ড পরিবর্তন করুন'}
            </button>
          </form>

          {/* Change Email with OTP Verification (Request) */}
          <div className="border-t border-slate-100 pt-5 space-y-4">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                {lang === 'en' ? 'Change Email Address' : 'ইমেইল এড্রেস পরিবর্তন করুন'}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {lang === 'en' 
                  ? "Change your login and contact email. Requires verification of a secure OTP code."
                  : "আপনার লগইন এবং যোগাযোগের ইমেইল আইডি পরিবর্তন করুন। ওটিপি কোড দিয়ে ভেরিফাই করা প্রয়োজন।"}
              </p>
            </div>

            {emailChangeSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg font-medium animate-pulse-subtle">
                {emailChangeSuccess}
              </div>
            )}

            {emailChangeError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg font-medium">
                {emailChangeError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  {lang === 'en' ? 'Current Email Address' : 'বর্তমান ইমেইল এড্রেস'}
                </label>
                <input
                  type="email"
                  disabled
                  readOnly
                  value={currentUser.email}
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-500 font-medium cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  {lang === 'en' ? 'New Email Address' : 'নতুন ইমেইল এড্রেস'}
                </label>
                <input
                  type="email"
                  placeholder="new@example.com"
                  value={newEmail}
                  disabled={otpSent}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors disabled:opacity-60"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  {lang === 'en' ? 'Confirm Email Address' : 'কনফার্ম ইমেইল এড্রেস'}
                </label>
                <input
                  type="email"
                  placeholder="confirm@example.com"
                  value={confirmEmail}
                  disabled={otpSent}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors disabled:opacity-60"
                />
              </div>

              <div className="md:col-span-2 pt-1">
                {!otpSent ? (
                  <button
                    type="button"
                    onClick={handleSendEmailOtp}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 px-6 rounded-lg transition-colors shadow-sm cursor-pointer"
                  >
                    {lang === 'en' ? 'Update Email Address' : 'আপডেট ইমেইল এড্রেস'}
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setGeneratedOtp('');
                        setEmailOtp('');
                        setConfirmEmail('');
                        setNewEmail('');
                        setEmailChangeSuccess('');
                      }}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold px-3 py-2 rounded-lg transition-colors shrink-0 cursor-pointer"
                    >
                      {lang === 'en' ? 'Reset Form' : 'ফর্ম রিসেট'}
                    </button>
                    <span className="text-xs text-slate-500 font-medium">
                      {lang === 'en' ? "OTP verification code sent!" : "ওটিপি ভেরিফিকেশন কোড পাঠানো হয়েছে!"}
                    </span>
                  </div>
                )}
              </div>

              {otpSent && (
                <div className="md:col-span-2 bg-indigo-50/40 border border-indigo-100 p-4 rounded-xl space-y-2 animate-pulse-subtle">
                  <label className="block text-[10px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                    {lang === 'en' ? 'Enter Verification Code (OTP)' : 'ভেরিফিকেশন কোড লিখুন (OTP)'}
                  </label>
                  <div className="flex gap-2 max-w-sm">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="123456"
                      value={emailOtp}
                      onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-white border border-slate-300 text-slate-800 rounded-lg p-2.5 text-xs font-bold text-center tracking-widest focus:outline-none focus:border-indigo-600 font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyAndChangeEmail}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-3 py-2 rounded-lg transition-colors shrink-0 cursor-pointer"
                    >
                      {lang === 'en' ? 'Verify & Update' : 'ভেরিফাই করুন'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Account Deletion */}
          <div className="border-t border-slate-100 pt-5">
            <h4 className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
              {lang === 'en' ? 'Danger Zone' : 'বিপদজনক এলাকা'}
            </h4>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              {lang === 'en' 
                ? "Once you delete your account, there is no going back. All your data will be permanently removed."
                : "অ্যাকাউন্ট একবার মুছে ফেললে তা আর ফেরত আনা সম্ভব নয়। আপনার সমস্ত তথ্য স্থায়ীভাবে ডিলিট হয়ে যাবে।"}
            </p>
            <button
              type="button"
              onClick={() => {
                setDeleteConfirmPassword('');
                setDeleteError('');
                setShowDeleteModal(true);
              }}
              className="bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold py-2.5 px-4 rounded-lg border border-red-200 transition-colors cursor-pointer font-sans"
            >
              {t.deleteMyAccount}
            </button>
          </div>
        </div>
      )}

      {/* Account Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 text-left">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full shadow-lg space-y-4">
            <div>
              <h3 className="text-base font-bold text-red-600 flex items-center gap-1.5 font-sans">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                {t.deleteMyAccount}
              </h3>
              <p className="text-xs text-red-700 bg-red-50 border border-red-200/60 p-3 rounded-xl mt-2 leading-relaxed">
                {t.deleteAccountWarning}
              </p>
            </div>

            {deleteError && (
              <div className="flex items-start gap-2 p-3 bg-red-50 text-red-700 text-[11px] rounded-xl border border-red-200/60">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <div>{deleteError}</div>
              </div>
            )}

            <div className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {t.deleteAccountConfirm}
                </label>
                <input
                  type="password"
                  value={deleteConfirmPassword}
                  onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmPassword('');
                    setDeleteError('');
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 rounded-xl transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const result = onDeleteAccount(deleteConfirmPassword);
                    if (result.success) {
                      setShowDeleteModal(false);
                    } else {
                      setDeleteError(result.error || t.incorrectPassword);
                    }
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 rounded-xl transition-colors"
                >
                  {t.delete}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Crop & Resize Modal Panel (Request 8 - WhatsApp Style) */}
      {croppingImageSrc && (
        <div className="fixed inset-0 bg-[#0b141a] z-50 flex flex-col justify-between p-4 md:p-6 font-sans select-none overflow-hidden animate-fade-in">
          {/* Top Control Bar */}
          <div className="w-full flex items-center justify-between border-b border-white/10 pb-3 text-white">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#00a884] animate-pulse-subtle" />
              <span className="text-sm font-bold tracking-wide">
                {lang === 'en' ? 'Crop & Rotate' : 'ক্রপ এবং রোটেট'}
              </span>
            </div>
            {/* Sleek Zoom Slider directly in the upper header */}
            <div className="flex items-center gap-2.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
              <span className="text-[10px] text-white/60 font-bold uppercase tracking-wider">{lang === 'en' ? 'Zoom' : 'জুম'}</span>
              <input 
                type="range"
                min="1"
                max="3.5"
                step="0.05"
                value={cropZoom}
                onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                className="w-24 accent-[#00a884] h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-[11px] font-mono font-bold text-[#00a884]">{cropZoom.toFixed(1)}x</span>
            </div>
          </div>

          {/* Visual Cropping Mask Viewport (WhatsApp Style - Resizable Crop Box) */}
          <div className="flex-1 flex items-center justify-center py-6">
            <div 
              ref={cropContainerRef}
              className={`overflow-hidden relative bg-[#010a0f] flex items-center justify-center cursor-default border border-white/20 shadow-2xl select-none ${
                croppingType === 'avatar' ? 'w-72 h-72' : 'w-72 h-96'
              }`}
              onMouseDown={handleContainerMouseDown}
              onMouseMove={handleContainerMouseMove}
              onMouseUp={handleContainerMouseUp}
              onMouseLeave={handleContainerMouseUp}
              onTouchStart={handleContainerTouchStart}
              onTouchMove={handleContainerTouchMove}
              onTouchEnd={handleContainerMouseUp}
            >
              {/* Render Rotated & Zoomed Image filling the background container */}
              <img 
                src={croppingImageSrc}
                alt="Cropping View"
                style={{
                  transform: `rotate(${cropRotation}deg) scale(${cropZoom})`,
                  transition: 'transform 0.15s ease-out'
                }}
                className="w-full h-full object-cover pointer-events-none select-none"
              />

              {/* Shaded Resizable Crop Box Overlay */}
              <div
                id="cropRectangle"
                className={`absolute border-2 border-dashed border-white/80 shadow-[0_0_0_9999px_rgba(11,20,26,0.65)] cursor-move flex flex-col justify-between z-20 ${
                  croppingType === 'avatar' ? 'rounded-full' : ''
                }`}
                style={{
                  left: `${rect.x}%`,
                  top: `${rect.y}%`,
                  width: `${rect.w}%`,
                  height: `${rect.h}%`
                }}
              >
                {/* 3x3 Grid Overlay inside the crop box */}
                <div className={`absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none ${croppingType === 'avatar' ? 'rounded-full overflow-hidden' : ''}`}>
                  <div className="border-r border-b border-white/25" />
                  <div className="border-r border-b border-white/25" />
                  <div className="border-b border-white/25" />
                  <div className="border-r border-b border-white/25" />
                  <div className="border-r border-b border-white/25" />
                  <div className="border-b border-white/25" />
                  <div className="border-r border-white/25" />
                  <div className="border-r border-white/25" />
                  <div />
                </div>

                {/* Classic Thick Corner Brackets styled on top */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white pointer-events-none" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white pointer-events-none" />

                {/* Corner Resize Handles */}
                <div className="resize-handle absolute top-[-6px] left-[-6px] w-4 h-4 bg-white border border-slate-900 rounded-full cursor-nwse-resize shadow-md z-30" data-dir="nw" />
                <div className="resize-handle absolute top-[-6px] right-[-6px] w-4 h-4 bg-white border border-slate-900 rounded-full cursor-nesw-resize shadow-md z-30" data-dir="ne" />
                <div className="resize-handle absolute bottom-[-6px] left-[-6px] w-4 h-4 bg-white border border-slate-900 rounded-full cursor-nesw-resize shadow-md z-30" data-dir="sw" />
                <div className="resize-handle absolute bottom-[-6px] right-[-6px] w-4 h-4 bg-white border border-slate-900 rounded-full cursor-nwse-resize shadow-md z-30" data-dir="se" />

                {/* Edge Handles */}
                <div className="resize-handle absolute top-[-5px] left-[50%] translate-x-[-50%] w-6 h-2.5 bg-white border border-slate-900 cursor-ns-resize rounded-full shadow-md z-30" data-dir="n" />
                <div className="resize-handle absolute bottom-[-5px] left-[50%] translate-x-[-50%] w-6 h-2.5 bg-white border border-slate-900 cursor-ns-resize rounded-full shadow-md z-30" data-dir="s" />
                <div className="resize-handle absolute left-[-5px] top-[50%] translate-y-[-50%] w-2.5 h-6 bg-white border border-slate-900 cursor-ew-resize rounded-full shadow-md z-30" data-dir="w" />
                <div className="resize-handle absolute right-[-5px] top-[50%] translate-y-[-50%] w-2.5 h-6 bg-white border border-slate-900 cursor-ew-resize rounded-full shadow-md z-30" data-dir="e" />
              </div>
            </div>
          </div>

          {/* Bottom Control Bar */}
          <div className="w-full flex items-center justify-between border-t border-white/10 pt-4 px-2">
            <button
              type="button"
              onClick={() => {
                setCroppingImageSrc(null);
                setCroppingType(null);
                setCropZoom(1);
                setCropX(0);
                setCropY(0);
                setCropRotation(0);
              }}
              className="text-[#00a884] hover:text-[#00bf96] text-sm font-bold tracking-wider px-4 py-2.5 transition-colors cursor-pointer"
            >
              {lang === 'en' ? 'Cancel' : 'বাতিল'}
            </button>

            {/* Rotation Button */}
            <button
              type="button"
              onClick={() => setCropRotation((prev) => (prev + 90) % 360)}
              className="text-white hover:text-emerald-400 p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all cursor-pointer flex items-center justify-center shadow-inner"
              title={lang === 'en' ? 'Rotate 90°' : 'রোটেট ৯০°'}
            >
              <RotateCw className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={applyCropAndSave}
              className="text-[#00a884] hover:text-[#00bf96] text-sm font-bold tracking-wider px-4 py-2.5 transition-colors cursor-pointer"
            >
              {lang === 'en' ? 'Done' : 'সম্পন্ন'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Icon helpers to bypass import restrictions
function SunlitSunIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}
