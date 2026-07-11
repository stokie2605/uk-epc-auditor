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
    <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-6
                        ml-0 md:ml-[240px]
                        bg-surface/80 backdrop-blur-md
                        border-b border-outline
                        shadow-sm">
      {/* Left: title + search */}
      <div className="flex flex-1 items-center gap-6 max-w-xl">
        <h2 className="hidden lg:block text-base font-bold text-on-surface whitespace-nowrap tracking-tight">
          Compliance Manager
        </h2>
        <form onSubmit={handleSearch} className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by UPRN or Postcode..."
            className="w-full bg-surface-container border border-outline rounded-lg pl-10 pr-4 py-1.5 text-sm text-on-surface focus:border-primary focus:outline-none transition-all placeholder:text-on-surface-variant/40"
          />
        </form>
      </div>

      {/* Right: dark toggle + notifications + user */}
      <div className="flex items-center gap-4">
        {/* Dark mode toggle */}
        <button
          id="dark-mode-toggle"
          onClick={onToggleDark}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-2 rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant hover:text-on-surface"
        >
          {isDark
            ? <Sun  className="w-[18px] h-[18px] text-primary" />
            : <Moon className="w-[18px] h-[18px]" />
          }
        </button>

        {/* Notifications */}
        <button
          id="notifications-btn"
          className="p-2 rounded-lg hover:bg-surface-container transition-colors relative text-on-surface-variant hover:text-on-surface"
          aria-label="Notifications"
        >
          <span className="material-symbols-outlined text-[20px]">
            notifications
          </span>
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-error rounded-full ring-1 ring-surface" />
        </button>

        {/* Auditor chip */}
        <div className="hidden sm:flex items-center gap-4 border-l border-outline pl-4 h-6">
          <div className="text-right">
            <p className="font-semibold text-on-surface text-xs">Auditor Profile</p>
            <p className="text-[10px] text-on-surface-variant font-mono">ID: UK-P44021</p>
          </div>
        </div>
      </div>
    </header>
  );
}