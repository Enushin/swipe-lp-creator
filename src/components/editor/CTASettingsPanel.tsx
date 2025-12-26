"use client";

import type { CTAConfig } from "@/types";

interface CTASettingsPanelProps {
  config: CTAConfig;
  onChange: (config: CTAConfig) => void;
}

export function CTASettingsPanel({ config, onChange }: CTASettingsPanelProps) {
  const handleChange = <K extends keyof CTAConfig>(
    key: K,
    value: CTAConfig[K]
  ) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-4">
      {/* Button Text */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          ボタンテキスト
        </label>
        <input
          type="text"
          value={config.text}
          onChange={(e) => handleChange("text", e.target.value)}
          placeholder="詳しく見る"
          className="w-full"
        />
      </div>

      {/* URL */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          リンクURL
        </label>
        <input
          type="url"
          value={config.url}
          onChange={(e) => handleChange("url", e.target.value)}
          placeholder="https://example.com"
          className="w-full"
        />
        {config.url && !isValidUrl(config.url) && (
          <p className="mt-1 text-xs text-red-500">
            有効なURLを入力してください
          </p>
        )}
      </div>

      {/* Background Color */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          背景色
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={config.backgroundColor}
            onChange={(e) => handleChange("backgroundColor", e.target.value)}
            className="h-10 w-10 cursor-pointer rounded border border-gray-300"
          />
          <input
            type="text"
            value={config.backgroundColor}
            onChange={(e) => handleChange("backgroundColor", e.target.value)}
            className="flex-1"
            placeholder="#2563eb"
          />
        </div>
      </div>

      {/* Text Color */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          文字色
        </label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={config.textColor}
            onChange={(e) => handleChange("textColor", e.target.value)}
            className="h-10 w-10 cursor-pointer rounded border border-gray-300"
          />
          <input
            type="text"
            value={config.textColor}
            onChange={(e) => handleChange("textColor", e.target.value)}
            className="flex-1"
            placeholder="#ffffff"
          />
        </div>
      </div>

      {/* Position */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          表示位置
        </label>
        <select
          value={config.position}
          onChange={(e) =>
            handleChange("position", e.target.value as "fixed" | "inline")
          }
          className="w-full"
        >
          <option value="fixed">画面下部に固定</option>
          <option value="inline">スライド内に表示</option>
        </select>
      </div>

      {/* Preview */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          プレビュー
        </label>
        <div className="rounded-lg bg-gray-100 p-4">
          <button
            className="w-full rounded-xl px-6 py-4 text-center font-bold shadow-lg transition-transform hover:scale-[1.02]"
            style={{
              backgroundColor: config.backgroundColor,
              color: config.textColor,
            }}
          >
            {config.text || "詳しく見る"}
          </button>
        </div>
      </div>
    </div>
  );
}

function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

export default CTASettingsPanel;
