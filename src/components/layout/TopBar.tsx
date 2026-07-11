import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';

interface TopBarProps {
  onToggleDark: () => void;
  isDark: boolean;
}

export function TopBar({ onToggleDark, isDark }: TopBarProps) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(`/audit?uprn=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-xl
                        ml-0 md:ml-[240px]
                        bg-surface-container-lowest dark:bg-dark-surface-container-lowest
                        border-b border-outline-variant dark:border-dark-outline-variant
                        shadow-card">
      {/* Left: title + search */}
      <div className="flex flex-1 items-center gap-xl">
        <h2 className="hidden lg:block text-lg font-bold text-primary dark:text-dark-primary whitespace-nowrap mr-4">
          CompliancePro
        </h2>
        <form onSubmit={handleSearch} className="relative w-full max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant dark:text-dark-on-surface-variant text-[18px]">
            search
          </span>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by UPRN or Postcode…"
            className="w-full bg-surface-container dark:bg-dark-surface-container
                       border border-outline-variant dark:border-dark-outline-variant
                       rounded-lg pl-10 pr-4 py-1.5 text-sm
                       text-on-surface dark:text-dark-on-surface
                       placeholder:text-on-surface-variant/50 dark:placeholder:text-dark-on-surface-variant/50
                       focus:ring-2 focus:ring-primary dark:focus:ring-dark-primary focus:outline-none transition-all"
          />
        </form>
      </div>

      {/* Right: dark toggle + notifications + user */}
      <div className="flex items-center gap-md">
        {/* Dark mode toggle */}
        <button
          id="dark-mode-toggle"
          onClick={onToggleDark}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-2 rounded-full hover:bg-surface-container dark:hover:bg-dark-surface-container transition-colors"
        >
          {isDark
            ? <Sun  className="w-5 h-5 text-dark-primary" />
            : <Moon className="w-5 h-5 text-on-surface-variant" />
          }
        </button>

        {/* Notifications */}
        <button
          id="notifications-btn"
          className="p-2 rounded-full hover:bg-surface-container dark:hover:bg-dark-surface-container transition-colors relative"
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined text-on-surface-variant dark:text-dark-on-surface-variant">
            notifications
          </span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-error dark:bg-dark-error rounded-full border-2 border-surface-container-lowest dark:border-dark-surface-container-lowest animate-ping-slow" />
        </button>

        {/* Auditor chip */}
        <div className="hidden sm:flex items-center gap-md border-l border-outline-variant dark:border-dark-outline-variant pl-lg">
          <div className="text-right">
            <p className="font-semibold text-primary dark:text-dark-primary text-sm">Auditor Profile</p>
            <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant">ID: UK-P44021</p>
          </div>
        </div>
      </div>
    </header>
  );
}
