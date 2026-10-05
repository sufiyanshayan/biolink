/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { UserProfile, LinkItem, SocialItem, ClickAnalytic } from '../types';
import { translations } from '../locales';
import { 
  Globe, Github, Youtube, Instagram, Linkedin, Twitter, AlertTriangle, 
  HelpCircle, Sparkles, BookOpen, Heart, Mail, ExternalLink, ArrowLeft, Compass,
  Phone, Send, Info, MessageCircle, User, X
} from 'lucide-react';

// Custom SVG and Lucide Icons for 100% reliable icon rendering (Request 3)
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const WhatsappIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.863-9.864.001-2.636-1.023-5.115-2.885-6.978C16.584 1.9 14.102.878 11.46.878 6.023.878 1.6 5.3 1.597 10.743c-.001 1.696.443 3.354 1.288 4.798l-.997 3.642 3.732-.979z" />
  </svg>
);

const TiktokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.01.08 1.53.63 3.02 1.59 4.17.97 1.13 2.34 1.86 3.83 2.06v3.82c-1.88-.12-3.64-.88-4.99-2.18-.08 1.89-.13 3.78-.2 5.67-.14 2.34-.91 4.67-2.45 6.42-1.84 2.14-4.66 3.26-7.46 2.94-2.86-.3-5.46-2.13-6.61-4.78-1.29-2.87-.78-6.49 1.34-8.77 1.81-1.99 4.64-2.73 7.18-2.01v3.94c-1.25-.41-2.69-.11-3.66.77-.92.81-1.28 2.12-.99 3.31.25 1.15 1.15 2.06 2.29 2.31 1.24.29 2.6-.09 3.42-1.05.88-.98 1.12-2.39 1.09-3.66-.01-4.22.01-8.44-.01-12.66z" />
  </svg>
);

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0C5.347 0 0 5.347 0 11.944c0 6.595 5.347 11.944 11.944 11.944 6.595 0 11.944-5.349 11.944-11.944C23.888 5.347 18.539 0 11.944 0zm5.72 8.358l-1.916 9.037c-.144.64-.52.798-1.056.498l-2.92-2.152-1.408 1.355c-.156.156-.287.287-.588.287l.21-2.969 5.41-4.886c.235-.208-.052-.324-.362-.117l-6.685 4.208-2.875-.9c-.624-.196-.638-.624.13-.924l11.233-4.33c.52-.196.974.114.811.832z" />
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const renderSocialIcon = (platform: string, className = "w-4 h-4") => {
  if (platform === 'facebook') {
    return <img src="https://cdn.simpleicons.org/facebook/000000" alt="Facebook" className={`${className} shrink-0 object-contain`} />;
  }
  if (platform === 'instagram') {
    return <img src="https://cdn.simpleicons.org/instagram/000000" alt="Instagram" className={`${className} shrink-0 object-contain`} />;
  }
  if (platform === 'whatsapp') {
    return <img src="https://cdn.simpleicons.org/whatsapp/000000" alt="WhatsApp" className={`${className} shrink-0 object-contain`} />;
  }
  if (platform === 'tiktok') {
    return <img src="https://cdn.simpleicons.org/tiktok/000000" alt="TikTok" className={`${className} shrink-0 object-contain`} />;
  }
  if (platform === 'telegram') {
    return <img src="https://cdn.simpleicons.org/telegram/000000" alt="Telegram" className={`${className} shrink-0 object-contain`} />;
  }
  if (platform === 'twitter') {
    return <img src="https://cdn.simpleicons.org/x/000000" alt="Twitter" className={`${className} shrink-0 object-contain`} />;
  }
  if (platform === 'phone') {
    return <img src="https://cdn-icons-png.flaticon.com/512/597/597177.png" alt="Phone" className={`${className} shrink-0 object-contain`} />;
  }
  if (platform === 'website') {
    return <img src="https://cdn-icons-png.flaticon.com/512/1006/1006771.png" alt="Website" className={`${className} shrink-0 object-contain`} />;
  }
  if (platform === 'about') {
    return <Info className={className} />;
  }
  
  return <Globe className={className} />;
};

