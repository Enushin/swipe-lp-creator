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
    <div className="card group overflow-hidden transition-shadow hover:shadow-lg">
      {/* Thumbnail */}
      <div className="relative aspect-[9/16] w-full overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={thumbnailUrl}
          alt={lp.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        {/* Status Badge */}
        <div
          className={cn(
            "absolute left-2 top-2 rounded-full px-2 py-1 text-xs font-medium",
            isPublished ? "bg-green-500 text-white" : "bg-gray-500 text-white"
          )}
        >
          {isPublished ? "公開中" : "下書き"}
        </div>
      </div>

      {/* Content */}
      <div className="mt-3">
        <h3 className="truncate font-semibold text-gray-900">{lp.title}</h3>
        <p className="mt-1 text-sm text-gray-500">
          {lp.slides.length}枚のスライド
        </p>
        <p className="mt-1 text-xs text-gray-400">
          更新: {formatDate(lp.updatedAt)}
        </p>
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        <Link
          href={`/dashboard/edit?id=${lp.id}`}
          className="flex-1 rounded-lg bg-primary-600 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-primary-700"
        >
          編集
        </Link>
        <button
          onClick={() => onTogglePublish(lp.id, lp.status)}
          className={cn(
            "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            isPublished
              ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
              : "bg-green-100 text-green-700 hover:bg-green-200"
          )}
        >
          {isPublished ? "非公開" : "公開"}
        </button>
        <button
          onClick={handleDelete}
          className="rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-200"
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
          className="mt-2 block text-center text-sm text-primary-600 hover:underline"
        >
          公開ページを見る →
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
