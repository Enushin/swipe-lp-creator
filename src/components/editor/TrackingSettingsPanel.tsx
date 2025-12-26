"use client";

import { useState } from "react";
import type { TrackingConfig } from "@/types";

interface TrackingSettingsPanelProps {
  config: TrackingConfig;
  onChange: (config: TrackingConfig) => void;
}

export function TrackingSettingsPanel({
  config,
  onChange,
}: TrackingSettingsPanelProps) {
  const [showWarning, setShowWarning] = useState(false);

  const handleChange = <K extends keyof TrackingConfig>(
    key: K,
    value: TrackingConfig[K]
  ) => {
    // Show warning when custom scripts are added
    if (key === "customHeadScript" || key === "customBodyScript") {
      if (value && !showWarning) {
        setShowWarning(true);
      }
    }
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-4">
      {/* Warning */}
      {showWarning && (
        <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
          <p className="font-medium">セキュリティに関する注意</p>
          <p className="mt-1 text-xs">
            カスタムスクリプトは悪意のあるコードを含む可能性があります。
            信頼できるソースからのみスクリプトを追加してください。
          </p>
        </div>
      )}

      {/* GTM ID */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Google Tag Manager ID
        </label>
        <input
          type="text"
          value={config.gtmId || ""}
          onChange={(e) => handleChange("gtmId", e.target.value)}
          placeholder="GTM-XXXXXXX"
          className="w-full font-mono text-sm"
        />
        <p className="mt-1 text-xs text-gray-500">例: GTM-XXXXXXX</p>
      </div>

      {/* Meta Pixel ID */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Meta Pixel ID
        </label>
        <input
          type="text"
          value={config.metaPixelId || ""}
          onChange={(e) => handleChange("metaPixelId", e.target.value)}
          placeholder="123456789012345"
          className="w-full font-mono text-sm"
        />
        <p className="mt-1 text-xs text-gray-500">
          Facebook/Instagram広告のピクセルID
        </p>
      </div>

      {/* Custom Head Script */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          カスタムスクリプト (Head)
        </label>
        <textarea
          value={config.customHeadScript || ""}
          onChange={(e) => handleChange("customHeadScript", e.target.value)}
          placeholder="<script>...</script>"
          rows={4}
          className="w-full resize-none font-mono text-xs"
        />
        <p className="mt-1 text-xs text-gray-500">
          ページの&lt;head&gt;内に挿入されます
        </p>
      </div>

      {/* Custom Body Script */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          カスタムスクリプト (Body)
        </label>
        <textarea
          value={config.customBodyScript || ""}
          onChange={(e) => handleChange("customBodyScript", e.target.value)}
          placeholder="<script>...</script>"
          rows={4}
          className="w-full resize-none font-mono text-xs"
        />
        <p className="mt-1 text-xs text-gray-500">
          ページの&lt;body&gt;末尾に挿入されます
        </p>
      </div>

      {/* Status Summary */}
      <div className="rounded-lg bg-gray-50 p-3">
        <p className="text-sm font-medium text-gray-700">設定状況</p>
        <ul className="mt-2 space-y-1 text-xs">
          <li className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                config.gtmId ? "bg-green-500" : "bg-gray-300"
              }`}
            />
            GTM: {config.gtmId || "未設定"}
          </li>
          <li className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                config.metaPixelId ? "bg-green-500" : "bg-gray-300"
              }`}
            />
            Meta Pixel: {config.metaPixelId || "未設定"}
          </li>
          <li className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                config.customHeadScript ? "bg-green-500" : "bg-gray-300"
              }`}
            />
            Head Script: {config.customHeadScript ? "設定済み" : "未設定"}
          </li>
          <li className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                config.customBodyScript ? "bg-green-500" : "bg-gray-300"
              }`}
            />
            Body Script: {config.customBodyScript ? "設定済み" : "未設定"}
          </li>
        </ul>
      </div>
    </div>
  );
}

export default TrackingSettingsPanel;
