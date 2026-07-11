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
                        bg-surface-container-lowest
                        border-b border-outline-variant
                        shadow-sm">
      {/* Left: title + search */}
      <div className="flex flex-1 items-center gap-xl w-1/2">
        <h2 className="hidden lg:block text-xl font-bold text-primary font-headline-md whitespace-nowrap">
          Compliance Manager
        </h2>
        <form onSubmit={handleSearch} className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
            search
          </span>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by UPRN or Postcode..."
            className="w-full bg-surface-container border border-outline-variant rounded-lg pl-10 py-1.5 text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:outline-none transition-all placeholder:text-on-surface-variant/50"
          />
        </form>
      </div>

      {/* Right: dark toggle + notifications + user */}
      <div className="flex items-center gap-lg">
        {/* Dark mode toggle */}
        <button
          id="dark-mode-toggle"
          onClick={onToggleDark}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-2 rounded-full hover:bg-surface-container transition-colors"
        >
          {isDark
            ? <Sun  className="w-5 h-5 text-primary" />
            : <Moon className="w-5 h-5 text-on-surface-variant" />
          }
        </button>

        {/* Notifications */}
        <button
          id="notifications-btn"
          className="p-2 rounded-full hover:bg-surface-container transition-colors relative"
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined text-on-surface-variant">
            notifications
          </span>
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-error rounded-full ring-2 ring-surface-container-lowest animate-ping-slow" />
        </button>

        {/* Auditor chip */}
        <div className="hidden sm:flex items-center gap-md border-l border-outline-variant pl-lg">
          <div className="text-right">
            <p className="font-semibold text-primary text-sm">Auditor Profile</p>
            <p className="text-xs text-on-surface-variant">ID: UK-P44021</p>
          </div>
        </div>
      </div>
    </header>
  );
}
