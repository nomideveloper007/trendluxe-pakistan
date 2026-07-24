import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail, MessageCircle, Phone, Ticket } from "lucide-react";
import { toast } from "sonner";
import { loadJson, saveJson, type SupportTicket } from "./account-utils";

const FAQS = [
  {
    q: "How long does delivery take?",
    a: "Standard nationwide delivery is 3–5 business days. Express options are available at checkout.",
  },
  {
    q: "What is your return policy?",
    a: "Unworn pieces with tags may be returned within 7 days of delivery. Custom / bridal orders are final sale.",
  },
  {
    q: "Do you offer alterations?",
    a: "Select cities include complimentary minor alterations. Contact support after your order ships.",
  },
  {
    q: "How do reward points work?",
    a: "Earn roughly 1 point per PKR 100 spent on delivered orders. Redeem points for shipping upgrades and credits.",
  },
];

export function AccountSupport({ userId }: { userId?: string }) {
  const key = `pahraan_tickets_${userId || "guest"}`;
  const [tickets, setTickets] = useState<SupportTicket[]>(() =>
    loadJson(key, [] as SupportTicket[]),
  );
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const submitTicket = () => {
    if (!subject.trim() || !message.trim()) {
      toast.error("Please complete the ticket");
      return;
    }
    const next: SupportTicket[] = [
      {
        id: `tkt-${Date.now()}`,
        subject,
        message,
        status: "open",
        createdAt: new Date().toISOString(),
      },
      ...tickets,
    ];
    setTickets(next);
    saveJson(key, next);
    setOpen(false);
    setSubject("");
    setMessage("");
    toast.success("Support ticket opened");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-bold">Support Center</h2>
        <p className="mt-1 text-xs text-muted-foreground">We&apos;re here for every fitting question.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ContactCard
          icon={MessageCircle}
          title="Live Chat"
          detail="Placeholder — coming soon"
          onClick={() => toast.message("Live chat launches soon")}
        />
        <a href="https://wa.me/923001234567" target="_blank" rel="noreferrer">
          <ContactCard icon={Phone} title="WhatsApp" detail="Chat with styling desk" />
        </a>
        <a href="mailto:hello@pahraan.com">
          <ContactCard icon={Mail} title="Email" detail="hello@pahraan.com" />
        </a>
        <a href="tel:+922112345678">
          <ContactCard icon={Phone} title="Call" detail="+92 21 1234 5678" />
        </a>
      </div>

      <section className="rounded-3xl border border-border/60 bg-white p-5 shadow-soft">
        <h3 className="font-display text-lg font-bold">FAQ</h3>
        <Accordion type="single" collapsible className="mt-2">
          {FAQS.map((item, i) => (
            <AccordionItem key={item.q} value={`faq-${i}`}>
              <AccordionTrigger className="text-left text-sm font-semibold hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-xs leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="rounded-3xl border border-border/60 bg-white p-5 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 font-display text-lg font-bold">
            <Ticket className="h-4.5 w-4.5 text-primary" /> Ticket System
          </h3>
          <Button
            onClick={() => setOpen(true)}
            className="rounded-full bg-primary text-xs font-semibold text-white hover:bg-accent cursor-pointer"
          >
            New ticket
          </Button>
        </div>
        {tickets.length === 0 ? (
          <p className="mt-4 text-xs text-muted-foreground">No open tickets.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {tickets.map((t) => (
              <div
                key={t.id}
                className="rounded-2xl border border-border/40 bg-[#FFF9FB] px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-bold">{t.subject}</p>
                  <span className="rounded-full bg-secondary/40 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                    {t.status.replace("_", " ")}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">{t.message}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display">Open a Ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-xs">
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="w-full rounded-xl border border-border px-3 py-2 outline-none focus:border-primary"
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="How can we help?"
              className="w-full rounded-xl border border-border px-3 py-2 outline-none focus:border-primary"
            />
          </div>
          <DialogFooter>
            <Button
              onClick={submitTicket}
              className="rounded-full bg-primary text-xs font-semibold text-white hover:bg-accent cursor-pointer"
            >
              Submit ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ContactCard({
  icon: Icon,
  title,
  detail,
  onClick,
}: {
  icon: typeof Mail;
  title: string;
  detail: string;
  onClick?: () => void;
}) {
  const className =
    "flex h-full w-full flex-col rounded-3xl border border-border/60 bg-white p-5 text-left shadow-soft transition hover:border-primary/20 cursor-pointer";
  const body = (
    <>
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary/25 text-primary">
        <Icon className="h-4.5 w-4.5" />
      </span>
      <p className="mt-4 text-sm font-bold">{title}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{detail}</p>
    </>
  );
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {body}
      </button>
    );
  }
  return <div className={className}>{body}</div>;
}
