import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Youtube, Mail } from "lucide-react";
import { SITE, categories } from "@/lib/content";
import { NewsletterForm } from "./NewsletterForm";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-blush">
      <div className="container-page grid gap-10 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="font-display text-2xl font-bold text-gradient">{SITE.name}</div>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">{SITE.description}</p>
          <div className="mt-6 flex gap-3">
            {[Instagram, Facebook, Youtube, Mail].map((I, i) => (
              <a
                key={i}
                href="#"
                aria-label="social"
                className="grid h-10 w-10 place-items-center rounded-full bg-surface shadow-soft transition hover:-translate-y-0.5 hover:text-primary"
              >
                <I className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold tracking-wide text-foreground uppercase">
            Explore
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/trends" className="hover:text-primary">All Trends</Link></li>
            <li><Link to="/blog" className="hover:text-primary">Blog</Link></li>
            <li><Link to="/about" className="hover:text-primary">About</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold tracking-wide text-foreground uppercase">
            Categories
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {categories.slice(0, 5).map((c) => (
              <li key={c.slug}>
                <Link to="/trends" hash={c.slug} className="hover:text-primary">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="container-page grid gap-6 py-10 md:grid-cols-2 md:items-center">
          <div>
            <h4 className="font-display text-2xl font-semibold">Get inspired weekly</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Fresh trends, styling tips and the best of Pakistani fashion — in your inbox.
            </p>
          </div>
          <NewsletterForm />
        </div>
        <div className="container-page flex flex-col items-center justify-between gap-2 py-6 text-xs text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
          <p>Made with care for the Pakistani fashion community.</p>
        </div>
      </div>
    </footer>
  );
}
