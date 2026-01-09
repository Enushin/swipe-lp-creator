"use client";

import { useState } from "react";
import {
  generateLP,
  storyboardToSlides,
  base64ToBlob,
  type GenerateLPRequest,
} from "@/lib/ai";
import { uploadImageBlob } from "@/lib/firebase/storage";
import { getAuthInstance, isFirebaseConfigured } from "@/lib/firebase/config";
import type { Slide } from "@/types";

interface AIGeneratorPanelProps {
  lpId: string;
  userId: string;
  startOrder?: number;
  onGenerate: (slides: Slide[]) => void;
  disabled?: boolean;
}

const TONE_OPTIONS = [
  { value: "professional", label: "プロフェッショナル" },
  { value: "friendly", label: "フレンドリー" },
  { value: "luxury", label: "高級感" },
  { value: "casual", label: "カジュアル" },
  { value: "urgent", label: "緊急感" },
];

const SLIDE_COUNT_OPTIONS = [5, 7, 10];

export function AIGeneratorPanel({
  lpId,
  userId,
  startOrder = 0,
  onGenerate,
  disabled = false,
}: AIGeneratorPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<GenerateLPRequest>({
    productName: "",
    targetAudience: "",
    keyBenefits: ["", "", ""],
    tone: "professional",
    slideCount: 7,
  });

  const handleBenefitChange = (index: number, value: string) => {
    const newBenefits = [...formData.keyBenefits];
    newBenefits[index] = value;
    setFormData({ ...formData, keyBenefits: newBenefits });
  };

  const handleGenerate = async () => {
    // Validate
    if (!formData.productName.trim()) {
      setError("商品/サービス名を入力してください");
      return;
    }
    if (!formData.targetAudience.trim()) {
      setError("ターゲットを入力してください");
      return;
    }
    const benefits = formData.keyBenefits.filter((b) => b.trim());
    if (benefits.length === 0) {
      setError("少なくとも1つのメリットを入力してください");
      return;
    }

    setError(null);
    setGenerating(true);
    setProgress("ストーリーボードを生成中...");

    try {
      const authInstance = isFirebaseConfigured() ? getAuthInstance() : null;
      const idToken = authInstance?.currentUser
        ? await authInstance.currentUser.getIdToken()
        : undefined;

      const response = await generateLP(
        {
          ...formData,
          keyBenefits: benefits,
          lpId,
        },
        idToken ? { idToken } : undefined
      );

      if (!response.success || !response.storyboard) {
        throw new Error(response.error || "生成に失敗しました");
      }

      setProgress("画像を生成中...");

      let images = response.images || [];
      if (images.some((img) => img.imageUrl.startsWith("data:"))) {
        setProgress("画像をアップロード中...");
        const uploadTasks = images.map(async (img) => {
          if (!img.imageUrl.startsWith("data:")) return img;
          try {
            const blob = await base64ToBlob(img.imageUrl);
            const filename = `ai-${img.slideNumber}.png`;
            const path = `ai-generated/${userId}/lps/${lpId}/${Date.now()}_${filename}`;
            const uploadedUrl = await uploadImageBlob(blob, path);
            return { ...img, imageUrl: uploadedUrl };
          } catch (uploadError) {
            console.error("AI image upload failed:", uploadError);
            return img;
          }
        });
        images = await Promise.all(uploadTasks);
      }

      // Convert to slides
      const slides = storyboardToSlides(response.storyboard, images).map(
        (slide, index) => ({
          ...slide,
          order: startOrder + index,
        })
      );

      onGenerate(slides as Slide[]);
      setIsOpen(false);
      setProgress("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成に失敗しました");
    } finally {
      setGenerating(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3 font-medium text-white transition-all hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50"
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
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        AIでLP生成
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-purple-900">AIでLP生成</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600"
          disabled={generating}
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Product Name */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            商品/サービス名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.productName}
            onChange={(e) =>
              setFormData({ ...formData, productName: e.target.value })
            }
            placeholder="例: プレミアム美容液"
            className="w-full"
            disabled={generating}
          />
        </div>

        {/* Target Audience */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            ターゲット <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.targetAudience}
            onChange={(e) =>
              setFormData({ ...formData, targetAudience: e.target.value })
            }
            placeholder="例: 30-40代の働く女性"
            className="w-full"
            disabled={generating}
          />
        </div>

        {/* Key Benefits */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            主なメリット <span className="text-red-500">*</span>
          </label>
          {formData.keyBenefits.map((benefit, index) => (
            <input
              key={index}
              type="text"
              value={benefit}
              onChange={(e) => handleBenefitChange(index, e.target.value)}
              placeholder={`メリット ${index + 1}`}
              className="mb-2 w-full"
              disabled={generating}
            />
          ))}
        </div>

        {/* Tone */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            トーン
          </label>
          <select
            value={formData.tone}
            onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
            className="w-full"
            disabled={generating}
          >
            {TONE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Slide Count */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            スライド数
          </label>
          <div className="flex gap-2">
            {SLIDE_COUNT_OPTIONS.map((count) => (
              <button
                key={count}
                onClick={() => setFormData({ ...formData, slideCount: count })}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  formData.slideCount === count
                    ? "bg-purple-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
                disabled={generating}
              >
                {count}枚
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-3 font-medium text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
        >
          {generating ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              {progress}
            </>
          ) : (
            <>
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              生成開始
            </>
          )}
        </button>

        <p className="text-center text-xs text-gray-500">
          生成には1-2分かかることがあります
        </p>
      </div>
    </div>
  );
}

export default AIGeneratorPanel;
