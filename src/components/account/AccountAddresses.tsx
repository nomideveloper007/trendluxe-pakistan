import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit3, MapPin, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  createUserAddress,
  deleteUserAddress,
  updateUserAddress,
  type UserAddress,
} from "@/lib/ecommerce-data";

type Props = {
  addresses: UserAddress[];
  loading?: boolean;
  userId?: string;
};

const emptyForm = {
  label: "Home",
  first_name: "",
  last_name: "",
  phone: "",
  address_line1: "",
  address_line2: "",
  city: "",
  state: "Sindh",
  postal_code: "",
  is_default: false,
};

export function AccountAddresses({ addresses, loading, userId }: Props) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const reset = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const openCreate = () => {
    reset();
    setOpen(true);
  };

  const openEdit = (addr: UserAddress) => {
    setEditingId(addr.id);
    setForm({
      label: addr.label,
      first_name: addr.first_name,
      last_name: addr.last_name,
      phone: addr.phone,
      address_line1: addr.address_line1,
      address_line2: addr.address_line2 || "",
      city: addr.city,
      state: addr.state,
      postal_code: addr.postal_code,
      is_default: addr.is_default,
    });
    setOpen(true);
  };

  const saveMut = useMutation({
    mutationFn: async () => {
      if (!userId) return;
      if (!form.first_name || !form.last_name || !form.phone || !form.address_line1 || !form.city) {
        throw new Error("Please fill out all required fields");
      }
      const payload = {
        user_id: userId,
        label: form.label,
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        address_line1: form.address_line1,
        address_line2: form.address_line2 || null,
        city: form.city,
        state: form.state,
        postal_code: form.postal_code,
        country: "Pakistan",
        is_default: form.is_default,
      };
      if (editingId) {
        await updateUserAddress(editingId, userId, payload);
      } else {
        await createUserAddress(payload);
      }
    },
    onSuccess: () => {
      toast.success(editingId ? "Address updated" : "Address added");
      setOpen(false);
      reset();
      qc.invalidateQueries({ queryKey: ["user-addresses", userId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      if (!userId) return;
      await deleteUserAddress(id, userId);
    },
    onSuccess: () => {
      toast.success("Address deleted");
      qc.invalidateQueries({ queryKey: ["user-addresses", userId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setDefaultMut = useMutation({
    mutationFn: async (id: string) => {
      if (!userId) return;
      await updateUserAddress(id, userId, { is_default: true });
    },
    onSuccess: () => {
      toast.success("Default address updated");
      qc.invalidateQueries({ queryKey: ["user-addresses", userId] });
    },
  });

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-48 rounded-3xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">Saved Addresses</h2>
          <p className="mt-1 text-xs text-muted-foreground">Delivery locations across Pakistan.</p>
        </div>
        <Button
          onClick={openCreate}
          className="rounded-full bg-primary text-xs font-semibold text-white hover:bg-accent cursor-pointer"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <p className="rounded-3xl border border-dashed bg-white py-12 text-center text-xs text-muted-foreground shadow-soft">
          No addresses saved. Add one for faster checkout.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="rounded-3xl border border-border/60 bg-white p-5 shadow-soft transition hover:border-primary/15"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-primary">
                  {addr.label}
                </span>
                {addr.is_default ? (
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[8px] font-extrabold uppercase text-emerald-700">
                    Default
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDefaultMut.mutate(addr.id)}
                    className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                  >
                    Set default
                  </button>
                )}
              </div>
              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                <p className="font-semibold text-foreground">
                  {addr.first_name} {addr.last_name}
                </p>
                <p>{addr.phone}</p>
                <p>
                  {addr.address_line1}
                  {addr.address_line2 ? `, ${addr.address_line2}` : ""}
                </p>
                <p>
                  {addr.city}, {addr.state} {addr.postal_code}
                </p>
              </div>

              <div className="mt-4 overflow-hidden rounded-2xl border border-border/50 bg-[#FFF9FB]">
                <div className="flex h-28 items-center justify-center gap-2 text-[11px] font-semibold text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  Google Maps placeholder · {addr.city}
                </div>
              </div>

              <div className="mt-3 flex justify-end gap-1 border-t border-border/40 pt-3">
                <button
                  type="button"
                  onClick={() => openEdit(addr)}
                  className="rounded-full p-2 text-muted-foreground transition hover:bg-secondary/20 hover:text-primary cursor-pointer"
                  title="Edit"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteMut.mutate(addr.id)}
                  className="rounded-full p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) reset();
        }}
      >
        <DialogContent className="max-w-md rounded-3xl border border-border bg-white p-6 shadow-elegant">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold">
              {editingId ? "Edit Address" : "Add Delivery Address"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3.5 py-2 text-xs">
            <div className="grid grid-cols-3 gap-2">
              {["Home", "Office", "Billing", "Other"].map((lbl) => (
                <button
                  key={lbl}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, label: lbl }))}
                  className={`rounded-xl border py-1.5 font-semibold transition cursor-pointer ${
                    form.label === lbl
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:bg-secondary/10"
                  }`}
                >
                  {lbl}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Field
                label="First Name *"
                value={form.first_name}
                onChange={(v) => setForm((f) => ({ ...f, first_name: v }))}
              />
              <Field
                label="Last Name *"
                value={form.last_name}
                onChange={(v) => setForm((f) => ({ ...f, last_name: v }))}
              />
            </div>
            <Field
              label="Phone *"
              value={form.phone}
              onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
              placeholder="03XXXXXXXXX"
            />
            <Field
              label="Street Address *"
              value={form.address_line1}
              onChange={(v) => setForm((f) => ({ ...f, address_line1: v }))}
            />
            <Field
              label="Apartment / Floor"
              value={form.address_line2}
              onChange={(v) => setForm((f) => ({ ...f, address_line2: v }))}
            />
            <div className="grid grid-cols-3 gap-2">
              <Field
                label="City *"
                value={form.city}
                onChange={(v) => setForm((f) => ({ ...f, city: v }))}
              />
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Province
                </label>
                <select
                  value={form.state}
                  onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-background px-2 py-2 text-xs outline-none focus:border-primary"
                >
                  <option value="Sindh">Sindh</option>
                  <option value="Punjab">Punjab</option>
                  <option value="KPK">KPK</option>
                  <option value="Balochistan">Balochistan</option>
                  <option value="Federal">Islamabad</option>
                </select>
              </div>
              <Field
                label="Postal"
                value={form.postal_code}
                onChange={(v) => setForm((f) => ({ ...f, postal_code: v }))}
              />
            </div>

            <label className="flex items-center justify-between border-t border-border/45 pt-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Set as default
              </span>
              <input
                type="checkbox"
                checked={form.is_default}
                onChange={(e) => setForm((f) => ({ ...f, is_default: e.target.checked }))}
                className="h-4 w-4 accent-primary"
              />
            </label>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-full text-xs cursor-pointer">
              Cancel
            </Button>
            <Button
              onClick={() => saveMut.mutate()}
              disabled={saveMut.isPending}
              className="rounded-full bg-primary text-xs font-semibold text-white hover:bg-accent cursor-pointer"
            >
              {saveMut.isPending ? "Saving..." : editingId ? "Save changes" : "Add Address"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
    <div className="space-y-1">
      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
      />
    </div>
  );
}
