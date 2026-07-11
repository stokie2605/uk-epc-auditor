import { NavLink, useLocation } from 'react-router-dom';

const navItems = [
  { to: '/',             icon: 'dashboard',   label: 'Dashboard'   },
  { to: '/properties',   icon: 'domain',      label: 'Properties'  },
  { to: '/reports',      icon: 'assessment',  label: 'Reports'     },
  { to: '/audit',        icon: 'fact_check',  label: 'Audits'      },
  { to: '/settings',     icon: 'settings',    label: 'Settings'    },
];

export function SideNav() {
  const { pathname } = useLocation();

  return (
    <>
      {/* ── Desktop Sidebar ──────────────────────────────────────────── */}
      <aside className="hidden md:flex fixed top-0 left-0 h-full w-[240px] flex-col bg-surface border-r border-outline-variant py-lg px-md z-50">
        {/* Logo */}
        <div className="mb-xl px-xs">
          <h1 className="text-2xl font-bold text-primary font-display-lg tracking-tight">
            CompliancePro
          </h1>
          <p className="text-on-surface-variant text-xs font-medium uppercase tracking-wider mt-1">
            UK Property Auditor
          </p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-xs">
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-md p-md rounded transition-all duration-150 active:scale-[0.98] ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`
              }
            >
              <span className="material-symbols-outlined">{icon}</span>
              <span className="text-body-md">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User profile footer */}
        <div className="mt-auto border-t border-outline-variant pt-lg flex items-center gap-md px-xs">
          <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center shrink-0 border border-outline">
            <span className="material-symbols-outlined text-on-secondary-container text-[20px]">
              account_circle
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-primary text-sm truncate">Organization Logo</p>
            <p className="text-xs text-on-surface-variant">Admin Account</p>
          </div>
        </div>
      </aside>

      {/* ── Mobile Bottom Nav ─────────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-container-lowest border-t border-outline-variant flex items-center justify-around px-4 z-50">
        {navItems.slice(0, 4).map(({ to, icon, label }) => {
          const isActive = pathname === to || (to !== '/' && pathname.startsWith(to));
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex flex-col items-center gap-1 ${
                isActive
                  ? 'text-primary'
                  : 'text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{icon}</span>
              <span className="text-[10px] font-semibold">{label}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}
