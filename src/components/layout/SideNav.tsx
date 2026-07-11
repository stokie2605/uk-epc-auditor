import { NavLink, useLocation } from 'react-router-dom';

const navItems = [
  { to: '/',             icon: 'dashboard',   label: 'Dashboard'   },
  { to: '/audit',        icon: 'fact_check',  label: 'Live Audit'  },
  { to: '/remediation',  icon: 'domain',      label: 'Remediation' },
  { to: '/reports',      icon: 'assessment',  label: 'Reports'     },
  { to: '/settings',     icon: 'settings',    label: 'Settings'    },
];

export function SideNav() {
  const { pathname } = useLocation();

  return (
    <>
      {/* ── Desktop Sidebar ──────────────────────────────────────────── */}
      <aside className="hidden md:flex fixed top-0 left-0 h-full w-[240px] flex-col
                         bg-surface-container-lowest border-r border-outline-variant
                         dark:bg-dark-surface-container-lowest dark:border-dark-outline-variant
                         py-lg px-md z-50">
        {/* Logo */}
        <div className="mb-xl px-xs">
          <h1 className="text-xl font-bold text-primary dark:text-dark-primary tracking-tight">
            CompliancePro
          </h1>
          <p className="text-on-surface-variant dark:text-dark-on-surface-variant text-xs font-medium uppercase tracking-wider mt-0.5">
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
                    ? 'bg-secondary-container text-on-secondary-container dark:bg-dark-surface-container-high dark:text-dark-primary font-semibold'
                    : 'text-on-surface-variant dark:text-dark-on-surface-variant hover:bg-surface-container-high dark:hover:bg-dark-surface-container-high'
                }`
              }
            >
              <span className="material-symbols-outlined">{icon}</span>
              <span className="text-sm">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User profile footer */}
        <div className="mt-auto border-t border-outline-variant dark:border-dark-outline-variant pt-lg flex items-center gap-md px-xs">
          <div className="w-9 h-9 rounded-full bg-secondary-container dark:bg-dark-surface-container-high flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-on-secondary-container dark:text-dark-primary text-[18px]">
              account_circle
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-primary dark:text-dark-primary text-sm truncate">Auditor Profile</p>
            <p className="text-xs text-on-surface-variant dark:text-dark-on-surface-variant">ID: UK-P44021</p>
          </div>
        </div>
      </aside>

      {/* ── Mobile Bottom Nav ─────────────────────────────────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-container-lowest dark:bg-dark-surface-container-lowest border-t border-outline-variant dark:border-dark-outline-variant flex items-center justify-around px-4 z-50">
        {navItems.slice(0, 4).map(({ to, icon, label }) => {
          const isActive = pathname === to || (to !== '/' && pathname.startsWith(to));
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex flex-col items-center gap-0.5 ${
                isActive
                  ? 'text-primary dark:text-dark-primary'
                  : 'text-on-surface-variant dark:text-dark-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">{icon}</span>
              <span className="text-[10px] font-semibold">{label}</span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}
