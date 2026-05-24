import React, { useState } from 'react';
import {
  BookOpen, LayoutDashboard, ClipboardList, Award, Calendar,
  BarChart2, Menu, X, LogOut, Sun, Moon, Bell, Bookmark, MessageCircle, UserCircle, Shield
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useProfile, useAdminAccess } from '../../hooks/useFirebase';
import { SyncIndicator } from '../ui/SyncIndicator';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { cn, getInitials, requestNotificationPermission } from '../../utils/helpers';
import toast from 'react-hot-toast';

interface LayoutProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { id: 'dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
  { id: 'subjects',    label: 'Subjects',     icon: BookOpen },
  { id: 'assignments', label: 'Assignments',  icon: ClipboardList },
  { id: 'grades',      label: 'Grades',       icon: Award },
  { id: 'calendar',    label: 'Calendar',     icon: Calendar },
  { id: 'analytics',   label: 'Analytics',    icon: BarChart2 },
  { id: 'presets',     label: 'Presets',      icon: Bookmark },
  { id: 'community',   label: 'Study Help',   icon: MessageCircle },
  { id: 'profile',     label: 'Profile',      icon: UserCircle },
];

const BOTTOM_NAV = ['dashboard', 'assignments', 'grades', 'community', 'profile'];

export function Layout({ currentPage, onNavigate, children }: LayoutProps) {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { profile } = useProfile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { isAdmin } = useAdminAccess();

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out');
  };

  const navigate = (page: string) => {
    onNavigate(page);
    setSidebarOpen(false);
  };

  const allNavItems = isAdmin
    ? [...NAV_ITEMS, { id: 'admin', label: 'Admin', icon: Shield }]
    : NAV_ITEMS;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-white/5 flex flex-col transition-transform duration-300 ease-in-out',
        'lg:relative lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-glow-sm">
              <BookOpen size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Acade<span className="text-indigo-500">x</span>
            </span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {allNavItems.map(item => {
            const Icon = item.icon;
            const isCommunity = item.id === 'community';
            const isAdminItem = item.id === 'admin';
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={cn(
                  'sidebar-item w-full',
                  currentPage === item.id && 'active',
                  isAdminItem && 'mt-2 border-t border-gray-100 dark:border-white/10 pt-2'
                )}
              >
                <Icon size={18} className={isAdminItem ? 'text-red-500' : ''} />
                <span className={isAdminItem ? 'text-red-600 dark:text-red-400 font-semibold' : ''}>{item.label}</span>
                {isCommunity && (
                  <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-semibold">
                    PH
                  </span>
                )}
                {isAdminItem && (
                  <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 font-semibold">
                    MOD
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sync Status */}
        <div className="px-4 py-2">
          <SyncIndicator />
        </div>

        {/* User Section */}
        <div className="p-3 border-t border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 mb-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden"
              style={{ background: profile?.avatarBg || '#6366f1' }}
            >
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                getInitials(currentUser?.displayName || currentUser?.email || 'U')
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {currentUser?.displayName || 'Student'}
              </p>
              <p className="text-xs text-gray-400 truncate">{currentUser?.email}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={toggleTheme} className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors text-xs">
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
            <button onClick={handleLogout} className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors text-xs">
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between px-4 h-14 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors lg:hidden">
              <Menu size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center">
                <BookOpen size={12} className="text-white" />
              </div>
              <span className="text-base font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Acade<span className="text-indigo-500">x</span>
              </span>
            </div>
          </div>

          {/* Right side: sync + notification bell */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:block">
              <SyncIndicator />
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400 hidden lg:flex"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <NotificationCenter onNavigate={navigate} />
            {/* Profile avatar button */}
            <button
              onClick={() => navigate('profile')}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden"
              style={{ background: profile?.avatarBg || '#6366f1' }}
            >
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                getInitials(currentUser?.displayName || currentUser?.email || 'U')
              )}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
          <div className="h-20 lg:hidden" />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 lg:hidden bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-white/5 safe-bottom">
        <div className="flex items-center justify-around px-1 h-16">
          {NAV_ITEMS.filter(item => BOTTOM_NAV.includes(item.id)).map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={cn(
                  'flex flex-col items-center gap-0.5 py-2 px-2 rounded-xl transition-all',
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                )}
              >
                <div className={cn(
                  'w-7 h-7 rounded-xl flex items-center justify-center transition-all',
                  isActive && 'bg-indigo-100 dark:bg-indigo-500/20'
                )}>
                  <Icon size={17} />
                </div>
                <span className="text-xs font-medium leading-none">{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
