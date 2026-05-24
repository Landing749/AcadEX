import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
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
import { AdminPanel } from './components/admin/AdminPanel';
import { AdminGate } from './components/admin/AdminGate';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import { useNotifications } from './hooks/useNotifications';
import { useGradeNotifications } from './hooks/useGradeNotifications';
import { useReplyNotifications } from './hooks/useReplyNotifications';
import { useOnboarding, useProfile } from './hooks/useFirebase';

// Page id → route path mapping
const PAGE_ROUTES: Record<string, string> = {
  dashboard:   '/',
  subjects:    '/subjects',
  assignments: '/assignments',
  grades:      '/grades',
  calendar:    '/calendar',
  analytics:   '/analytics',
  presets:     '/presets',
  community:   '/community',
  profile:     '/profile',
  admin:       '/admin',
};

const ROUTE_PAGES: Record<string, string> = Object.fromEntries(
  Object.entries(PAGE_ROUTES).map(([k, v]) => [v, k])
);

function AppContent() {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, loading: profileLoading } = useProfile();
  const [onboardingDone, setOnboardingDone] = useState(false);

  useNotifications();
  useGradeNotifications();
  useReplyNotifications();

  // Derive current page from URL
  const currentPage = ROUTE_PAGES[location.pathname] || 'dashboard';

  const onNavigate = (page: string) => {
    const path = PAGE_ROUTES[page] || '/';
    navigate(path);
  };

  // Onboarding check
  const needsOnboarding = !!(
    currentUser &&
    !profileLoading &&
    !(profile as any)?.onboardingCompleted &&
    !localStorage.getItem(`acadex_onboarding_${currentUser.uid}`) &&
    !onboardingDone
  );

  // Show public profile for share links (?profile=xyz)
  const shareProfileId = new URLSearchParams(location.search).get('profile');
  if (shareProfileId) return <PublicProfilePage shareId={shareProfileId} />;

  if (loading || (currentUser && profileLoading)) {
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

  if (needsOnboarding) {
    return (
      <OnboardingFlow onComplete={() => {
        setOnboardingDone(true);
        localStorage.setItem(`acadex_onboarding_${currentUser.uid}`, 'done');
      }} />
    );
  }

  return (
    <SyncProvider>
      <Layout currentPage={currentPage} onNavigate={onNavigate}>
        <Routes>
          <Route path="/"            element={<Dashboard onNavigate={onNavigate} />} />
          <Route path="/subjects"    element={<SubjectsView />} />
          <Route path="/assignments" element={<AssignmentsView />} />
          <Route path="/grades"      element={<GradesView />} />
          <Route path="/calendar"    element={<CalendarView />} />
          <Route path="/analytics"   element={<AnalyticsView />} />
          <Route path="/presets"     element={<PresetsView />} />
          <Route path="/community"   element={<CommunityView />} />
          <Route path="/profile"     element={<ProfileView />} />
          <Route path="/admin"       element={<AdminGate><AdminPanel /></AdminGate>} />
          <Route path="/admin/*"     element={<AdminGate><AdminPanel /></AdminGate>} />
          <Route path="*"            element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </SyncProvider>
  );
}

function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;
