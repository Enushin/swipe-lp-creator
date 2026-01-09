"use client";

import type { LP } from "@/types";
import { LPCard } from "./LPCard";

interface LPGridProps {
  lps: LP[];
  loading: boolean;
  onDelete: (lpId: string) => void;
  onTogglePublish: (lpId: string, currentStatus: LP["status"]) => void;
}

export function LPGrid({
  lps,
  loading,
  onDelete,
  onTogglePublish,
}: LPGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card animate-pulse p-4">
            <div className="aspect-[9/16] w-full rounded-xl bg-[var(--glass-medium)]" />
            <div className="mt-4 h-5 w-3/4 rounded-lg bg-[var(--glass-medium)]" />
            <div className="mt-2 h-4 w-1/2 rounded-lg bg-[var(--glass-light)]" />
          </div>
        ))}
      </div>
    );
  }

  if (lps.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--glass-medium)]">
          <svg
            className="h-10 w-10 text-[var(--text-muted)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </div>
        <h3 className="font-display text-lg font-medium text-[var(--text-primary)]">
          LPがまだありません
        </h3>
        <p className="mt-2 text-[var(--text-secondary)]">
          新規作成ボタンから最初のLPを作成しましょう
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {lps.map((lp) => (
        <LPCard
          key={lp.id}
          lp={lp}
          onDelete={onDelete}
          onTogglePublish={onTogglePublish}
        />
      ))}
    </div>
  );
}

export default LPGrid;
