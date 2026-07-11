import { Outlet } from 'react-router-dom';
import { SideNav } from './SideNav';
import { TopBar } from './TopBar';

interface AppShellProps {
  isDark: boolean;
  onToggleDark: () => void;
}

export function AppShell({ isDark, onToggleDark }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-on-surface font-sans">
      <SideNav />
      <TopBar isDark={isDark} onToggleDark={onToggleDark} />
      <main className="md:ml-[240px] pb-24 md:pb-8 animate-fade-in">
        {/* Adjusted padding container to native rem scales for robust v4 support */}
        <div className="p-6 md:p-8 max-w-[1440px] mx-auto page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
}