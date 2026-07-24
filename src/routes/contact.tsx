import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, Instagram, MapPin } from "lucide-react";
import { SITE } from "@/lib/content";
import { sendContactMessage } from "@/lib/user-data";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  subject: z.string().trim().min(1, "Subject is required").max(150),
  message: z.string().trim().min(10, "Please write a bit more").max(2000),
});

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: `Contact — ${SITE.name}` },
      {
        name: "description",
        content: `Get in touch with the ${SITE.name} team — feedback, collaborations and press.`,
      },
      { property: "og:title", content: `Contact — ${SITE.name}` },
      { property: "og:description", content: `Get in touch with the ${SITE.name} team.` },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check your details");
      return;
    }
    setLoading(true);
    try {
      await sendContactMessage(parsed.data);
      toast.success("Thanks — we'll be in touch soon.");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not send message");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <section className="bg-hero py-16 md:py-20">
        <div className="container-page text-center">
          <p className="text-xs uppercase tracking-widest text-primary">Say hi</p>
          <h1 className="mt-3 font-display text-5xl text-foreground md:text-6xl">
            Let's talk fashion
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Feedback, collaborations, features or press — drop us a note.
          </p>
        </div>
      </section>

      <section className="container-page grid gap-12 py-16 md:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6">
          {[
            { icon: Mail, label: "Email", value: "hello@pahraan.com" },
            { icon: Instagram, label: "Instagram", value: "@pahraan" },
            { icon: MapPin, label: "Studio", value: "Karachi · Lahore · London" },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="flex items-start gap-4 rounded-2xl bg-surface p-5 shadow-soft"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  {label}
                </div>
                <div className="mt-1 font-medium">{value}</div>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={onSubmit} className="rounded-3xl bg-surface p-8 shadow-elegant">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Name">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Ayesha"
                required
                maxLength={100}
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="you@email.com"
                required
                maxLength={255}
              />
            </Field>
          </div>
          <Field label="Subject" className="mt-4">
            <input
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Trend collaboration"
              required
              maxLength={150}
            />
          </Field>
          <Field label="Message" className="mt-4">
            <textarea
              rows={6}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Tell us what's on your mind…"
              required
              maxLength={2000}
            />
          </Field>
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground shadow-elegant transition hover:bg-accent disabled:opacity-60 md:w-auto"
          >
            {loading ? "Sending…" : "Send message"}
          </button>
        </form>
      </section>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
