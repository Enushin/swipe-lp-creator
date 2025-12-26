"use client";

import { useState } from "react";
import Link from "next/link";
import type { LP } from "@/types";
import { ViewerContainer } from "@/components/viewer";

type ViewMode = "mobile" | "desktop";

interface PreviewPaneProps {
  lp: LP;
}

export function PreviewPane({ lp }: PreviewPaneProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("mobile");

  return (
    <div className="flex flex-1 flex-col bg-gray-100">
      {/* Preview Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">プレビュー</span>
          {lp.status === "published" && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
              公開中
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => setViewMode("mobile")}
              className={`rounded-md px-3 py-1 text-sm ${
                viewMode === "mobile"
                  ? "bg-gray-200 font-medium text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("desktop")}
              className={`rounded-md px-3 py-1 text-sm ${
                viewMode === "desktop"
                  ? "bg-gray-200 font-medium text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </button>
          </div>

          {/* Open in New Tab */}
          <Link
            href={`/p/${lp.id}?preview=true`}
            target="_blank"
            className="flex items-center gap-1 text-sm text-primary-600 hover:underline"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            新規タブで開く
          </Link>
        </div>
      </div>

      {/* Preview Container */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div
          className={`relative overflow-hidden rounded-2xl bg-white shadow-2xl transition-all ${
            viewMode === "mobile"
              ? "h-[667px] w-[375px]"
              : "h-[600px] w-[1024px]"
          }`}
          style={{
            boxShadow:
              "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)",
          }}
        >
          {/* Device Frame (Mobile) */}
          {viewMode === "mobile" && (
            <div className="pointer-events-none absolute left-1/2 top-2 z-50 h-6 w-20 -translate-x-1/2 rounded-full bg-black" />
          )}

          {/* Content */}
          <div className="h-full w-full overflow-hidden">
            {lp.slides.length > 0 ? (
              <ViewerContainer lp={lp} />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">
                <div className="text-center">
                  <svg
                    className="mx-auto h-12 w-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="mt-2">スライドを追加してください</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PreviewPane;
