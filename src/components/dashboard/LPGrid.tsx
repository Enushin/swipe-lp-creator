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
          <div key={i} className="card animate-pulse">
            <div className="aspect-[9/16] w-full rounded-lg bg-gray-200" />
            <div className="mt-3 h-5 w-3/4 rounded bg-gray-200" />
            <div className="mt-2 h-4 w-1/2 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    );
  }

  if (lps.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <svg
            className="h-8 w-8 text-gray-400"
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
        <h3 className="text-lg font-medium text-gray-900">
          LPがまだありません
        </h3>
        <p className="mt-1 text-gray-500">
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
