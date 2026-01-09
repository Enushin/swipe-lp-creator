"use client";

import { useState, useRef, useCallback } from "react";
import { uploadImageWithProgress } from "@/lib/firebase/storage";
import type { Slide } from "@/types";

interface ImageUploaderProps {
  lpId: string;
  userId: string;
  startOrder?: number;
  onUploadComplete: (slides: Slide[]) => void;
}

export function ImageUploader({
  lpId,
  userId,
  startOrder = 0,
  onUploadComplete,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      setUploading(true);
      setProgress(0);

      const newSlides: Slide[] = [];
      const totalFiles = files.length;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file || !file.type.startsWith("image/")) continue;

        try {
          const timestamp = Date.now();
          const path = `users/${userId}/lps/${lpId}/slides/${timestamp}_${file.name}`;
          const url = await uploadImageWithProgress(file, path, (p) => {
            const overallProgress = ((i + p.progress / 100) / totalFiles) * 100;
            setProgress(Math.round(overallProgress));
          });

          if (url) {
            newSlides.push({
              id: `slide-${timestamp}-${i}`,
              imageUrl: url,
              order: startOrder + i,
              alt: file.name.replace(/\.[^/.]+$/, ""),
            });
          }
        } catch (error) {
          console.error("Upload failed:", error);
        }
      }

      if (newSlides.length > 0) {
        onUploadComplete(newSlides);
      }

      setUploading(false);
      setProgress(0);
    },
    [lpId, userId, startOrder, onUploadComplete]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700">
        画像をアップロード
      </label>

      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          dragOver
            ? "border-primary-500 bg-primary-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={uploading}
        />

        {uploading ? (
          <div>
            <div className="border-primary-600 mx-auto h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
            <p className="mt-2 text-sm text-gray-500">
              アップロード中... {progress}%
            </p>
            <div className="mx-auto mt-2 h-2 w-3/4 overflow-hidden rounded-full bg-gray-200">
              <div
                className="bg-primary-600 h-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            <svg
              className="mx-auto h-10 w-10 text-gray-400"
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
            <p className="mt-2 text-sm text-gray-600">
              クリックまたはドラッグ&ドロップ
            </p>
            <p className="text-xs text-gray-400">PNG, JPG, GIF (複数選択可)</p>
          </>
        )}
      </div>
    </div>
  );
}

export default ImageUploader;
