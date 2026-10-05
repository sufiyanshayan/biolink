/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  getDB, saveDB, BRAND_LOGO_URL 
} from './mockData';
import { UserProfile, LinkItem, SocialItem, ClickAnalytic, Language } from './types';
import { translations } from './locales';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/AdminPanel';
import PublicProfile from './components/PublicProfile';
import { 
  Globe, LogOut, Shield, Settings, Key, User, Menu, X, 
  Sparkles, CheckCircle, AlertCircle, Eye, RefreshCw, Languages 
} from 'lucide-react';

export default function App() {
  // Database state
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [socials, setSocials] = useState<SocialItem[]>([]);
  const [analytics, setAnalytics] = useState<ClickAnalytic[]>([]);

  // App global state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [lang, setLang] = useState<Language>('en');
  const [currentHash, setCurrentHash] = useState<string>('');
  
  // Modals state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAiHelperModal, setShowAiHelperModal] = useState(false);
  
  // Change password form state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  // AI Assistant form state
  const [aiCategory, setAiCategory] = useState<'tech' | 'travel' | 'lifestyle' | 'music' | 'art'>('tech');
  const [aiCustomPrompt, setAiCustomPrompt] = useState('');
  const [aiResultBio, setAiResultBio] = useState('');
  const [aiResultLinks, setAiResultLinks] = useState<{ title: string; url: string; icon: string }[]>([]);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Localization translator helper
  const t = translations[lang];

  // Initialize DB and Route Listening
  const [routeState, setRouteState] = useState(0);

  useEffect(() => {
    const db = getDB();
    setUsers(db.users);
    setLinks(db.links);
    setSocials(db.socials);
    setAnalytics(db.analytics);

    const handleRouteChange = () => {
      setCurrentHash(window.location.hash);
      setRouteState(prev => prev + 1);
    };

    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);

    // Support custom programmatic pushState transitions
    const originalPushState = window.history.pushState;
    window.history.pushState = function(...args) {
      originalPushState.apply(this, args);
      handleRouteChange();
    };

    // Check if user session was active
    const savedUser = localStorage.getItem('bongolink_session');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }

    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
      window.history.pushState = originalPushState;
    };
  }, []);

  // Save state back to localStorage on any updates
  const handleUpdateUsers = (updatedUsers: UserProfile[]) => {
    setUsers(updatedUsers);
    
    // Auto-clean up links, socials, and analytics of deleted users to maintain database integrity
    const activeUserIds = updatedUsers.map(u => u.id);
    const cleanedLinks = links.filter(l => activeUserIds.includes(l.userId));
    const cleanedSocials = socials.filter(s => activeUserIds.includes(s.userId));
    const cleanedAnalytics = analytics.filter(a => activeUserIds.includes(a.userId));
    
    setLinks(cleanedLinks);
    setSocials(cleanedSocials);
    setAnalytics(cleanedAnalytics);
    
    saveDB({ 
      users: updatedUsers, 
      links: cleanedLinks, 
      socials: cleanedSocials, 
      analytics: cleanedAnalytics 
    });
    
    // Update active user session if their profile was updated
    if (currentUser) {
      const activeUserUpdated = updatedUsers.find(u => u.id === currentUser.id);
      if (activeUserUpdated) {
        setCurrentUser(activeUserUpdated);
        localStorage.setItem('bongolink_session', JSON.stringify(activeUserUpdated));
      }
    }
  };

  const handleUpdateProfile = (updatedProfile: UserProfile) => {
    const updatedUsers = users.map(u => u.id === updatedProfile.id ? updatedProfile : u);
    handleUpdateUsers(updatedUsers);
  };

  const handleUpdateLinks = (updatedLinks: LinkItem[]) => {
    setLinks(updatedLinks);
    saveDB({ users, links: updatedLinks, socials, analytics });
  };

  const handleUpdateSocials = (updatedSocials: SocialItem[]) => {
    setSocials(updatedSocials);
    saveDB({ users, links, socials: updatedSocials, analytics });
  };

  const handleAddAnalytic = (newAnalytic: ClickAnalytic) => {
    const updated = [...analytics, newAnalytic];
    setAnalytics(updated);
    saveDB({ users, links, socials, analytics: updated });
  };

  // Auth callbacks
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('bongolink_session', JSON.stringify(user));
    window.location.hash = '#dashboard';
  };

  const handleRegisterSuccess = (newUser: UserProfile) => {
    const updated = [...users, newUser];
    handleUpdateUsers(updated);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('bongolink_session');
    window.location.hash = '';
  };

  // Change Password logic
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (!currentUser) return;

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      setPassError(t.requiredFields);
      return;
    }

    if (oldPassword !== currentUser.password) {
      setPassError(lang === 'en' ? "Incorrect current password." : "বর্তমান পাসওয়ার্ডটি সঠিক নয়।");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPassError(t.passwordMismatch);
      return;
    }

    // Update password in DB
    const updatedUsers = users.map(u => {
      if (u.id === currentUser.id) {
        return { ...u, password: newPassword };
      }
      return u;
    });

    handleUpdateUsers(updatedUsers);
    setPassSuccess(t.passwordChanged);
    
    setOldPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    
    setTimeout(() => {
      setShowPasswordModal(false);
      setPassSuccess('');
    }, 1500);
  };

  // Delete own account handler
  const handleDeleteAccount = (password: string) => {
    if (!currentUser) return { success: false, error: "Not logged in." };
    if (password !== currentUser.password) {
      return { success: false, error: t.incorrectPassword };
    }

    const updatedUsers = users.filter(u => u.id !== currentUser.id);
    const updatedLinks = links.filter(l => l.userId !== currentUser.id);
    const updatedSocials = socials.filter(s => s.userId !== currentUser.id);
    const updatedAnalytics = analytics.filter(a => a.userId !== currentUser.id);

    setUsers(updatedUsers);
    setLinks(updatedLinks);
    setSocials(updatedSocials);
    setAnalytics(updatedAnalytics);
    
    saveDB({
      users: updatedUsers,
      links: updatedLinks,
      socials: updatedSocials,
      analytics: updatedAnalytics
    });

    handleLogout();
    return { success: true };
  };

  // Gemini / AI Creator Assistant Simulation & Generation
  const handleGenerateAiProfile = () => {
    setAiGenerating(true);
    setAiResultBio('');
    setAiResultLinks([]);

    setTimeout(() => {
      let bio = '';
      let defaultLinks: { title: string; url: string; icon: string }[] = [];

      switch (aiCategory) {
        case 'tech':
          bio = lang === 'en'
            ? "💻 Full-Stack Engineer & AI Researcher. Exploring future tech, building sleek web applications, and sharing code insights daily."
            : "💻 ফুল-স্ট্যাক ইঞ্জিনিয়ার এবং এআই গবেষক। প্রতিনিয়ত প্রযুক্তি চর্চা করছি এবং কোডের নানা তথ্য ও সমাধান শেয়ার করছি।";
          defaultLinks = [
            { title: "🐙 Explore my GitHub Repositories", url: "https://github.com/my-username", icon: "Github" },
            { title: "🌐 Personal Web Developer Portfolio", url: "https://mywork.dev", icon: "Globe" },
            { title: "🎥 Coding Tutorials & Development Logs", url: "https://youtube.com/my-channel", icon: "Youtube" }
          ];
          break;
        case 'travel':
          bio = lang === 'en'
            ? "✈️ Travel Journalist & Photographer. Wandering along the rivers of Bengal and documenting high mountain ranges. Journey with me!"
            : "✈️ ট্রাভেল জার্নালিস্ট এবং আলোকচিত্রী। বাংলার নদীপথ থেকে শুরু করে পাহাড়ের চূড়ার গল্প তুচ্ছ করছি। আমার সাথে ঘুরে আসুন!";
          defaultLinks = [
            { title: "📸 Travel Photography on Instagram", url: "https://instagram.com/my-travels", icon: "Instagram" },
            { title: "🎥 Bangladesh & Beyond Travel Vlogs", url: "https://youtube.com/my-channel", icon: "Youtube" },
            { title: "📖 Read my Detailed Travel Journal", url: "https://myblog.com", icon: "BookOpen" }
          ];
          break;
        case 'lifestyle':
          bio = lang === 'en'
            ? "✨ Mindful Living Blogger & Organic Designer. Sharing tips on minimal living, clean eating, and daily aesthetic curation."
            : "✨ মাইন্ডফুল লিভিং ব্লগার এবং অর্গানিক ডিজাইনার। মিনিমালিস্টিক লাইফস্টাইল এবং নান্দনিক ফ্যাশন টিপস শেয়ার করছি।";
          defaultLinks = [
            { title: "📖 Minimal Living Guide E-Book", url: "https://myblog.com/ebook", icon: "BookOpen" },
            { title: "📸 Mindful Lifestyle Curations", url: "https://instagram.com/my-aesthetic", icon: "Instagram" }
          ];
          break;
        case 'music':
          bio = lang === 'en'
            ? "🎵 Musician & Sound Architect. Blending traditional Bengali folk melodies with modern ambient electronics. Listen to my tracks!"
            : "🎵 সংগীতশিল্পী ও সাউন্ড আর্কিটেক্ট। আধুনিক অ্যাম্বিয়েন্ট ইলেকট্রনিক্সের সাথে বাংলার ঐতিহ্যবাহী লোকজ সুরের মেলবন্ধন।";
          defaultLinks = [
            { title: "🎵 Listen to my Ambient Folk Tracks", url: "https://soundcloud.com/my-tracks", icon: "Globe" },
            { title: "🎥 Live Performance Videos", url: "https://youtube.com/my-channel", icon: "Youtube" }
          ];
          break;
        case 'art':
          bio = lang === 'en'
            ? "🎨 Visual Artist & Calligrapher. Crafting modern digital canvases and traditional ink strokes. Custom commissions are open."
            : "🎨 ভিজ্যুয়াল আর্টিস্ট এবং ক্যালিগ্রাফার। মডার্ন ডিজিটাল ক্যানভাস এবং ট্র্যাডিশনাল ক্যালিগ্রাফির সমন্বয় করছি।";
          defaultLinks = [
            { title: "🎨 Personal Online Art Gallery", url: "https://myart.com", icon: "Globe" },
            { title: "❤️ Order Custom Commission Work", url: "https://myart.com/commissions", icon: "Heart" }
          ];
          break;
      }

      setAiResultBio(bio);
      setAiResultLinks(defaultLinks);
      setAiGenerating(false);
    }, 1200);
  };

  const handleApplyAiProfile = () => {
    if (!currentUser) return;

    // Apply bio
    const updatedProfile = { ...currentUser, bio: aiResultBio };
    handleUpdateProfile(updatedProfile);

    // Apply links
    const newLinks: LinkItem[] = aiResultLinks.map((link, idx) => ({
      id: `link-ai-${Math.random().toString(36).substring(2, 11)}`,
      userId: currentUser.id,
      title: link.title,
      url: link.url,
      icon: link.icon,
      visible: true,
      scheduleStart: '',
      scheduleEnd: '',
      order: links.length + idx
    }));

    handleUpdateLinks([...links, ...newLinks]);
    setShowAiHelperModal(false);
    setAiResultBio('');
    setAiResultLinks([]);
  };

  // Determine Routing Page View (Supports hash #@username and pathname /username)
  let targetUsername = '';
  let isPublicProfile = false;

  const pathSegment = window.location.pathname.substring(1);
  const hashSegment = window.location.hash;

  if (hashSegment.startsWith('#@')) {
    targetUsername = hashSegment.substring(2).trim().toLowerCase();
    isPublicProfile = true;
  } else if (pathSegment && pathSegment !== 'index.html' && pathSegment !== 'dashboard' && pathSegment !== 'login') {
    targetUsername = pathSegment.replace('@', '').trim().toLowerCase();
    isPublicProfile = true;
  }

  if (isPublicProfile && targetUsername) {
    return (
      <PublicProfile
        lang={lang}
        username={targetUsername}
        users={users}
        links={links}
        socials={socials}
        analytics={analytics}
        onAddAnalytic={handleAddAnalytic}
        onGoBack={() => {
          window.history.pushState({}, '', '/');
          window.location.hash = '';
          // Dispatch popstate event to trigger app routing re-render
          window.dispatchEvent(new Event('popstate'));
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Premium Top Bar Navigation Contract */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          
          {/* Brand Zone (Single element wordmark) */}
          <a href="#" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity shrink-0">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-100 shadow-sm">
              <img 
                src={BRAND_LOGO_URL} 
                alt="BongoLink" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900 font-sans">
              {t.appName}
            </span>
          </a>

          {/* Nav zone (4-6 links) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-500">
            <a href="#" className="hover:text-slate-900 transition-colors">{lang === 'en' ? 'Home' : 'হোম'}</a>
            {currentUser && (
              <>
                <a href="#dashboard" className="hover:text-slate-900 transition-colors">{t.dashboard}</a>
                <button 
                  onClick={() => setShowAiHelperModal(true)} 
                  className="hover:text-indigo-600 transition-colors flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Helper
                </button>
                <button 
                  onClick={() => setShowPasswordModal(true)} 
                  className="hover:text-indigo-600 transition-colors flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5" />
                  {t.resetPassword}
                </button>
              </>
            )}
          </nav>

          {/* Actions zone */}
          <div className="flex items-center gap-3">
            {/* Language toggle element (only shown when logged out or for admin) */}
            {(!currentUser || currentUser.role === 'admin') && (
              <button
                onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
                className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-1.5 px-3 rounded-lg transition-all cursor-pointer"
                title="Change Language / ভাষা পরিবর্তন করুন"
              >
                <Languages className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'বাংলা' : 'English'}</span>
              </button>
            )}

            {/* User credentials / Log out */}
            {currentUser ? (
              currentUser.role === 'admin' && (
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline text-xs font-semibold text-slate-600">
                    {t.admin}
                  </span>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold py-1.5 px-3 rounded-lg transition-all cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t.logout}</span>
                  </button>
                </div>
              )
            ) : (
              <a
                href="#login"
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-1.5 px-4 rounded-lg transition-all"
              >
                {t.login}
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full">
        <AnimatePresence mode="wait">
          {(!currentUser || currentHash === '#login') && (
            <motion.div
              key="auth"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Auth
                lang={lang}
                users={users}
                onLoginSuccess={handleLoginSuccess}
                onRegisterSuccess={handleRegisterSuccess}
              />
            </motion.div>
          )}

          {currentUser && (currentHash === '#dashboard' || currentHash === '') && (
            <motion.div
              key="portal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Header Selector to switch between Admin Panel & Personal Creator space */}
              {currentUser.role === 'admin' && (
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.adminConsole}</span>
                </div>
              )}

              {currentUser.role === 'admin' ? (
                <AdminPanel
                  lang={lang}
                  users={users}
                  currentUser={currentUser}
                  onUpdateUsers={handleUpdateUsers}
                />
              ) : (
                <Dashboard
                  lang={lang}
                  currentUser={currentUser}
                  users={users}
                  links={links}
                  socials={socials}
                  analytics={analytics}
                  onUpdateProfile={handleUpdateProfile}
                  onUpdateLinks={handleUpdateLinks}
                  onUpdateSocials={handleUpdateSocials}
                  onDeleteAccount={handleDeleteAccount}
                  onLogout={handleLogout}
                  onSetLang={setLang}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Global Modals: Reset Password */}
      {showPasswordModal && currentUser && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm w-full shadow-lg space-y-4"
          >
            <div>
              <h3 className="text-base font-bold text-slate-900">{t.resetPassword}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {lang === 'en' 
                  ? "Ensure your security by changing your account credentials regularly."
                  : "নিয়মিত পাসওয়ার্ড পরিবর্তন করে অ্যাকাউন্ট সুরক্ষিত রাখুন।"}
              </p>
            </div>

            {passError && (
              <div className="flex items-start gap-2 p-3 bg-red-50 text-red-700 text-[11px] rounded-xl border border-red-200/60">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <div>{passError}</div>
              </div>
            )}

            {passSuccess && (
              <div className="flex items-start gap-2 p-3 bg-emerald-50 text-emerald-800 text-[11px] rounded-xl border border-emerald-200/60">
                <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <div>{passSuccess}</div>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {lang === 'en' ? 'Current Password' : 'বর্তমান পাসওয়ার্ড'}
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {lang === 'en' ? 'New Password' : 'নতুন পাসওয়ার্ড'}
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  {t.confirmPassword}
                </label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPassError('');
                    setPassSuccess('');
                  }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 rounded-xl"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 rounded-xl"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Global Modals: Gemini AI Creator Helper */}
      {showAiHelperModal && currentUser && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-lg space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse-subtle" />
                <h3 className="text-base font-bold text-slate-900">Gemini Creator Assistant</h3>
              </div>
              <button 
                onClick={() => setShowAiHelperModal(false)}
                className="p-1 hover:bg-slate-100 rounded-full text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              {lang === 'en' 
                ? "Let Gemini suggest a premium professional biography and a customized sequence of default links based on your creative category!"
                : "জেমিনি এআই-এর মাধ্যমে আপনার ক্যাটাগরি অনুযায়ী একটি আকর্ষণীয় বায়ো এবং প্রয়োজনীয় লিংকের সাজেশন্স তৈরি করুন!"}
            </p>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  Select Creative Category
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['tech', 'travel', 'lifestyle', 'music', 'art'] as const).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setAiCategory(cat)}
                      className={`py-2 px-1 text-center rounded-lg text-[10px] font-bold capitalize transition-all border ${
                        aiCategory === cat
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerateAiProfile}
                disabled={aiGenerating}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                {aiGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Suggestion
                  </>
                )}
              </button>

              {aiResultBio && (
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3.5 animate-pulse-subtle">
                  <div>
                    <h4 className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1">Generated Biography</h4>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">{aiResultBio}</p>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-1.5">Suggested Links</h4>
                    <div className="space-y-1.5">
                      {aiResultLinks.map((link, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-600">
                          <span className="p-1 bg-slate-50 rounded text-slate-500">🔗</span>
                          <span>{link.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyAiProfile}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 rounded-xl transition-all shadow-sm"
                  >
                    Apply Bio & Links to Profile
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Plateform Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} BongoLink. {lang === 'en' ? 'Crafted with premium taste.' : 'নিখুঁত যত্নে তৈরি।'}</p>
          <div className="flex items-center gap-4">
            <span className="font-mono">v1.2.0-core</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
