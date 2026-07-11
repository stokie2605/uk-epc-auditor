import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { AuditWorkspacePage } from './pages/AuditWorkspacePage';
import { RemediationPage } from './pages/RemediationPage';

function App() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    // Persist dark mode preference across sessions
    return localStorage.getItem('theme') === 'dark';
  });

  const toggleDark = () => {
    setIsDark(prev => {
      const next = !prev;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  // Apply theme on initial load
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell isDark={isDark} onToggleDark={toggleDark} />}>
          <Route index                 element={<DashboardPage />}      />
          <Route path="/audit"         element={<AuditWorkspacePage />} />
          <Route path="/remediation"   element={<RemediationPage />}    />
          <Route path="/reports"       element={<PlaceholderPage title="Reports"  icon="assessment" />} />
          <Route path="/settings"      element={<PlaceholderPage title="Settings" icon="settings"   />} />
          <Route path="*"              element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function PlaceholderPage({ title, icon }: { title: string; icon: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4 text-on-surface-variant dark:text-dark-on-surface-variant">
      <span className="material-symbols-outlined text-5xl">{icon}</span>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-sm">This page is ready for your content.</p>
    </div>
  );
}

export default App;