interface PublicProfileProps {
  lang: 'en' | 'bn';
  username: string;
  users: UserProfile[];
  links: LinkItem[];
  socials: SocialItem[];
  analytics: ClickAnalytic[];
  onAddAnalytic: (newAnalytic: ClickAnalytic) => void;
  onGoBack: () => void;
}

export default function PublicProfile({
  lang,
  username,
  users,
  links,
  socials,
  analytics,
  onAddAnalytic,
  onGoBack
}: PublicProfileProps) {
  const t = translations[lang];
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [selectedAboutText, setSelectedAboutText] = useState<string | null>(null);
  const [selectedAboutTitle, setSelectedAboutTitle] = useState<string>('');

  // Find user by username
  const cleanUsername = username.trim().toLowerCase().replace('@', '');
  const user = users.find(u => u.username.toLowerCase() === cleanUsername);

  // Auto-record page view when profile loaded
  useEffect(() => {
    if (user && user.enabled) {
      // Create 'profile_view' event
      const viewEvent: ClickAnalytic = {
        id: `view-real-${Math.random().toString(36).substring(2, 11)}`,
        userId: user.id,
        targetId: 'profile_view',
        timestamp: new Date().toISOString(),
        browser: getBrowserName(),
        device: getDeviceType(),
        country: 'Bangladesh' // Static simulated geography for native precision
      };
      onAddAnalytic(viewEvent);
    }
  }, [cleanUsername, user?.id]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white border border-slate-200 rounded-2xl p-8 max-w-sm shadow-sm space-y-4"
        >
          <HelpCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">{t.pageNotFound}</h2>
          <p className="text-xs text-slate-500">{t.pageNotFoundText}</p>
          <button
            onClick={onGoBack}
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl w-full transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.backToHome}
          </button>
        </motion.div>
      </div>
    );
  }

  // Account disabled check
  if (!user.enabled && user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-slate-200 rounded-2xl p-8 max-w-sm shadow-sm space-y-4"
        >
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">{t.accountInactive}</h2>
          <p className="text-xs text-slate-500">
            {lang === 'en' 
              ? "This creator profile is temporarily inactive." 
              : "এই ক্রিয়েটর প্রোফাইলটি সাময়িকভাবে বন্ধ আছে।"}
          </p>
          <button
            onClick={onGoBack}
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl w-full transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.backToHome}
          </button>
        </motion.div>
      </div>
    );
  }

  // Under Maintenance Check
  if (user.maintenanceMode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-2xl p-8 max-w-sm shadow-sm space-y-4"
        >
          <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mx-auto animate-bounce">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">{t.underMaintenance}</h2>
          <p className="text-xs text-slate-500">{t.maintenanceText}</p>
          <button
            onClick={onGoBack}
            className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 px-4 rounded-xl w-full transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.backToHome}
          </button>
        </motion.div>
      </div>
    );
  }

  // Filter and sort links
  const userLinks = links.filter(link => {
    if (link.userId !== user.id || !link.visible) return false;
    
    // Scheduled links check
    const now = new Date();
    if (link.scheduleStart && new Date(link.scheduleStart) > now) {
      return false; // Not yet started
    }
    if (link.scheduleEnd && new Date(link.scheduleEnd) < now) {
      return false; // Expired
    }
    return true;
  }).sort((a, b) => a.order - b.order);

  const userSocials = socials.filter(s => s.userId === user.id && s.visible).sort((a, b) => a.order - b.order);

  // Helper function to check if string is a pure URL (Request 2)
  const isPureUrl = (str: string) => {
    const trimmed = str.trim();
    if (trimmed.includes(' ')) return false;
    try {
      if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
        new URL(trimmed);
        return true;
      }
      return /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(trimmed);
    } catch {
      return false;
    }
  };

  // Helper to split and render text with clickable URLs inline (Request 2)
  const renderAboutContent = (text: string) => {
    if (!text) return null;
    const urlRegex = /((?:https?:\/\/|www\.)[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}[^\s]*)/gi;
    const parts = text.split(urlRegex);
    return parts.map((part, index) => {
      const isPartUrl = /^(https?:\/\/|www\.)/i.test(part) || /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(part);
      if (isPartUrl) {
        let href = part;
        if (!href.startsWith('http://') && !href.startsWith('https://')) {
          href = 'https://' + href;
        }
        return (
          <a
            key={index}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold break-all inline"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const PLATFORM_ORDER = [
    'facebook',
    'instagram',
    'whatsapp',
    'tiktok',
    'telegram',
    'twitter',
    'phone',
    'about',
    'website'
  ];

  // Split about items into standard buttons (if pure URL) vs content cards (if text + links)
  const sortedSocialButtons = [...userSocials]
    .sort((a, b) => {
      const idxA = PLATFORM_ORDER.indexOf(a.platform);
      const idxB = PLATFORM_ORDER.indexOf(b.platform);
      const orderA = idxA === -1 ? 999 : idxA;
      const orderB = idxB === -1 ? 999 : idxB;
      
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return (a.order || 0) - (b.order || 0);
    });

  const aboutMeCards: any[] = [];

  // Click Tracking hook
  const handleRecordClick = (targetId: string, url: string) => {
    const clickEvent: ClickAnalytic = {
      id: `click-real-${Math.random().toString(36).substring(2, 11)}`,
      userId: user.id,
      targetId,
      timestamp: new Date().toISOString(),
      browser: getBrowserName(),
      device: getDeviceType(),
      country: 'Bangladesh'
    };
    onAddAnalytic(clickEvent);
  };

  // Pre-calculated styling parameters based on User Profile preferences
  const customStyles = {
    background: user.theme === 'custom' ? user.customBg : (user.theme === 'dark' ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' : '#fafaf9'),
    color: user.theme === 'custom' ? user.customText : (user.theme === 'dark' ? '#f8fafc' : '#1c1917'),
    buttonBg: user.theme === 'custom' ? user.customBtnBg : (user.theme === 'dark' ? '#1e293b' : '#ffffff'),
    buttonText: user.theme === 'dark' ? '#f8fafc' : '#1c1917',
    buttonRadius: user.theme === 'custom' ? (user.customBtnRadius === 'none' ? '0px' : user.customBtnRadius === 'md' ? '12px' : '9999px') : '12px',
    border: user.theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
  };

  return (
    <div 
      style={{ background: customStyles.background, color: customStyles.color }}
      className="min-h-screen py-16 px-4 flex flex-col items-center transition-colors duration-300 relative"
    >

      <div className="w-full max-w-md flex flex-col items-center space-y-6">
        {/* Avatar lockup */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          {user.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-24 h-24 rounded-full object-cover shadow-md border-2 border-slate-300/30"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-slate-200/50 flex items-center justify-center text-slate-400 shadow-inner">
              <User className="w-12 h-12" />
            </div>
          )}
        </motion.div>

        {/* Bio information */}
        <div className="text-center space-y-2">
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl md:text-2xl font-bold tracking-tight font-sans"
          >
            {user.name}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm max-w-xs mx-auto leading-relaxed opacity-90 mt-2 font-medium"
          >
            {user.bio}
          </motion.p>

          {/* Rich Content Cards for About Me (Text + Links) (Request 2) */}
          {aboutMeCards.map((soc) => (
            <motion.div
              key={soc.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs max-w-sm w-full mx-auto mt-4 bg-slate-50/50 dark:bg-slate-900/40 p-4.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 leading-relaxed font-sans text-left shadow-xs space-y-2.5"
              style={{ color: customStyles.color }}
            >
              <div className="flex items-center gap-2 border-b border-slate-200/40 dark:border-slate-700/40 pb-2 mb-1.5 font-bold">
                <span className="p-1 rounded bg-black/5 flex items-center justify-center">
                  {renderSocialIcon('about', 'w-4 h-4')}
                </span>
                <span className="text-[12px]">{soc.title || (lang === 'en' ? 'About Me' : 'আমার সম্পর্কে')}</span>
              </div>
              <div className="whitespace-pre-line leading-relaxed font-medium opacity-90 break-words text-slate-700 dark:text-slate-300">
                {renderAboutContent(soc.url)}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Links lists rendering (Custom Buttons + Social Links merged with Brand Logos) */}
        <div className="w-full space-y-3.5 pt-4">
          {sortedSocialButtons.map((soc, idx) => {
            const isAboutTextCard = soc.platform === 'about' && !isPureUrl(soc.url);

            if (isAboutTextCard) {
              return (
                <motion.button
                  key={soc.id}
                  onClick={() => {
                    setSelectedAboutText(soc.url);
                    setSelectedAboutTitle(soc.title || (lang === 'en' ? 'About Me' : 'আমার সম্পর্কে'));
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  style={{ 
                    backgroundColor: customStyles.buttonBg, 
                    borderRadius: customStyles.buttonRadius,
                    border: customStyles.border,
                    color: customStyles.color
                  }}
                  className="flex items-center justify-center gap-3.5 p-3 text-[11px] font-bold text-center select-none w-full shadow-xs hover:translate-y-[-2px] hover:shadow-md transition-all active:scale-[0.99] font-sans relative cursor-pointer"
                >
                  <span className="p-1 rounded bg-black/5 shrink-0 flex items-center justify-center text-current">
                    {renderSocialIcon(soc.platform, "w-4 h-4")}
                  </span>
                  <span className="font-semibold text-center truncate">{soc.title || (lang === 'en' ? 'About Me' : 'আমার সম্পর্কে')}</span>
                </motion.button>
              );
            }

            return (
              <motion.a
                key={soc.id}
                href={soc.url.startsWith('http') || soc.url.startsWith('tel:') || soc.url.startsWith('mailto:') ? soc.url : undefined}
                target={soc.url.startsWith('http') ? "_blank" : undefined}
                rel="noopener noreferrer"
                onClick={() => soc.url.startsWith('http') && handleRecordClick(`social_${soc.platform}`, soc.url)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, ease: [0.16, 1, 0.3, 1] }}
                style={{ 
                  backgroundColor: customStyles.buttonBg, 
                  borderRadius: customStyles.buttonRadius,
                  border: customStyles.border,
                  color: customStyles.color
                }}
                className="flex items-center justify-center gap-3.5 p-3 text-[11px] font-bold text-center select-none w-full shadow-xs hover:translate-y-[-2px] hover:shadow-md transition-all active:scale-[0.99] font-sans relative"
              >
                <span className="p-1 rounded bg-black/5 shrink-0 flex items-center justify-center text-current">
                  {renderSocialIcon(soc.platform, "w-4 h-4")}
                </span>
                <span className="font-semibold text-center truncate">{soc.title || soc.platform.charAt(0).toUpperCase() + soc.platform.slice(1)}</span>
              </motion.a>
            );
          })}

          {userLinks.map((link, idx) => {
            const LinkIcon = getLinkIcon(link.icon);
            return (
              <motion.a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleRecordClick(link.id, link.url)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (sortedSocialButtons.length + idx) * 0.05, ease: [0.16, 1, 0.3, 1] }}
                style={{ 
                  backgroundColor: customStyles.buttonBg, 
                  borderRadius: customStyles.buttonRadius,
                  border: customStyles.border,
                  color: customStyles.color
                }}
                className="flex items-center justify-center gap-3.5 p-3 text-[11px] font-bold text-center select-none w-full shadow-xs hover:translate-y-[-2px] hover:shadow-md transition-all active:scale-[0.99] font-sans relative"
              >
                <span className="p-1 rounded bg-black/5 shrink-0 flex items-center justify-center text-current">
                  <LinkIcon className="w-4 h-4 shrink-0" />
                </span>
                <span className="font-semibold text-center truncate">{link.title}</span>
              </motion.a>
            );
          })}

          {sortedSocialButtons.length === 0 && userLinks.length === 0 && (
            <div className="text-center py-12 text-sm opacity-60">
              {lang === 'en' ? "This creator hasn't published any links yet." : "এই ক্রিয়েটর এখনও কোনো লিংক প্রকাশ করেননি।"}
            </div>
          )}
        </div>

        {/* Brand footer */}
        <div className="pt-16 text-center">
          <p className="text-[10px] font-bold tracking-widest uppercase opacity-45">
            {lang === 'en' ? 'Powered By' : 'পরিচালনায়'} <span className="font-semibold">{t.appName}</span>
          </p>
        </div>
      </div>

      {/* About Me Popup Modal (Request 1) */}
      {selectedAboutText && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 md:p-6 max-w-sm w-full border border-slate-100 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <h3 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                <Info className="w-4 h-4" />
                {selectedAboutTitle}
              </h3>
              <button
                onClick={() => setSelectedAboutText(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="max-h-72 overflow-y-auto text-xs leading-relaxed text-slate-600 dark:text-slate-300 font-medium whitespace-pre-line py-1 pr-1 custom-scrollbar break-words">
              {renderAboutContent(selectedAboutText)}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedAboutText(null)}
                className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-xs cursor-pointer text-center"
              >
                {lang === 'en' ? 'Close' : 'বন্ধ করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Brand Logo Renderer for premium original visual presence
function getOfficialBrandLogo(platform: string) {
  switch (platform) {
    case 'facebook': return FacebookLogo;
    case 'instagram': return InstagramLogo;
    case 'whatsapp': return WhatsAppLogo;
    case 'tiktok': return TikTokLogo;
    case 'telegram': return TelegramLogo;
    case 'twitter': return TwitterLogo;
    case 'phone': return PhoneLogo;
    case 'about': return UserLogo;
    case 'website':
    default:
      return WebsiteLogo;
  }
}

// Brand SVG Path definitions
function FacebookLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="#1877F2" {...props}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function InstagramLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="url(#ig-grad)" strokeWidth="2.5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="url(#ig-grad)" strokeWidth="2.5"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="url(#ig-grad)" strokeWidth="3"/>
      <defs>
        <radialGradient id="ig-grad" cx="0%" cy="100%" r="150%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
    </svg>
  );
}

function WhatsAppLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="#25D366" {...props}>
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.06 11.948.06c3.176.001 6.161 1.24 8.403 3.487 2.243 2.246 3.479 5.23 3.477 8.406-.003 6.593-5.34 11.882-11.892 11.882-2.01-.001-3.987-.51-5.742-1.48L0 24zm6.59-4.846c1.66.983 3.524 1.503 5.433 1.505 5.54 0 10.05-4.484 10.053-10.007.002-2.675-1.037-5.191-2.927-7.085-1.89-1.894-4.403-2.938-7.079-2.939-5.544 0-10.057 4.484-10.06 10.012-.001 1.916.504 3.79 1.464 5.449l-.994 3.633 3.733-.973zm11.567-7.859c-.302-.151-1.785-.882-2.057-.981-.273-.099-.471-.148-.669.151-.197.299-.765.981-.938 1.179-.172.197-.346.223-.648.072-1.07-.534-1.868-.94-2.602-1.776-.328-.31-.645-.733-.878-1.215-.172-.299-.019-.461.13-.611.135-.135.302-.349.453-.523.151-.174.201-.298.302-.497.101-.198.05-.372-.025-.521-.075-.15-.669-1.612-.916-1.72-.243-.115-.478-.096-.65-.078-.172.018-.765.183-1.034.739-.269.55-.269 1.62.13 2.274.135.223.765 1.411 1.83 1.968 1.127.587 2.054.764 2.894.75.877-.015 1.785-.479 2.037-.916.251-.437.251-.812.176-.981-.075-.171-.274-.271-.575-.421z"/>
    </svg>
  );
}

function TikTokLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="#000000" {...props}>
      <path d="M12.525.02c1.31 0 2.59.32 3.73.93v5.03c-1.12-.52-2.35-.78-3.59-.78V12c0 2.2-1.78 3.98-3.98 3.98a3.98 3.98 0 0 1-3.98-3.98c0-2.2 1.78-3.98 3.98-3.98.32 0 .64.04.95.11V3.13c-3.11.23-5.58 2.82-5.58 5.99 0 3.3 2.69 5.98 5.99 5.98s5.99-2.68 5.99-5.98V4.84c1.47 1.05 3.26 1.64 5.12 1.64v-5.2c-.88 0-1.74-.22-2.52-.63V0h-4.13z"/>
    </svg>
  );
}

function TelegramLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="#0088cc" {...props}>
      <path d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12z" fill="#0088cc"/>
      <path d="M5.4 12c4-1.7 6.6-2.8 8-3.4 3.7-1.5 4.5-1.8 5-1.8.2 0 .6.1.9.4.2.2.3.5.2.9-.2 1.1-1 6-1.4 8.7-.2 1.1-.6 1.5-.9 1.5-.2 0-.5-.1-.8-.3-.4-.3-1.6-1.1-2.4-1.7-.4-.3-.8-.7-.4-1.2.1-.1.9-.9 1.8-1.7.9-.9 1.8-1.8 1.9-2 .1-.2.1-.4-.1-.5-.1-.1-.4 0-.6.1-.2.1-3.1 1.9-4.4 2.8-.4.3-.8.4-1.1.4-.4 0-1.2-.2-1.8-.4-.7-.2-1.3-.4-1.3-.8 0-.2.3-.5.9-.8z" fill="#FFF"/>
    </svg>
  );
}

function TwitterLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 7.747 8.502 11.24H16.17l-5.214-6.817L4.99 21.25H1.68l7.73-8.29L1.354 2.25h6.834l4.69 6.204L18.244 2.25zm-1.161 17.02h1.833L7.084 4.126H5.117L17.083 19.27z"/>
    </svg>
  );
}

function PhoneLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.79 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" fill="#10B981" stroke="#FFF" strokeWidth="0.5"/>
    </svg>
  );
}

function UserLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill="#F43F5E" stroke="#FFF" strokeWidth="0.5"/>
      <circle cx="12" cy="7" r="4" fill="#F43F5E" stroke="#FFF" strokeWidth="0.5"/>
    </svg>
  );
}

function WebsiteLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" fill="#6366F1" stroke="#FFF" strokeWidth="0.5"/>
      <line x1="2" y1="12" x2="22" y2="12" stroke="#FFF" strokeWidth="1"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="#FFF" strokeWidth="1"/>
    </svg>
  );
}

function getLinkIcon(name: string) {
  switch (name) {
    case 'Github': return Github;
    case 'Youtube': return Youtube;
    case 'Instagram': return Instagram;
    case 'BookOpen': return BookOpen;
    case 'Sparkles': return Sparkles;
    case 'Heart': return Heart;
    default: return Globe;
  }
}

// Browser & Device detection helpers for high fidelity analytics tracking
function getBrowserName() {
  const ua = navigator.userAgent;
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Firefox')) return 'Firefox';
  return 'Edge';
}

function getDeviceType() {
  const ua = navigator.userAgent;
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    return 'Mobile';
  }
  return 'Desktop';
}
