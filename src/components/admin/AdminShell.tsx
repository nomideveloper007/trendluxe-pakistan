import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Moon, Search, Sun, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ADMIN_NAV,
  GLOBE_ICON as Globe,
  LOGOUT_ICON as LogOut,
  loadAdminJson,
  saveAdminJson,
  type AdminTab,
} from "./admin-utils";

type Props = {
  active: AdminTab;
  onNavigate: (tab: AdminTab) => void;
  email?: string | null;
  openMessages?: number;
  onLogout: () => void;
  searchIndex: { type: string; label: string; tab: AdminTab; id?: string }[];
  children: React.ReactNode;
};

export function AdminShell({
  active,
  onNavigate,
  email,
  openMessages = 0,
  onLogout,
  searchIndex,
  children,
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(() => loadAdminJson("pahraan_admin_dark", false));
  const [q, setQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    saveAdminJson("pahraan_admin_dark", dark);
  }, [dark]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const groups = useMemo(() => {
    const map = new Map<string, typeof ADMIN_NAV>();
    for (const item of ADMIN_NAV) {
      const list = map.get(item.group) ?? [];
      list.push(item);
      map.set(item.group, list);
    }
    return [...map.entries()];
  }, []);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return searchIndex
      .filter(
        (item) =>
          item.label.toLowerCase().includes(term) ||
          item.type.toLowerCase().includes(term),
      )
      .slice(0, 12);
  }, [q, searchIndex]);

  const shellClass = dark
    ? "admin-dark bg-zinc-950 text-zinc-100 [--admin-panel:#18181b] [--admin-border:#27272a]"
    : "bg-[#FFF9FB] text-foreground [--admin-panel:#ffffff] [--admin-border:var(--border)]";

  return (
    <div className={`flex h-screen overflow-hidden font-body ${shellClass}`}>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[17.5rem] flex-col border-r transition-transform lg:static lg:translate-x-0 ${
          dark ? "border-zinc-800 bg-zinc-900" : "border-border/80 bg-white/95 backdrop-blur-xl"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-16 items-center justify-between border-b px-5 border-[color:var(--admin-border)]">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display text-xl font-bold tracking-wider text-primary">PAHRAAN</span>
            <Badge variant="outline" className="border-primary/20 bg-primary/5 text-[10px] uppercase text-primary/80">
              Admin
            </Badge>
          </Link>
          <button type="button" className="lg:hidden cursor-pointer" onClick={() => setMobileOpen(false)}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="border-b p-4 border-[color:var(--admin-border)]">
          <div className={`flex items-center gap-3 rounded-2xl p-3 ${dark ? "bg-zinc-800" : "bg-secondary/15"}`}>
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/25 bg-primary/10 font-display text-xs font-semibold text-primary">
              {email?.slice(0, 2).toUpperCase() || "AD"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                Active Session
              </p>
              <p className="mt-0.5 truncate text-xs font-semibold">{email}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto p-3">
          {groups.map(([group, items]) => (
            <div key={group}>
              <p className="mb-1.5 px-3 text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                {group}
              </p>
              <div className="space-y-0.5">
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = active === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onNavigate(item.id);
                        setMobileOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left text-xs font-semibold transition cursor-pointer ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-soft"
                          : dark
                            ? "text-zinc-300 hover:bg-zinc-800"
                            : "text-foreground/80 hover:bg-secondary/25 hover:text-primary"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {item.id === "messages" && openMessages > 0 && (
                        <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[9px]">
                          {openMessages}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="space-y-2 border-t p-3 border-[color:var(--admin-border)]">
          <Link
            to="/"
            className={`flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-xs font-semibold ${
              dark ? "hover:bg-zinc-800" : "hover:bg-secondary/20"
            }`}
          >
            <Globe className="h-4 w-4 text-primary" /> Go to Website
          </Link>
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-2 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className={`flex h-16 items-center gap-3 border-b px-4 lg:px-6 border-[color:var(--admin-border)] ${
            dark ? "bg-zinc-900/80" : "bg-white/70 backdrop-blur-xl"
          }`}
        >
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-xl border p-2 lg:hidden cursor-pointer border-[color:var(--admin-border)]"
          >
            <Menu className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className={`flex min-w-0 flex-1 items-center gap-2 rounded-2xl border px-3 py-2 text-left text-xs text-muted-foreground cursor-pointer border-[color:var(--admin-border)] ${
              dark ? "bg-zinc-800" : "bg-white"
            }`}
          >
            <Search className="h-3.5 w-3.5" />
            <span className="truncate">Search products, orders, customers…</span>
            <kbd className="ml-auto hidden rounded-md border px-1.5 py-0.5 text-[9px] font-bold sm:inline border-[color:var(--admin-border)]">
              ⌘K
            </kbd>
          </button>

          <button
            type="button"
            onClick={() => setDark((v) => !v)}
            className="rounded-xl border p-2 cursor-pointer border-[color:var(--admin-border)]"
            title="Toggle admin dark mode"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>

      {searchOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 p-4 pt-[12vh]">
          <div
            className={`w-full max-w-xl overflow-hidden rounded-3xl border shadow-elegant border-[color:var(--admin-border)] ${
              dark ? "bg-zinc-900" : "bg-white"
            }`}
          >
            <div className="flex items-center gap-2 border-b px-4 py-3 border-[color:var(--admin-border)]">
              <Search className="h-4 w-4 text-primary" />
              <Input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Instant admin search…"
                className="border-0 shadow-none focus-visible:ring-0"
              />
              <button type="button" onClick={() => setSearchOpen(false)} className="cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {results.length === 0 ? (
                <p className="px-3 py-8 text-center text-xs text-muted-foreground">
                  {q ? "No matches" : "Type to search everything"}
                </p>
              ) : (
                results.map((item) => (
                  <button
                    key={`${item.type}-${item.label}-${item.id || ""}`}
                    type="button"
                    onClick={() => {
                      onNavigate(item.tab);
                      setSearchOpen(false);
                      setQ("");
                    }}
                    className={`flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left text-xs cursor-pointer ${
                      dark ? "hover:bg-zinc-800" : "hover:bg-secondary/20"
                    }`}
                  >
                    <span className="font-semibold">{item.label}</span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {item.type}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
