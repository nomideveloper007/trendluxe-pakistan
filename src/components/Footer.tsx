import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MessageCircle } from "lucide-react";
import { SITE } from "@/lib/content";
import { NewsletterForm } from "./NewsletterForm";
import logo from "@/assets/logo-pahraan.png";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border/60 bg-blush md:mt-24 mb-16 md:mb-0">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-3">
            <img src={logo} alt={`${SITE.name} logo`} loading="lazy" className="h-14 w-auto" />
            <span className="font-display text-2xl font-semibold tracking-wider text-primary">
              {SITE.name}
            </span>
          </div>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground leading-relaxed">
            {SITE.description}
          </p>
          <div className="mt-6 flex gap-2.5">
            {[
              { Icon: Instagram, label: "Instagram" },
              { Icon: Facebook, label: "Facebook" },
              { Icon: MessageCircle, label: "WhatsApp" },
              { Icon: Mail, label: "Email" },
            ].map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="grid h-10 w-10 place-items-center rounded-full bg-surface shadow-soft transition hover:-translate-y-0.5 hover:text-primary"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-bold tracking-widest text-foreground uppercase">
            Quick Links
          </h4>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li>
              <Link to="/shop" className="hover:text-primary transition">
                Shop
              </Link>
            </li>
            <li>
              <Link
                to="/shop"
                search={{ tag: "new-arrivals" }}
                className="hover:text-primary transition"
              >
                New Arrivals
              </Link>
            </li>
            <li>
              <Link to="/shop" search={{ tag: "sale" }} className="hover:text-primary transition">
                Sale
              </Link>
            </li>
            <li>
              <Link to="/blog" className="hover:text-primary transition">
                Blog
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-primary transition">
                About
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-bold tracking-widest text-foreground uppercase">
            Collections
          </h4>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            {[
              ["lawn-suits", "Lawn Collection"],
              ["luxury-pret", "Luxury Pret"],
              ["bridal-wear", "Bridal"],
              ["casual-wear", "Casual Wear"],
              ["party-wear", "Party Wear"],
            ].map(([slug, name]) => (
              <li key={slug}>
                <Link
                  to="/shop"
                  search={{ category: slug }}
                  className="hover:text-primary transition"
                >
                  {name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-xs font-bold tracking-widest text-foreground uppercase">
            Customer Service
          </h4>
          <ul className="space-y-2.5 text-sm text-muted-foreground">
            <li>
              <Link to="/contact" className="hover:text-primary transition">
                Contact
              </Link>
            </li>
            <li>
              <Link
                to="/profile"
                search={{ tab: "orders" }}
                className="hover:text-primary transition"
              >
                Track Order
              </Link>
            </li>
            <li>
              <Link to="/wishlist" className="hover:text-primary transition">
                Wishlist
              </Link>
            </li>
            <li>
              <span className="hover:text-primary transition cursor-default">Privacy Policy</span>
            </li>
            <li>
              <span className="hover:text-primary transition cursor-default">Terms</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="container-page grid gap-6 py-10 md:grid-cols-2 md:items-center">
          <div>
            <h4 className="font-display text-2xl font-semibold">Join the Pahraan list</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              New drops, private sales, and styling notes — in your inbox.
            </p>
          </div>
          <NewsletterForm />
        </div>
        <div className="container-page flex flex-col items-center justify-between gap-2 py-6 text-xs text-muted-foreground md:flex-row">
          <p>
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <p>Luxury Pakistani women&apos;s fashion · COD available nationwide</p>
        </div>
      </div>
    </footer>
  );
}
