/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Key, User, Mail, Globe, Sparkles, HelpCircle, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { UserProfile } from '../types';
import { translations } from '../locales';

interface AuthProps {
  lang: 'en' | 'bn';
  users: UserProfile[];
  onLoginSuccess: (user: UserProfile) => void;
  onRegisterSuccess: (newUser: UserProfile) => void;
}

export default function Auth({ lang, users, onLoginSuccess, onRegisterSuccess }: AuthProps) {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot'>('login');
  
  // Login Form State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  // Register Form State
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  
  // Password Reset State
  const [resetEmail, setResetEmail] = useState('');
  const [generatedResetCode, setGeneratedResetCode] = useState('');
  const [enteredResetCode, setEnteredResetCode] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetStep, setResetStep] = useState<1 | 2 | 3>(1); // 1: Email, 2: Verification Code, 3: Password Reset
  const [resetSimulationBanner, setResetSimulationBanner] = useState('');

  // Status & Validation Alerts
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Real-time username uniqueness check
  const isUsernameTaken = (username: string) => {
    return users.some(u => u.username.toLowerCase() === username.toLowerCase().trim());
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginUsername || !loginPassword) {
      setErrorMsg(t.requiredFields);
      return;
    }

    const trimmedUsername = loginUsername.trim().toLowerCase();
    const user = users.find(u => u.username.toLowerCase() === trimmedUsername);

    if (!user || user.password !== loginPassword) {
      setErrorMsg(t.invalidCredentials);
      return;
    }

    if (!user.enabled && user.role !== 'admin') {
      setErrorMsg(t.accountDisabled);
      return;
    }

    setSuccessMsg(t.loginSuccess);
    setTimeout(() => {
      onLoginSuccess(user);
    }, 600);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanUsername = regUsername.trim().toLowerCase();
    
    if (!cleanUsername || !regEmail || !regPassword || !regConfirmPassword || !regFullName) {
      setErrorMsg(t.requiredFields);
      return;
    }

    // Validate alphanumeric username (excluding special characters except _ and -)
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(cleanUsername)) {
      setErrorMsg(lang === 'en' 
        ? "Username must be alphanumeric and can only include underscores (_) or hyphens (-)."
        : "ব্যবহারকারীর নাম অবশ্যই অক্ষর-সংখ্যা হতে হবে এবং কেবল আন্ডারস্কোর (_) বা হাইফেন (-) থাকতে পারবে।"
      );
      return;
    }

    if (isUsernameTaken(cleanUsername)) {
      setErrorMsg(t.usernameExists);
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg(t.passwordMismatch);
      return;
    }

    // Create new customer user profile
    const newUser: UserProfile = {
      id: `user-${Math.random().toString(36).substring(2, 11)}`,
      username: cleanUsername,
      email: regEmail,
      role: 'customer',
      password: regPassword,
      name: regFullName,
      bio: lang === 'en' 
        ? `Welcome to my space! I am a content creator.` 
        : `আমার প্রোফাইলে স্বাগতম! আমি একজন কন্টেন্ট ক্রিয়েটর।`,
      avatar: '', // No profile picture by default
      theme: 'light',
      customBg: '#ffffff',
      customText: '#1e293b',
      customBtnBg: '#3b82f6',
      customBtnRadius: 'md',
      maintenanceMode: false,
      enabled: true,
      createdAt: new Date().toISOString()
    };

    onRegisterSuccess(newUser);
    setSuccessMsg(t.registerSuccess);
    
    // Clear registration fields
    setRegUsername('');
    setRegEmail('');
    setRegPassword('');
    setRegConfirmPassword('');
    setRegFullName('');
    
    setTimeout(() => {
      setActiveTab('login');
      setLoginUsername(cleanUsername);
      setSuccessMsg('');
    }, 1500);
  };

  const handleSendResetCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setResetSimulationBanner('');

    if (!resetEmail) {
      setErrorMsg(t.requiredFields);
      return;
    }

    const cleanEmail = resetEmail.trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      setErrorMsg(lang === 'en' ? "Email address not registered." : "এই ইমেইলটি নিবন্ধিত নয়।");
      return;
    }

    // Generate a 6-digit random code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedResetCode(code);
    
    // Set simulated email dispatch message
    const bannerEn = `📩 [Email Simulation] Reset code sent to ${cleanEmail}. Code: ${code}`;
    const bannerBn = `📩 [ইমেইল সিমুলেশন] ${cleanEmail} ঠিকানায় কোড পাঠানো হয়েছে। কোড: ${code}`;
    setResetSimulationBanner(lang === 'en' ? bannerEn : bannerBn);
    setSuccessMsg(lang === 'en' ? "Reset code generated and simulated!" : "রিসেট কোড তৈরি করা হয়েছে!");
    
    setTimeout(() => {
      setResetStep(2);
      setSuccessMsg('');
    }, 1200);
  };

  const handleVerifyResetCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!enteredResetCode) {
      setErrorMsg(t.requiredFields);
      return;
    }

    if (enteredResetCode.trim() !== generatedResetCode) {
      setErrorMsg(lang === 'en' ? "Invalid verification code." : "ভুল ভেরিফিকেশন কোড।");
      return;
    }

    setSuccessMsg(lang === 'en' ? "Code verified successfully!" : "কোড সফলভাবে যাচাই করা হয়েছে!");
    setTimeout(() => {
      setResetStep(3);
      setSuccessMsg('');
    }, 1000);
  };

  const handleForgotPasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!resetNewPassword) {
      setErrorMsg(t.requiredFields);
      return;
    }

    // Find and update user password
    const updatedUsers = users.map(u => {
      if (u.email.toLowerCase() === resetEmail.trim().toLowerCase()) {
        return { ...u, password: resetNewPassword };
      }
      return u;
    });

    // Write to localStorage
    localStorage.setItem('bongolink_users', JSON.stringify(updatedUsers));
    
    setSuccessMsg(t.passwordChanged);
    setTimeout(() => {
      // Force reload to update memory and states
      window.location.reload();
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 py-8">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-sm"
      >
        {/* Brand Lockup */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm border border-slate-100 mb-3 bg-indigo-50 flex items-center justify-center">
            <img 
              src="/src/assets/images/brand_logo_1790689768780.jpg" 
              alt="BongoLink" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 font-sans">
            {t.appName}
          </h1>
          <p className="text-xs text-rose-500 font-medium tracking-wide mt-1 uppercase">
            {t.appTagline}
          </p>
          <p className="text-sm text-slate-500 mt-2 max-w-sm">
            {t.slogan}
          </p>
        </div>

        {/* Tab Buttons */}
        {activeTab !== 'forgot' && (
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg mb-6">
            <button
              onClick={() => {
                setActiveTab('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 text-center py-2 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.login}
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 text-center py-2 text-xs font-semibold rounded-md transition-all ${
                activeTab === 'register'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.register}
            </button>
          </div>
        )}

        {/* Status Alerts */}
        {errorMsg && (
          <div className="flex items-start gap-2.5 p-3.5 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200/60 mb-5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>{errorMsg}</div>
          </div>
        )}
        {successMsg && (
          <div className="flex items-start gap-2.5 p-3.5 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200/60 mb-5 animate-pulse-subtle">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>{successMsg}</div>
          </div>
        )}

        {/* Form rendering */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                {t.username}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="e.g. ratul"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  {t.password}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('forgot');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  {t.forgotPassword}
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Key className="w-4 h-4" />
                </span>
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-10 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-3 px-4 rounded-xl transition-all shadow-sm active:scale-[0.98] mt-6"
            >
              {t.login}
            </button>

            <div className="mt-4 text-center text-xs text-slate-400 font-mono">
              Admin: admin / adminpassword<br />
              Creator: ratul / password123
            </div>
          </form>
        )}

        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  {t.username}
                </label>
                {regUsername && (
                  <span className={`text-[10px] font-semibold ${isUsernameTaken(regUsername) ? 'text-red-500' : 'text-emerald-500'}`}>
                    {isUsernameTaken(regUsername) ? `✕ ${t.usernameExists}` : `✓ ${t.usernameAvailable}`}
                  </span>
                )}
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 text-xs font-medium select-none">
                  @
                </span>
                <input
                  type="text"
                  placeholder="username"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-8 pr-3.5 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                {lang === 'en' ? "Your Name" : "আপনার নাম"}
              </label>
              <input
                type="text"
                placeholder="Ratul Mridha"
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                {lang === 'en' ? "Email Address" : "ইমেইল ঠিকানা"}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  placeholder="creator@bongolink.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-3.5 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                {t.password}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Key className="w-4 h-4" />
                </span>
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-10 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                >
                  {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                {lang === 'en' ? "Confirm Password" : "পাসওয়ার্ড নিশ্চিত করুন"}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Key className="w-4 h-4" />
                </span>
                <input
                  type={showRegConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-10 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                >
                  {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-3 px-4 rounded-xl transition-all shadow-sm active:scale-[0.98] mt-6"
            >
              {t.register}
            </button>
          </form>
        )}

        {activeTab === 'forgot' && (
          <div>
            <div className="mb-4">
              <h2 className="text-sm font-bold text-slate-900 mb-1">
                {t.resetPassword}
              </h2>
              <p className="text-xs text-slate-500">
                {lang === 'en' 
                  ? "A simulated email verification code will be sent to your registered address."
                  : "আপনার নিবন্ধিত ইমেইলে একটি সিমুলেটেড ভেরিফিকেশন কোড পাঠানো হবে।"}
              </p>
            </div>

            {/* Email simulation toast banner */}
            {resetSimulationBanner && (
              <div className="flex items-start gap-2.5 p-3 bg-indigo-50 border border-indigo-200 text-indigo-800 text-[11px] rounded-xl mb-4 animate-pulse-subtle font-sans leading-relaxed font-semibold">
                <Mail className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="break-all">{resetSimulationBanner}</div>
              </div>
            )}

            {resetStep === 1 && (
              <form onSubmit={handleSendResetCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                    {t.email}
                  </label>
                  <input
                    type="email"
                    placeholder="creator@bongolink.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login');
                      setResetStep(1);
                      setErrorMsg('');
                      setResetSimulationBanner('');
                    }}
                    className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition-all"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-sm"
                  >
                    {lang === 'en' ? "Send Code" : "কোড পাঠান"}
                  </button>
                </div>
              </form>
            )}

            {resetStep === 2 && (
              <form onSubmit={handleVerifyResetCode} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                    {t.securityPlaceholder}
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 123456"
                    value={enteredResetCode}
                    onChange={(e) => setEnteredResetCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm font-mono tracking-widest text-center text-lg font-bold focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setResetStep(1);
                      setErrorMsg('');
                    }}
                    className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition-all"
                  >
                    {lang === 'en' ? "Back" : "ফিরুন"}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-sm"
                  >
                    {lang === 'en' ? "Verify Code" : "কোড যাচাই করুন"}
                  </button>
                </div>
              </form>
            )}

            {resetStep === 3 && (
              <form onSubmit={handleForgotPasswordReset} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                    {lang === 'en' ? "Enter New Password" : "নতুন পাসওয়ার্ড দিন"}
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login');
                      setResetStep(1);
                      setErrorMsg('');
                      setResetSimulationBanner('');
                    }}
                    className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition-all"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-sm"
                  >
                    {t.resetPassword}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
