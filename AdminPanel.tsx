/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { UserProfile } from '../types';
import { translations } from '../locales';
import { Search, UserCheck, UserX, Trash2, Calendar, Shield, Edit, Save, X, User } from 'lucide-react';

interface AdminPanelProps {
  lang: 'en' | 'bn';
  users: UserProfile[];
  currentUser: UserProfile;
  onUpdateUsers: (updatedUsers: UserProfile[]) => void;
}

export default function AdminPanel({ lang, users, currentUser, onUpdateUsers }: AdminPanelProps) {
  const t = translations[lang];
  const [searchTerm, setSearchTerm] = useState('');
  
  // Inline edit state for user profile correction by Admin
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');

  // Calculations
  const customers = users.filter(u => u.role === 'customer');
  const activeCustomers = customers.filter(u => u.enabled);
  const disabledCustomers = customers.filter(u => !u.enabled);

  const handleToggleStatus = (userId: string, currentStatus: boolean) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        return { ...u, enabled: !currentStatus };
      }
      return u;
    });
    onUpdateUsers(updated);
  };

  const confirmDeleteUser = (userId: string) => {
    const updated = users.filter(u => u.id !== userId);
    onUpdateUsers(updated);
    setDeletingUserId(null);
  };

  const startEdit = (user: UserProfile) => {
    setEditingUserId(user.id);
    setEditName(user.name);
    setEditBio(user.bio);
  };

  const saveEdit = (userId: string) => {
    const updated = users.map(u => {
      if (u.id === userId) {
        return { ...u, name: editName, bio: editBio };
      }
      return u;
    });
    onUpdateUsers(updated);
    setEditingUserId(null);
  };

  const filteredUsers = customers.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Overview Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {t.allUsersCount}
            </p>
            <h3 className="text-2xl font-bold font-mono tracking-tight text-slate-800 mt-1">
              {customers.length}
            </h3>
          </div>
          <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {t.activeUsersCount}
            </p>
            <h3 className="text-2xl font-bold font-mono tracking-tight text-emerald-600 mt-1">
              {activeCustomers.length}
            </h3>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {t.disabledUsers}
            </p>
            <h3 className="text-2xl font-bold font-mono tracking-tight text-amber-600 mt-1">
              {disabledCustomers.length}
            </h3>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
            <UserX className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control Panel / User List */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 md:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-sans">
              {t.systemUsers}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'en' 
                ? "Manage customer accounts, change permissions, or remove users completely."
                : "ক্রিয়েটর অ্যাকাউন্ট নিয়ন্ত্রণ করুন, নিষ্ক্রিয়/সক্রিয় করুন অথবা মুছে ফেলুন।"}
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg py-1.5 pl-9 pr-3 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* User Table Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider bg-slate-50">
                <th className="py-3 px-4">{lang === 'en' ? "Creator Details" : "ক্রিয়েটরের তথ্য"}</th>
                <th className="py-3 px-4">{lang === 'en' ? "Joined Date" : "যোগদানের তারিখ"}</th>
                <th className="py-3 px-4">{lang === 'en' ? "Status" : "অবস্থা"}</th>
                <th className="py-3 px-4 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    {lang === 'en' ? "No creators matching search filter." : "খোঁজা তথ্যের সাথে কোনো অ্যাকাউন্ট মেলেনি।"}
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {user.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt={user.name} 
                            className="w-9 h-9 rounded-full object-cover border border-slate-100 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0 shadow-inner">
                            <User className="w-4 h-4" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-slate-900 truncate">{user.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">@{user.username} · {user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap font-mono tabular-nums">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(user.createdAt).toLocaleDateString(lang === 'en' ? 'en-US' : 'bn-BD', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {/* Zero-pill metadata design: clean text status indicator */}
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${
                        user.enabled ? 'text-emerald-600' : 'text-amber-500'
                      }`}>
                        {user.enabled ? (lang === 'en' ? 'Active' : 'সক্রিয়') : (lang === 'en' ? 'Disabled' : 'নিষ্ক্রিয়')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {deletingUserId === user.id ? (
                          <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-100 rounded-lg p-1 animate-pulse-subtle">
                            <span className="text-[10px] font-bold text-rose-700 px-1">
                              {lang === 'en' ? 'Delete?' : 'নিশ্চিত?'}
                            </span>
                            <button
                              onClick={() => confirmDeleteUser(user.id)}
                              className="bg-red-600 hover:bg-red-700 text-white text-[9px] font-bold px-2 py-1 rounded transition-colors cursor-pointer"
                            >
                              {lang === 'en' ? 'Yes' : 'হ্যাঁ'}
                            </button>
                            <button
                              onClick={() => setDeletingUserId(null)}
                              className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-[9px] font-bold px-2 py-1 rounded transition-colors cursor-pointer"
                            >
                              {lang === 'en' ? 'No' : 'না'}
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => handleToggleStatus(user.id, user.enabled)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                user.enabled ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={user.enabled ? t.disable : t.enable}
                            >
                              {user.enabled ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => setDeletingUserId(user.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title={t.delete}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
