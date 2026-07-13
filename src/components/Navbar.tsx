import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, Search, User, Shield } from "lucide-react";
import { SITE } from "@/lib/content";
import { useAuth } from "@/lib/auth";
import logo from "@/assets/logo-trendlibas.png";

const links = [
  { to: "/", label: "Home" },
  { to: "/trends", label: "Trends" },
  { to: "/blog", label: "Blog" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { session, isAdmin } = useAuth();
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2" aria-label={SITE.name}>
          <img src={logo} alt={`${SITE.name} logo`} width={140} height={40} className="h-10 w-auto" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
              activeProps={{ className: "text-primary" }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button
            aria-label="Search"
            className="grid h-9 w-9 place-items-center rounded-full text-foreground/70 transition hover:bg-secondary/60 hover:text-primary"
          >
            <Search className="h-4 w-4" />
          </button>
          {isAdmin && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20"
            >
              <Shield className="h-3.5 w-3.5" /> Admin
            </Link>
          )}
          {session ? (
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary"
            >
              <User className="h-4 w-4" /> Profile
            </Link>
          ) : (
            <Link
              to="/auth"
              className="text-sm font-medium text-foreground/80 hover:text-primary"
            >
              Sign in
            </Link>
          )}
          <Link
            to="/trends"
            className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:bg-accent"
          >
            Explore Trends
          </Link>
        </div>

        <button
          className="md:hidden"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="container-page flex flex-col py-4">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="py-2 text-sm font-medium text-foreground/80"
                activeProps={{ className: "text-primary" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin" onClick={() => setOpen(false)} className="py-2 text-sm font-medium text-primary">
                Admin dashboard
              </Link>
            )}
            <Link
              to={session ? "/profile" : "/auth"}
              onClick={() => setOpen(false)}
              className="py-2 text-sm font-medium text-primary"
            >
              {session ? "Your profile" : "Sign in"}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
