"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CreateLPButtonProps {
  onCreate: (title: string) => Promise<string | null>;
}

export function CreateLPButton({ onCreate }: CreateLPButtonProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;

    setCreating(true);
    try {
      const lpId = await onCreate(title.trim());
      if (lpId) {
        router.push(`/dashboard/edit?id=${lpId}`);
      }
    } finally {
      setCreating(false);
      setIsModalOpen(false);
      setTitle("");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        新規LP作成
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-card mx-4 w-full max-w-md p-6">
            <h2 className="font-display text-xl font-bold text-[var(--text-primary)]">
              新規LP作成
            </h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              LPのタイトルを入力してください
            </p>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: 新商品プロモーション"
              className="focus:ring-[var(--color-brand)]/20 mt-4 w-full rounded-xl border border-[var(--glass-border)] bg-[var(--glass-light)] px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] transition-all focus:border-[var(--color-brand)] focus:outline-none focus:ring-2"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && title.trim()) {
                  handleCreate();
                }
              }}
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setTitle("");
                }}
                className="btn-secondary px-4 py-2 text-sm"
                disabled={creating}
              >
                キャンセル
              </button>
              <button
                onClick={handleCreate}
                disabled={!title.trim() || creating}
                className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
              >
                {creating ? "作成中..." : "作成"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CreateLPButton;
