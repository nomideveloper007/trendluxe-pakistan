import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { MessageCircle, Trash2, Pencil, X, Check, Send } from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  addComment,
  deleteComment,
  fetchComments,
  updateOwnComment,
  type Comment,
  type CommentTarget,
} from "@/lib/comments-data";

function initials(name?: string | null) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function Comments({
  targetType,
  targetId,
}: {
  targetType: CommentTarget;
  targetId: string;
}) {
  const { user, isAdmin } = useAuth();
  const qc = useQueryClient();
  const queryKey = ["comments", targetType, targetId];

  const listQ = useQuery({
    queryKey,
    queryFn: () => fetchComments(targetType, targetId),
    enabled: !!targetId,
  });

  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");

  const create = useMutation({
    mutationFn: () => {
      if (!user) throw new Error("not-signed-in");
      return addComment({ userId: user.id, targetType, targetId, body: draft });
    },
    onSuccess: () => {
      setDraft("");
      toast.success("Comment posted successfully ✨");
      qc.invalidateQueries({ queryKey });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: (vars: { id: string; body: string }) => updateOwnComment(vars.id, vars.body),
    onSuccess: () => {
      setEditingId(null);
      toast.success("Comment updated");
      qc.invalidateQueries({ queryKey });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteComment(id),
    onSuccess: () => {
      toast.success("Comment removed");
      qc.invalidateQueries({ queryKey });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const comments = listQ.data ?? [];
  const visibleCount = comments.filter((c) => c.status === "visible" || c.user_id === user?.id || isAdmin).length;

  return (
    <section className="container-page mt-16" id="comments">
      <div className="mx-auto max-w-2xl border-t border-border/80 pt-10">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-2 text-primary">
            <MessageCircle className="h-4.5 w-4.5" />
          </div>
          <h2 className="font-display text-xl font-semibold">Discussion Feed</h2>
          <span className="text-xs font-semibold text-muted-foreground bg-secondary/50 px-2.5 py-1 rounded-full border border-border/60">
            {visibleCount} {visibleCount === 1 ? "comment" : "comments"}
          </span>
        </div>

        {user ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (draft.trim()) create.mutate();
            }}
            className="mb-8 rounded-2xl border border-border bg-white p-4 shadow-soft hover:shadow-elegant transition-all duration-300"
          >
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, 2000))}
              rows={3}
              placeholder="Join the visual fashion discussion..."
              className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/80"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[10px] font-mono text-muted-foreground">{draft.length}/2000 characters</span>
              <button
                type="submit"
                disabled={!draft.trim() || create.isPending}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:bg-accent disabled:opacity-50 transition cursor-pointer"
              >
                {create.isPending ? "Posting..." : (
                  <>
                    <Send className="h-3 w-3" /> Post Comment
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="mb-8 rounded-2xl border border-dashed border-border bg-[#FFF9FB]/50 p-6 text-center text-sm text-muted-foreground shadow-soft">
            <Link to="/auth" className="font-semibold text-primary hover:underline">Sign in</Link> to participate in the lookbook reviews.
          </div>
        )}

        <div className="space-y-4">
          {listQ.isLoading && (
            <div className="rounded-2xl border border-border bg-white py-12 text-center text-xs text-muted-foreground italic">
              Loading editorial discussion thread...
            </div>
          )}
          {!listQ.isLoading && comments.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border py-14 text-center text-xs text-muted-foreground italic">
              Be the first to share style feedback on this post.
            </div>
          )}
          {comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              canEdit={user?.id === c.user_id}
              canDelete={user?.id === c.user_id || isAdmin}
              isEditing={editingId === c.id}
              editDraft={editDraft}
              onEditStart={() => {
                setEditingId(c.id);
                setEditDraft(c.body);
              }}
              onEditCancel={() => setEditingId(null)}
              onEditChange={setEditDraft}
              onEditSave={() => update.mutate({ id: c.id, body: editDraft })}
              onDelete={() => {
                if (confirm("Delete this comment permanently?")) remove.mutate(c.id);
              }}
              savingEdit={update.isPending}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function CommentItem({
  comment,
  canEdit,
  canDelete,
  isEditing,
  editDraft,
  onEditStart,
  onEditCancel,
  onEditChange,
  onEditSave,
  onDelete,
  savingEdit,
}: {
  comment: Comment;
  canEdit: boolean;
  canDelete: boolean;
  isEditing: boolean;
  editDraft: string;
  onEditStart: () => void;
  onEditCancel: () => void;
  onEditChange: (v: string) => void;
  onEditSave: () => void;
  onDelete: () => void;
  savingEdit: boolean;
}) {
  const name = comment.author?.display_name || "Anonymous";
  const hidden = comment.status === "hidden";
  return (
    <div className={`rounded-2xl border border-border bg-white p-4.5 shadow-soft transition-all hover:shadow-elegant animate-fade-in ${hidden ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-4">
        {/* User initials bubble avatar */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blush text-xs font-semibold text-primary border border-primary/20 shadow-soft shrink-0">
          {comment.author?.avatar_url ? (
            <img src={comment.author.avatar_url} alt={name} className="h-full w-full object-cover" />
          ) : (
            initials(name)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-foreground">{name}</span>
            <span className="text-[10px] text-muted-foreground font-medium">{timeAgo(comment.created_at)}</span>
            {hidden && (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[8px] uppercase tracking-wider font-semibold text-muted-foreground border border-border">
                Hidden by mod
              </span>
            )}
          </div>
          {isEditing ? (
            <div className="mt-2.5 space-y-2">
              <textarea
                value={editDraft}
                onChange={(e) => onEditChange(e.target.value.slice(0, 2000))}
                rows={3}
                className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
              />
              <div className="mt-2 flex justify-end gap-1.5">
                <button 
                  onClick={onEditCancel} 
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-3.5 py-1.5 text-[10px] font-semibold text-muted-foreground hover:bg-secondary/15 transition cursor-pointer"
                >
                  <X className="h-3 w-3" /> Cancel
                </button>
                <button
                  onClick={onEditSave}
                  disabled={savingEdit || !editDraft.trim()}
                  className="inline-flex items-center gap-1 rounded-full bg-primary px-3.5 py-1.5 text-[10px] font-semibold text-primary-foreground hover:bg-accent disabled:opacity-50 transition cursor-pointer"
                >
                  <Check className="h-3 w-3" /> {savingEdit ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 font-medium">{comment.body}</p>
          )}
        </div>
        {!isEditing && (canEdit || canDelete) && (
          <div className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 md:opacity-100 transition-opacity">
            {canEdit && (
              <button
                onClick={onEditStart}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-primary transition cursor-pointer"
                aria-label="Edit comment"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}
            {canDelete && (
              <button
                onClick={onDelete}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition cursor-pointer"
                aria-label="Delete comment"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
