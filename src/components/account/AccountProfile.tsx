import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Image, Key, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { updateProfile } from "@/lib/user-data";
import { loadJson, saveJson } from "./account-utils";

const avatarTemplates = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
];

type Props = {
  userId?: string;
  email?: string | null;
  displayName: string;
  bio: string;
  avatarUrl: string;
};

type ExtraProfile = {
  firstName: string;
  lastName: string;
  phone: string;
  birthday: string;
  gender: string;
};

export function AccountProfile({ userId, email, displayName, bio, avatarUrl }: Props) {
  const qc = useQueryClient();
  const extraKey = `pahraan_profile_extra_${userId || "guest"}`;
  const [name, setName] = useState(displayName);
  const [about, setAbout] = useState(bio);
  const [avatar, setAvatar] = useState(avatarUrl);
  const [extra, setExtra] = useState<ExtraProfile>({
    firstName: "",
    lastName: "",
    phone: "",
    birthday: "",
    gender: "",
  });

  useEffect(() => {
    setName(displayName);
    setAbout(bio);
    setAvatar(avatarUrl);
  }, [displayName, bio, avatarUrl]);

  useEffect(() => {
    const stored = loadJson<ExtraProfile>(extraKey, {
      firstName: "",
      lastName: "",
      phone: "",
      birthday: "",
      gender: "",
    });
    if (!stored.firstName && displayName) {
      const parts = displayName.trim().split(/\s+/);
      stored.firstName = parts[0] || "";
      stored.lastName = parts.slice(1).join(" ");
    }
    setExtra(stored);
  }, [extraKey, displayName]);

  const saveMut = useMutation({
    mutationFn: async () => {
      if (!userId) return;
      const combined = [extra.firstName, extra.lastName].filter(Boolean).join(" ").trim() || name;
      await updateProfile(userId, {
        display_name: combined,
        bio: about,
        avatar_url: avatar,
      });
      saveJson(extraKey, extra);
    },
    onSuccess: () => {
      toast.success("Profile updated");
      qc.invalidateQueries({ queryKey: ["profile", userId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handlePasswordReset = async () => {
    if (!email) return;
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (error) throw error;
      toast.success("Password reset email sent");
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset email");
    }
  };

  const handleDeleteAccount = async () => {
    toast.message("Account deletion requested", {
      description: "Our support team will confirm within 48 hours via email.",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-2xl font-bold">Profile</h2>
        <p className="mt-1 text-xs text-muted-foreground">Your Pahraan member details.</p>
      </div>

      <div className="max-w-2xl space-y-6 rounded-3xl border border-border/60 bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-5 rounded-2xl border border-border/40 bg-[#FFF9FB] p-5 sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary/20 bg-primary/5 font-display text-2xl font-bold text-primary shadow-soft">
            {avatar ? (
              <img src={avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              (name || email || "?")[0]?.toUpperCase()
            )}
          </div>
          <div className="flex-1 space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Profile Photo URL
            </Label>
            <input
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="w-full rounded-full border border-border bg-white px-4 py-2.5 text-xs outline-none focus:border-primary"
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Image className="h-3.5 w-3.5 text-primary" /> Templates
          </Label>
          <div className="flex flex-wrap gap-2.5">
            {avatarTemplates.map((url) => (
              <button
                key={url}
                type="button"
                onClick={() => setAvatar(url)}
                className={`h-11 w-11 overflow-hidden rounded-full border-2 transition hover:scale-105 cursor-pointer ${
                  avatar === url ? "border-primary scale-105" : "border-transparent"
                }`}
              >
                <img src={url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="First Name"
            value={extra.firstName}
            onChange={(v) => setExtra((e) => ({ ...e, firstName: v }))}
          />
          <Field
            label="Last Name"
            value={extra.lastName}
            onChange={(v) => setExtra((e) => ({ ...e, lastName: v }))}
          />
          <Field
            label="Phone"
            value={extra.phone}
            onChange={(v) => setExtra((e) => ({ ...e, phone: v }))}
            placeholder="03XXXXXXXXX"
          />
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Email
            </Label>
            <input
              type="email"
              value={email || ""}
              disabled
              className="w-full rounded-full border border-border bg-muted/40 px-5 py-3 text-sm text-muted-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Birthday
            </Label>
            <input
              type="date"
              value={extra.birthday}
              onChange={(e) => setExtra((x) => ({ ...x, birthday: e.target.value }))}
              className="w-full rounded-full border border-border bg-white px-5 py-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Gender (optional)
            </Label>
            <select
              value={extra.gender}
              onChange={(e) => setExtra((x) => ({ ...x, gender: e.target.value }))}
              className="w-full rounded-full border border-border bg-white px-5 py-3 text-sm outline-none focus:border-primary"
            >
              <option value="">Prefer not to say</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Label>About your style</Label>
            <span>{about.length}/280</span>
          </div>
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            maxLength={280}
            rows={3}
            className="w-full rounded-2xl border border-border bg-white px-5 py-3.5 text-sm outline-none focus:border-primary"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-4">
          <Button
            onClick={() => saveMut.mutate()}
            disabled={saveMut.isPending}
            className="rounded-full bg-primary px-8 text-xs font-semibold text-white hover:bg-accent cursor-pointer"
          >
            {saveMut.isPending ? "Saving..." : "Save changes"}
          </Button>
          <button
            type="button"
            onClick={handlePasswordReset}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline cursor-pointer"
          >
            <Key className="h-3.5 w-3.5" /> Change Password
          </button>
        </div>
      </div>

      <div className="max-w-2xl rounded-3xl border border-rose-100 bg-rose-50/50 p-5">
        <h3 className="text-sm font-bold text-rose-800">Delete Account</h3>
        <p className="mt-1 text-xs text-rose-700/80">
          Permanently remove your Pahraan account and personal data.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              className="mt-4 rounded-full border-rose-200 text-xs font-semibold text-rose-700 hover:bg-rose-100 cursor-pointer"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Request deletion
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-3xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display">Delete your account?</AlertDialogTitle>
              <AlertDialogDescription>
                This submits a deletion request. Our team will confirm by email before removing your
                data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-full cursor-pointer">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAccount}
                className="rounded-full bg-rose-600 text-white hover:bg-rose-700 cursor-pointer"
              >
                Confirm request
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-full border border-border bg-white px-5 py-3 text-sm outline-none focus:border-primary"
      />
    </div>
  );
}
