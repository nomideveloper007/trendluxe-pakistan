import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { MessageCircle, Trash2, Pencil, X, Check } from "lucide-react";
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
  return new Date(iso).toLocaleDateString();
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
      toast.success("Comment posted");
      qc.invalidateQueries({ queryKey });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const update = useMutation({
    mutationFn: (vars: { id: string; body: string }) => updateOwnComment(vars.id, vars.body),
    onSuccess: () => {
      setEditingId(null);
      toast.success("Updated");
      qc.invalidateQueries({ queryKey });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteComment(id),
    onSuccess: () => {
      toast.success("Comment deleted");
      qc.invalidateQueries({ queryKey });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const comments = listQ.data ?? [];
  const visibleCount = comments.filter((c) => c.status === "visible" || c.user_id === user?.id || isAdmin).length;

  return (
    <section className="container-page mt-16" id="comments">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-3">
          <MessageCircle className="h-5 w-5 text-primary" />
          <h2 className="font-display text-2xl">Comments</h2>
          <span className="text-sm text-muted-foreground">({visibleCount})</span>
        </div>

        {user ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (draft.trim()) create.mutate();
            }}
            className="mb-8 rounded-2xl border border-border bg-surface p-4 shadow-soft"
          >
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, 2000))}
              rows={3}
              placeholder="Share your thoughts…"
              className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{draft.length}/2000</span>
              <button
                type="submit"
                disabled={!draft.trim() || create.isPending}
                className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-accent disabled:opacity-50"
              >
                {create.isPending ? "Posting…" : "Post comment"}
              </button>
            </div>
          </form>
        ) : (
          <div className="mb-8 rounded-2xl border border-dashed border-border bg-surface p-6 text-center text-sm text-muted-foreground">
            <Link to="/auth" className="text-primary hover:underline">Sign in</Link> to join the conversation.
          </div>
        )}

        <div className="space-y-4">
          {listQ.isLoading && (
            <div className="rounded-2xl border border-border bg-surface p-6 text-center text-sm text-muted-foreground">
              Loading comments…
            </div>
          )}
          {!listQ.isLoading && comments.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
              Be the first to comment.
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
                if (confirm("Delete this comment?")) remove.mutate(c.id);
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
    <div className={`rounded-2xl border border-border bg-surface p-4 shadow-soft ${hidden ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blush text-sm font-semibold text-primary">
          {comment.author?.avatar_url ? (
            <img src={comment.author.avatar_url} alt={name} className="h-full w-full object-cover" />
          ) : (
            initials(name)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-foreground">{name}</span>
            <span className="text-xs text-muted-foreground">· {timeAgo(comment.created_at)}</span>
            {hidden && (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                Hidden
              </span>
            )}
          </div>
          {isEditing ? (
            <div className="mt-2">
              <textarea
                value={editDraft}
                onChange={(e) => onEditChange(e.target.value.slice(0, 2000))}
                rows={3}
                className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <div className="mt-2 flex justify-end gap-2">
                <button onClick={onEditCancel} className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs">
                  <X className="h-3 w-3" /> Cancel
                </button>
                <button
                  onClick={onEditSave}
                  disabled={savingEdit || !editDraft.trim()}
                  className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs text-primary-foreground disabled:opacity-50"
                >
                  <Check className="h-3 w-3" /> Save
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{comment.body}</p>
          )}
        </div>
        {!isEditing && (canEdit || canDelete) && (
          <div className="flex shrink-0 gap-1">
            {canEdit && (
              <button
                onClick={onEditStart}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                aria-label="Edit comment"
              >
                <Pencil className="h-4 w-4" />
              </button>
            )}
            {canDelete && (
              <button
                onClick={onDelete}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                aria-label="Delete comment"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
