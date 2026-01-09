"use client";

import Image from "next/image";
import Link from "next/link";
import type { LP } from "@/types";
import { cn } from "@/lib/utils";

interface LPCardProps {
  lp: LP;
  onDelete: (lpId: string) => void;
  onTogglePublish: (lpId: string, currentStatus: LP["status"]) => void;
}

export function LPCard({ lp, onDelete, onTogglePublish }: LPCardProps) {
  const thumbnailUrl = lp.slides[0]?.imageUrl || "/images/placeholder.png";
  const isPublished = lp.status === "published";

  const handleDelete = () => {
    if (confirm(`「${lp.title}」を削除しますか？この操作は取り消せません。`)) {
      onDelete(lp.id);
    }
  };

  return (
    <div className="glass-card hover:border-[var(--color-brand)]/30 group overflow-hidden p-4 transition-all duration-300">
      {/* Thumbnail */}
      <div className="relative aspect-[9/16] w-full overflow-hidden rounded-xl bg-[var(--surface-raised)]">
        <Image
          src={thumbnailUrl}
          alt={lp.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

        {/* Status Badge */}
        <div
          className={cn(
            "absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm",
            isPublished
              ? "bg-emerald-500/80 text-white"
              : "bg-[var(--glass-medium)] text-[var(--text-secondary)]"
          )}
        >
          {isPublished ? "公開中" : "下書き"}
        </div>
      </div>

      {/* Content */}
      <div className="mt-4">
        <h3 className="truncate font-display font-semibold text-[var(--text-primary)]">
          {lp.title}
        </h3>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          {lp.slides.length}枚のスライド
        </p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          更新: {formatDate(lp.updatedAt)}
        </p>
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        <Link
          href={`/dashboard/edit?id=${lp.id}`}
          className="shadow-[var(--color-brand)]/20 hover:shadow-[var(--color-brand)]/30 flex-1 rounded-xl bg-[var(--gradient-brand)] py-2.5 text-center text-sm font-medium text-white shadow-lg transition-all"
        >
          編集
        </Link>
        <button
          onClick={() => onTogglePublish(lp.id, lp.status)}
          className={cn(
            "rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
            isPublished
              ? "bg-[var(--glass-light)] text-[var(--text-secondary)] hover:bg-[var(--glass-medium)]"
              : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
          )}
        >
          {isPublished ? "非公開" : "公開"}
        </button>
        <button
          onClick={handleDelete}
          className="rounded-xl bg-rose-500/10 px-3 py-2.5 text-sm font-medium text-rose-400 transition-all hover:bg-rose-500/20"
          aria-label="削除"
        >
          削除
        </button>
      </div>

      {/* View Link (only if published) */}
      {isPublished && (
        <Link
          href={`/p/${lp.id}`}
          target="_blank"
          className="mt-3 flex items-center justify-center gap-1 text-center text-sm text-[var(--color-brand)] transition-colors hover:text-[var(--color-brand-light)]"
        >
          公開ページを見る
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </Link>
      )}
    </div>
  );
}

function formatDate(date: Date | { toDate?: () => Date }): string {
  const d = date instanceof Date ? date : (date.toDate?.() ?? new Date());
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default LPCard;
