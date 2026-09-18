import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";
import OrderToasts from "./OrderToasts";
import ThemeToggle from "./ThemeToggle";
import {
  AreaIcon,
  CloseIcon,
  DashboardIcon,
  LogoutIcon,
  MenuIcon,
  OrderIcon,
  ProductIcon,
  SubscriptionIcon,
  UserIcon,
} from "./icons";

const links = [
  { to: "/", label: "Dashboard", end: true, icon: DashboardIcon },
  { to: "/products", label: "Products", icon: ProductIcon },
  { to: "/orders", label: "Orders", icon: OrderIcon },
  { to: "/subscriptions", label: "Subscriptions", icon: SubscriptionIcon },
  { to: "/users", label: "Users", icon: UserIcon },
  { to: "/areas", label: "Serviceable Areas", icon: AreaIcon },
];

const initials = (label) =>
  (label || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "A";

export default function Layout() {
  const { user, logout } = useAuth();
  const [navOpen, setNavOpen] = useState(false);

  const desktopLinkClass = ({ isActive }) =>
    `group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
      isActive
        ? "bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow"
        : "text-ink-muted hover:bg-surface-2 hover:text-ink"
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
      isActive ? "bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow" : "text-ink-muted hover:bg-surface-2"
    }`;

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-30 border-b border-line bg-surface/80 px-4 py-3 backdrop-blur-xl transition-colors">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setNavOpen((o) => !o)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-2 md:hidden"
              aria-label="Toggle navigation"
            >
              {navOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>

            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-base shadow-glow">
              🥛
            </span>
            <span className="text-lg font-bold tracking-tight text-ink">
              Fresh Dairy <span className="text-brand-500">Admin</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <ThemeToggle />
            <NotificationBell />
            <span className="mx-1 hidden h-6 w-px bg-line sm:block" />
            <div className="hidden items-center gap-2 sm:flex">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-xs font-bold text-white">
                {initials(user?.name || user?.phone)}
              </span>
              <span className="text-sm font-medium text-ink-muted">{user?.name || user?.phone}</span>
            </div>
            <button
              onClick={logout}
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface-2 hover:text-red-500"
              aria-label="Logout"
              title="Logout"
            >
              <LogoutIcon className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>

        {navOpen && (
          <nav className="mx-auto mt-3 flex max-w-7xl flex-col gap-1 border-t border-line pt-3 md:hidden">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} onClick={() => setNavOpen(false)} className={mobileLinkClass}>
                <link.icon className="h-[18px] w-[18px] shrink-0" />
                {link.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <OrderToasts />

      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 md:flex-row">
        <nav className="hidden shrink-0 flex-col gap-1 md:sticky md:top-20 md:flex md:h-fit md:w-56">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={desktopLinkClass}>
              <link.icon className="h-[18px] w-[18px] shrink-0" />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
