import React, { useState } from 'react';
import {
  BookOpen, LayoutDashboard, ClipboardList, Award, Calendar,
  BarChart2, Menu, X, LogOut, Sun, Moon, Bell, Bookmark,
  MessageCircle, UserCircle, Shield, ChevronRight
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
  { id: 'dashboard',   label: 'Dashboard',   icon: LayoutDashboard, color: '#6366f1' },
  { id: 'subjects',    label: 'Subjects',     icon: BookOpen,        color: '#8b5cf6' },
  { id: 'assignments', label: 'Assignments',  icon: ClipboardList,   color: '#f59e0b' },
  { id: 'grades',      label: 'Grades',       icon: Award,           color: '#10b981' },
  { id: 'calendar',    label: 'Calendar',     icon: Calendar,        color: '#0ea5e9' },
  { id: 'analytics',   label: 'Analytics',    icon: BarChart2,       color: '#6366f1' },
  { id: 'presets',     label: 'Presets',      icon: Bookmark,        color: '#a78bfa' },
  { id: 'community',   label: 'Study Help',   icon: MessageCircle,   color: '#ec4899' },
  { id: 'profile',     label: 'Profile',      icon: UserCircle,      color: '#64748b' },
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
    toast.success('Signed out successfully');
  };

  const navigate = (page: string) => {
    onNavigate(page);
    setSidebarOpen(false);
  };

  const allNavItems = isAdmin
    ? [...NAV_ITEMS, { id: 'admin', label: 'Admin', icon: Shield, color: '#ef4444' }]
    : NAV_ITEMS;

  const bottomItems = allNavItems.filter(i => BOTTOM_NAV.includes(i.id));

  return (
    <>
      <style>{`
        .sidebar-enter { animation: sidebarIn 0.3s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes sidebarIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .nav-item-active-bg {
          background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.08));
        }
        .dark .nav-item-active-bg {
          background: linear-gradient(135deg, rgba(99,102,241,0.18), rgba(139,92,246,0.12));
        }
        .sidebar-user-card {
          background: linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.04));
        }
        .dark .sidebar-user-card {
          background: rgba(255,255,255,0.04);
        }
        .bottom-nav-item-active::before {
          content: '';
          position: absolute;
          top: -2px;
          left: 50%;
          transform: translateX(-50%);
          width: 24px;
          height: 3px;
          border-radius: 0 0 4px 4px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
        }
        .topbar-shadow {
          box-shadow: 0 1px 0 rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04);
        }
        .dark .topbar-shadow {
          box-shadow: 0 1px 0 rgba(255,255,255,0.06);
        }
        .sidebar-scroll::-webkit-scrollbar { width: 0; }
        .sidebar-scroll { scrollbar-width: none; }
        .page-content { animation: pageIn 0.3s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes pageIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">

        {/* Sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
            style={{ animation: 'fadeIn 0.2s ease both' }}
          />
        )}

        {/* ── Sidebar ─────────────────────────────────────────────────── */}
        <aside className={cn(
          'fixed inset-y-0 left-0 z-30 w-[260px] bg-white dark:bg-gray-900 border-r border-gray-100/80 dark:border-white/[0.06] flex flex-col',
          'lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0 sidebar-enter' : '-translate-x-full',
          'transition-transform duration-300 ease-out lg:transition-none'
        )}>

          {/* Logo */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100/80 dark:border-white/[0.06] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-glow-sm">
                <BookOpen size={17} className="text-white"/>
              </div>
              <div>
                <span className="text-lg font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Acade<span className="text-indigo-500">x</span>
                </span>
                <div className="text-[10px] text-gray-400 dark:text-gray-500 -mt-0.5 font-medium tracking-wide">ACADEMIC TRACKER</div>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
              <X size={16} className="text-gray-500"/>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto sidebar-scroll">

            {/* Section label */}
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-600 uppercase tracking-widest px-3 mb-2 mt-1">
              Navigation
            </p>

            {allNavItems.filter(i => i.id !== 'admin').map((item, idx) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              const isCommunity = item.id === 'community';
              return (
                <button key={item.id} onClick={() => navigate(item.id)}
                  className={cn(
                    'sidebar-item w-full group',
                    isActive && 'active nav-item-active-bg'
                  )}
                  style={{ animationDelay: `${idx * 30}ms` }}>

                  {/* Active indicator */}
                  {isActive && (
                    <span className="nav-indicator" style={{ height: '60%' }}/>
                  )}

                  {/* Icon with colored bg on active */}
                  <span className={cn(
                    'w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200',
                    isActive
                      ? 'bg-white dark:bg-white/10 shadow-sm'
                      : 'group-hover:bg-gray-100 dark:group-hover:bg-white/8'
                  )}>
                    <Icon size={17} style={{ color: isActive ? item.color : undefined }}
                      className={cn(!isActive && 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300')}/>
                  </span>

                  <span className={cn(
                    'flex-1 text-left',
                    isActive ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-600 dark:text-gray-400'
                  )}>{item.label}</span>

                  {isCommunity && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400 font-bold">
                      PH
                    </span>
                  )}
                  {isActive && <ChevronRight size={13} className="text-gray-400 dark:text-gray-500 shrink-0"/>}
                </button>
              );
            })}

            {/* Admin section */}
            {isAdmin && (
              <>
                <div className="h-px bg-gray-100 dark:bg-white/[0.06] my-3 mx-1"/>
                <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest px-3 mb-2">
                  Admin
                </p>
                <button onClick={() => navigate('admin')}
                  className={cn('sidebar-item w-full', currentPage === 'admin' && 'active')}>
                  <span className="w-8 h-8 rounded-xl flex items-center justify-center bg-red-50 dark:bg-red-500/10">
                    <Shield size={17} className="text-red-500"/>
                  </span>
                  <span className="text-red-600 dark:text-red-400 font-semibold">Admin Panel</span>
                  <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 font-bold">MOD</span>
                </button>
              </>
            )}
          </nav>

          {/* Sync */}
          <div className="px-4 py-1.5">
            <SyncIndicator/>
          </div>

          {/* User section */}
          <div className="p-3 border-t border-gray-100/80 dark:border-white/[0.06] shrink-0">
            <button onClick={() => navigate('profile')}
              className="sidebar-user-card w-full flex items-center gap-3 p-3 rounded-2xl mb-2.5 hover:bg-gray-50 dark:hover:bg-white/6 transition-colors group">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden ring-2 ring-white/50 dark:ring-white/10"
                style={{ background: profile?.avatarBg || 'linear-gradient(135deg, #6366f1, #7c3aed)' }}>
                {profile?.avatarUrl
                  ? <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover"/>
                  : getInitials(currentUser?.displayName || currentUser?.email || 'U')}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate leading-tight">
                  {currentUser?.displayName || 'Student'}
                </p>
                <p className="text-xs text-gray-400 truncate mt-0.5">{currentUser?.email}</p>
              </div>
              <ChevronRight size={14} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 shrink-0 transition-colors"/>
            </button>

            <div className="flex gap-2">
              <button onClick={toggleTheme}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all text-xs font-medium">
                {theme === 'dark'
                  ? <><Sun size={13}/> Light</>
                  : <><Moon size={13}/> Dark</>}
              </button>
              <button onClick={handleLogout}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-all text-xs font-medium">
                <LogOut size={13}/> Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Topbar */}
          <header className="flex items-center justify-between px-4 sm:px-5 h-14 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-gray-100/80 dark:border-white/[0.06] shrink-0 topbar-shadow">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors lg:hidden active:scale-95">
                <Menu size={20} className="text-gray-600 dark:text-gray-400"/>
              </button>

              {/* Breadcrumb */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center">
                  <BookOpen size={12} className="text-white"/>
                </div>
                <span className="text-base font-bold text-gray-900 dark:text-white hidden sm:block" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Acade<span className="text-indigo-500">x</span>
                </span>
                {currentPage !== 'dashboard' && (
                  <>
                    <span className="text-gray-300 dark:text-gray-600 hidden sm:block">/</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block capitalize font-medium">
                      {allNavItems.find(i => i.id === currentPage)?.label || currentPage}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-1.5">
              <div className="hidden lg:block">
                <SyncIndicator/>
              </div>
              <button onClick={toggleTheme}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400 hidden lg:flex items-center justify-center">
                {theme === 'dark' ? <Sun size={17}/> : <Moon size={17}/>}
              </button>
              <NotificationCenter onNavigate={navigate}/>
              <button onClick={() => navigate('profile')}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 overflow-hidden ring-2 ring-white/60 dark:ring-white/10 hover:ring-indigo-500/40 transition-all active:scale-95"
                style={{ background: profile?.avatarBg || 'linear-gradient(135deg, #6366f1, #7c3aed)' }}>
                {profile?.avatarUrl
                  ? <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover"/>
                  : getInitials(currentUser?.displayName || currentUser?.email || 'U')}
              </button>
            </div>
          </header>

          {/* Page content */}
          <main key={currentPage} className="flex-1 overflow-y-auto page-content">
            {children}
          </main>

          {/* ── Bottom navigation (mobile) ── */}
          <nav className="lg:hidden shrink-0 flex items-center bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-100/80 dark:border-white/[0.06] safe-bottom"
            style={{ boxShadow: '0 -1px 0 rgba(0,0,0,0.05), 0 -4px 16px rgba(0,0,0,0.04)' }}>
            {bottomItems.map(item => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button key={item.id} onClick={() => navigate(item.id)}
                  className={cn(
                    'relative flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-all duration-200 active:scale-95',
                    isActive ? 'bottom-nav-item-active' : ''
                  )}>
                  <Icon size={22} style={{ color: isActive ? item.color : undefined }}
                    className={cn(
                      'transition-all duration-200',
                      isActive ? 'scale-110' : 'text-gray-400 dark:text-gray-500'
                    )}/>
                  <span className={cn(
                    'text-[10px] font-semibold transition-colors duration-200',
                    isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500'
                  )}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
