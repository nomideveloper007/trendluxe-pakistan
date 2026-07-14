import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { subscribeToNewsletter } from "@/lib/user-data";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
});

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ email });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid email");
      return;
    }
    setLoading(true);
    try {
      await subscribeToNewsletter(parsed.data.email);
      toast.success("You're on the list — welcome to PAHRAAN ✨");
      setEmail("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not subscribe");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className={`flex w-full items-center gap-2 ${compact ? "" : "md:justify-end"}`}
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="min-w-0 flex-1 rounded-full border border-border bg-surface px-5 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition hover:bg-accent disabled:opacity-60"
      >
        {loading ? "…" : "Subscribe"}
      </button>
    </form>
  );
}
