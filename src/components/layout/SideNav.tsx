import { NavLink, useLocation } from 'react-router-dom';

const navItems = [
  { to: '/',         icon: 'dashboard',  label: 'Dashboard'   },
  { to: '/properties', icon: 'domain',      label: 'Properties'  },
  { to: '/reports',      icon: 'assessment',  label: 'Reports'     },
  { to: '/audit',        icon: 'fact_check',  label: 'Audits'      },
  { to: '/settings',     icon: 'settings',    label: 'Settings'    },
];

export function SideNav() {
  const { pathname } = useLocation();

  return (
    <>
      {/* ── Desktop Sidebar ──────────────────────────────────────────── */}
      <aside className="hidden md:flex fixed top-0 left-0 h-full w-[240px] flex-col bg-surface border-r border-outline p-6 z-50">
        {/* Logo */}
        <div className="mb-8 px-2">
          <h1 className="text-xl font-bold text-primary tracking-tight font-sans">
            CompliancePro
          </h1>
          <p className="text-on-surface-variant text-[11px] font-semibold uppercase tracking-wider mt-1">
            UK Property Auditor
          </p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-1.5">
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-150 active:scale-[0.98] text-sm ${
                  isActive
                    ? 'bg-primary-container text-primary font-semibold border border-primary/20 shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`
              }
            >
              <span className="material-symbols-outlined text-[20px] shrink-0">{icon}</span>
              <span className="font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User profile footer */}
        <div className="mt-auto border-t border-outline pt-6 flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center shrink-0 border border-outline">
            <span className="material-symbols-outlined text-primary text-[20px]">
              account_circle
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-on-surface text-sm truncate">Organization Logo</p>
            <p className="text-xs text-on-surface-variant">Admin Account</p>
          </div>
        </div>
      </aside>

      {/* ── Mobile Bottom Nav ─────────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-outline flex items-center justify-around px-4 z-50 shadow-lg">
        {navItems.map(({ to, icon, label }) => {
          const isActive = pathname === to || (to !== '/' && pathname.startsWith(to));
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-lg transition-all ${
                isActive
                  ? 'text-primary bg-primary-container/40'
                  : 'text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{icon}</span>
              <span className="text-[10px] font-medium tracking-tight">{label}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}