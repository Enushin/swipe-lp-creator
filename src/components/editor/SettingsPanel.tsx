"use client";

import type { LPSettings } from "@/types";

interface SettingsPanelProps {
  settings: LPSettings;
  onChange: (settings: LPSettings) => void;
}

export function SettingsPanel({ settings, onChange }: SettingsPanelProps) {
  const handleChange = <K extends keyof LPSettings>(
    key: K,
    value: LPSettings[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-4">
      {/* Viewer Type */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          ビューアタイプ
        </label>
        <select
          value={settings.viewerType}
          onChange={(e) =>
            handleChange("viewerType", e.target.value as "swipe" | "scroll")
          }
          className="w-full"
        >
          <option value="swipe">スワイプ式</option>
          <option value="scroll">スクロール式</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">
          {settings.viewerType === "swipe"
            ? "左右にスワイプしてスライドを切り替え"
            : "上下にスクロールしてスライドを表示"}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-700">
            プログレスバー
          </label>
          <p className="text-xs text-gray-500">進捗バーを表示</p>
        </div>
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={settings.showProgressBar ?? true}
            onChange={(e) => handleChange("showProgressBar", e.target.checked)}
            className="peer sr-only"
          />
          <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300" />
        </label>
      </div>

      {/* Auto Play */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-700">自動再生</label>
          <p className="text-xs text-gray-500">スライドを自動で切り替え</p>
        </div>
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={settings.autoPlay ?? false}
            onChange={(e) => handleChange("autoPlay", e.target.checked)}
            className="peer sr-only"
          />
          <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300" />
        </label>
      </div>

      {/* Auto Play Interval */}
      {settings.autoPlay && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            切り替え間隔
          </label>
          <select
            value={settings.autoPlayInterval ?? 3000}
            onChange={(e) =>
              handleChange("autoPlayInterval", Number(e.target.value))
            }
            className="w-full"
          >
            <option value={2000}>2秒</option>
            <option value={3000}>3秒</option>
            <option value={4000}>4秒</option>
            <option value={5000}>5秒</option>
            <option value={7000}>7秒</option>
            <option value={10000}>10秒</option>
          </select>
        </div>
      )}

      {/* Info */}
      <div className="rounded-lg bg-gray-50 p-3">
        <p className="text-sm font-medium text-gray-700">現在の設定</p>
        <ul className="mt-2 space-y-1 text-xs text-gray-600">
          <li>
            ビューア:{" "}
            {settings.viewerType === "swipe" ? "スワイプ式" : "スクロール式"}
          </li>
          <li>
            プログレスバー:{" "}
            {settings.showProgressBar !== false ? "表示" : "非表示"}
          </li>
          <li>自動再生: {settings.autoPlay ? "有効" : "無効"}</li>
          {settings.autoPlay && (
            <li>間隔: {(settings.autoPlayInterval ?? 3000) / 1000}秒</li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default SettingsPanel;
