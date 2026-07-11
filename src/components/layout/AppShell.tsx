import { Outlet } from 'react-router-dom';
import { SideNav } from './SideNav';
import { TopBar } from './TopBar';

interface AppShellProps {
  isDark: boolean;
  onToggleDark: () => void;
}

export function AppShell({ isDark, onToggleDark }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background dark:bg-dark-background text-on-surface dark:text-dark-on-surface font-sans">
      <SideNav />
      <TopBar isDark={isDark} onToggleDark={onToggleDark} />
      <main className="md:ml-[240px] pb-16 md:pb-0">
        <div className="p-xl max-w-[1440px] mx-auto page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
