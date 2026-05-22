import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SyncProvider } from './contexts/SyncContext';
import { AuthPage } from './components/auth/AuthPage';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './components/dashboard/Dashboard';
import { SubjectsView } from './components/subjects/SubjectsView';
import { AssignmentsView } from './components/assignments/AssignmentsView';
import { GradesView } from './components/grades/GradesView';
import { CalendarView } from './components/calendar/CalendarView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { PresetsView } from './components/presets/PresetsView';
import { CommunityView } from './components/community/CommunityView';
import { ProfileView, PublicProfilePage } from './components/profile/ProfileView';
import { useNotifications } from './hooks/useNotifications';
import { useGradeNotifications } from './hooks/useGradeNotifications';
import { useReplyNotifications } from './hooks/useReplyNotifications';

type Page = 'dashboard' | 'subjects' | 'assignments' | 'grades' | 'calendar' | 'analytics' | 'presets' | 'community' | 'profile';

// Read ?profile= from URL once at module load — stable, no re-render needed
const SHARED_PROFILE_ID = new URLSearchParams(window.location.search).get('profile');

function AppContent() {
  const { currentUser, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  // Register FCM token and listen for foreground push messages
  useNotifications();
  useGradeNotifications();
  useReplyNotifications();

  // Show public profile page for anyone who visits a share link, logged in or not
  if (SHARED_PROFILE_ID) {
    return <PublicProfilePage shareId={SHARED_PROFILE_ID} />;
  }

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg" style={{ animation: 'pulse 2s ease-in-out infinite' }}>
            <span className="text-2xl font-bold text-white">A</span>
          </div>
          <p className="text-sm text-gray-400 mt-3">Loading Acadex...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) return <AuthPage />;

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':    return <Dashboard onNavigate={p => setCurrentPage(p as Page)} />;
      case 'subjects':     return <SubjectsView />;
      case 'assignments':  return <AssignmentsView />;
      case 'grades':       return <GradesView />;
      case 'calendar':     return <CalendarView />;
      case 'analytics':    return <AnalyticsView />;
      case 'presets':      return <PresetsView />;
      case 'community':    return <CommunityView />;
      case 'profile':      return <ProfileView />;
      default:             return <Dashboard onNavigate={p => setCurrentPage(p as Page)} />;
    }
  };

  return (
    <SyncProvider>
      <Layout currentPage={currentPage} onNavigate={p => setCurrentPage(p as Page)}>
        {renderPage()}
      </Layout>
    </SyncProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: '500',
              boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
            },
            success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#f43f5e', secondary: '#fff' } },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;