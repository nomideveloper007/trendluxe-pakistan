import { Heart } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { fetchTrendLikeCount, fetchUserLikedTrend, likeTrend, unlikeTrend } from "@/lib/user-data";

export function LikeButton({
  trendSlug,
  baseLikes = 0,
}: {
  trendSlug: string;
  baseLikes?: number;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const countQ = useQuery({
    queryKey: ["trend-like-count", trendSlug],
    queryFn: () => fetchTrendLikeCount(trendSlug),
  });
  const likedQ = useQuery({
    queryKey: ["trend-liked", trendSlug, user?.id],
    queryFn: () => (user ? fetchUserLikedTrend(user.id, trendSlug) : Promise.resolve(false)),
    enabled: !!user,
  });

  const toggle = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("not-signed-in");
      if (likedQ.data) await unlikeTrend(user.id, trendSlug);
      else await likeTrend(user.id, trendSlug);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trend-like-count", trendSlug] });
      qc.invalidateQueries({ queryKey: ["trend-liked", trendSlug, user?.id] });
    },
    onError: (e: Error) => {
      if (e.message === "not-signed-in") {
        toast.info("Sign in to love this trend");
        navigate({ to: "/auth" });
      } else toast.error(e.message);
    },
  });

  const liked = !!likedQ.data;
  const total = baseLikes + (countQ.data ?? 0);

  return (
    <button
      onClick={() => toggle.mutate()}
      disabled={toggle.isPending}
      className={`group inline-flex items-center gap-2 rounded-full border px-5.5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all duration-300 transform active:scale-95 cursor-pointer shadow-soft hover:shadow-elegant ${
        liked
          ? "border-primary bg-primary text-primary-foreground hover:bg-accent"
          : "border-border bg-white text-foreground hover:border-primary hover:text-primary hover:-translate-y-0.5"
      }`}
    >
      <Heart
        className={`h-4 w-4 transition-all duration-300 group-hover:scale-115 ${liked ? "fill-current scale-110 text-rose-500" : ""}`}
      />
      {liked ? "Loved" : "Love"}
      <span className="text-[10px] font-mono opacity-80">{total}</span>
    </button>
  );
}
