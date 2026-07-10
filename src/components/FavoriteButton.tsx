import { Bookmark } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { addFavorite, isFavorite, removeFavorite } from "@/lib/user-data";

export function FavoriteButton({
  itemType,
  itemSlug,
}: {
  itemType: "trend" | "blog";
  itemSlug: string;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const savedQ = useQuery({
    queryKey: ["favorite", itemType, itemSlug, user?.id],
    queryFn: () => (user ? isFavorite(user.id, itemType, itemSlug) : Promise.resolve(false)),
    enabled: !!user,
  });

  const toggle = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("not-signed-in");
      if (savedQ.data) await removeFavorite(user.id, itemType, itemSlug);
      else await addFavorite(user.id, itemType, itemSlug);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["favorite", itemType, itemSlug, user?.id] });
      qc.invalidateQueries({ queryKey: ["favorites", user?.id] });
      toast.success(savedQ.data ? "Removed from saved" : "Saved to your favorites");
    },
    onError: (e: Error) => {
      if (e.message === "not-signed-in") {
        toast.info("Sign in to save this");
        navigate({ to: "/auth" });
      } else toast.error(e.message);
    },
  });

  const saved = !!savedQ.data;

  return (
    <button
      onClick={() => toggle.mutate()}
      disabled={toggle.isPending}
      className={`inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-medium transition ${
        saved
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-surface text-foreground hover:border-primary hover:text-primary"
      }`}
    >
      <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
      {saved ? "Saved" : "Save"}
    </button>
  );
}
