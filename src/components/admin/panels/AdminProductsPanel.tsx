import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, Archive, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deleteProduct, fetchAdminProducts, upsertProduct } from "@/lib/admin-data";
import { ProductsTab } from "@/components/admin/legacy/AdminLegacyTabs";

export function AdminProductsPanel() {
  const qc = useQueryClient();
  const productsQ = useQuery({ queryKey: ["admin-products"], queryFn: fetchAdminProducts });
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkStock, setBulkStock] = useState("");

  const ids = (productsQ.data ?? []).map((p: any) => p.id as string);

  const bulkDelete = useMutation({
    mutationFn: async () => {
      for (const id of selected) await deleteProduct(id);
    },
    onSuccess: () => {
      toast.success(`Deleted ${selected.length} products`);
      setSelected([]);
      qc.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const bulkPriceUpdate = useMutation({
    mutationFn: async () => {
      const price = Number(bulkPrice);
      if (!price) throw new Error("Enter a valid price");
      for (const id of selected) {
        const product = (productsQ.data ?? []).find((p: any) => p.id === id);
        if (product) await upsertProduct({ ...product, price });
      }
    },
    onSuccess: () => {
      toast.success("Bulk price updated");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-border/60 bg-[var(--admin-panel,#fff)] p-4 shadow-soft">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="rounded-full text-[10px] font-bold cursor-pointer"
            onClick={() => setSelected(selected.length === ids.length ? [] : ids)}
          >
            {selected.length === ids.length ? "Clear selection" : "Select all"}
          </Button>
          <span className="text-[10px] font-bold text-muted-foreground">
            {selected.length} selected
          </span>
          <div className="ml-auto flex flex-wrap gap-2">
            <Input
              value={bulkPrice}
              onChange={(e) => setBulkPrice(e.target.value)}
              placeholder="Bulk price"
              className="h-8 w-28 rounded-full text-[11px]"
            />
            <Button
              size="sm"
              variant="outline"
              disabled={!selected.length}
              onClick={() => bulkPriceUpdate.mutate()}
              className="rounded-full text-[10px] font-bold cursor-pointer"
            >
              Bulk Price
            </Button>
            <Input
              value={bulkStock}
              onChange={(e) => setBulkStock(e.target.value)}
              placeholder="Stock note"
              className="h-8 w-28 rounded-full text-[11px]"
            />
            <Button
              size="sm"
              variant="outline"
              disabled={!selected.length}
              onClick={() =>
                toast.message("Bulk stock", {
                  description: `Apply ${bulkStock || "0"} via Inventory tab for variants.`,
                })
              }
              className="rounded-full text-[10px] font-bold cursor-pointer"
            >
              Bulk Stock
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.message("CSV bulk upload coming soon — use Create Product for now")}
              className="rounded-full text-[10px] font-bold cursor-pointer"
            >
              <Upload className="mr-1 h-3 w-3" /> Bulk Upload
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.message("Archive moves products to draft visibility")}
              className="rounded-full text-[10px] font-bold cursor-pointer"
            >
              <Archive className="mr-1 h-3 w-3" /> Archive
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={!selected.length || bulkDelete.isPending}
              onClick={() => {
                if (confirm(`Delete ${selected.length} products?`)) bulkDelete.mutate();
              }}
              className="rounded-full text-[10px] font-bold cursor-pointer"
            >
              Bulk Delete
            </Button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(productsQ.data ?? []).slice(0, 40).map((p: any) => {
            const on = selected.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() =>
                  setSelected((prev) =>
                    on ? prev.filter((x) => x !== p.id) : [...prev, p.id],
                  )
                }
                className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold cursor-pointer ${
                  on ? "border-primary bg-primary/10 text-primary" : "border-border"
                }`}
              >
                {p.title?.slice(0, 28) || p.sku}
              </button>
            );
          })}
        </div>
        <p className="mt-3 flex items-center gap-1 text-[10px] text-muted-foreground">
          <Copy className="h-3 w-3" /> SEO, gallery, video, SKU, barcode, fabric, care, schedule &
          related products are available in the product editor below.
        </p>
      </div>
      <ProductsTab />
    </div>
  );
}
