"use client";

import { useState } from "react";
import type { LP, Slide } from "@/types";
import { ImageUploader } from "./ImageUploader";
import { SortableSlideList } from "./SortableSlideList";
import { CTASettingsPanel } from "./CTASettingsPanel";
import { TrackingSettingsPanel } from "./TrackingSettingsPanel";
import { SettingsPanel } from "./SettingsPanel";
import { AIGeneratorPanel } from "./AIGeneratorPanel";

type TabType = "slides" | "cta" | "tracking" | "settings";

interface EditorSidebarProps {
  lp: LP;
  onUpdate: (data: Partial<LP>) => Promise<boolean>;
  saving: boolean;
}

export function EditorSidebar({ lp, onUpdate, saving }: EditorSidebarProps) {
  const [activeTab, setActiveTab] = useState<TabType>("slides");

  const tabs: { id: TabType; label: string }[] = [
    { id: "slides", label: "スライド" },
    { id: "cta", label: "CTA" },
    { id: "tracking", label: "トラッキング" },
    { id: "settings", label: "設定" },
  ];

  return (
    <aside className="flex h-full w-80 flex-col border-r border-gray-200 bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <input
          type="text"
          value={lp.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="w-full border-none p-0 text-lg font-bold focus:ring-0"
          placeholder="LPタイトル"
        />
        {saving && <p className="mt-1 text-xs text-gray-400">保存中...</p>}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "border-primary-600 text-primary-600 border-b-2"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "slides" && (
          <div className="space-y-4">
            {/* AI Generator */}
            <AIGeneratorPanel
              lpId={lp.id}
              userId={lp.userId}
              startOrder={lp.slides.length}
              onGenerate={(newSlides: Slide[]) => {
                onUpdate({ slides: [...lp.slides, ...newSlides] });
              }}
              disabled={saving}
            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">または</span>
              </div>
            </div>

            <ImageUploader
              lpId={lp.id}
              userId={lp.userId}
              startOrder={lp.slides.length}
              onUploadComplete={(newSlides) => {
                onUpdate({ slides: [...lp.slides, ...newSlides] });
              }}
            />
            <SortableSlideList
              slides={lp.slides}
              onReorder={(slides) => onUpdate({ slides })}
              onDelete={(slideId) => {
                const filtered = lp.slides.filter((s) => s.id !== slideId);
                onUpdate({ slides: filtered });
              }}
            />
          </div>
        )}

        {activeTab === "cta" && (
          <CTASettingsPanel
            config={lp.cta}
            onChange={(cta) => onUpdate({ cta })}
          />
        )}

        {activeTab === "tracking" && (
          <TrackingSettingsPanel
            config={lp.tracking}
            onChange={(tracking) => onUpdate({ tracking })}
          />
        )}

        {activeTab === "settings" && (
          <SettingsPanel
            settings={lp.settings}
            onChange={(settings) => onUpdate({ settings })}
          />
        )}
      </div>
    </aside>
  );
}

export default EditorSidebar;
