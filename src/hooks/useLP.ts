"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getLP,
  updateLP as updateLPInFirestore,
} from "@/lib/firebase/firestore";
import type { LP, Slide, CTAConfig, TrackingConfig, LPSettings } from "@/types";

interface UseLPReturn {
  lp: LP | null;
  loading: boolean;
  error: Error | null;
  saving: boolean;
  updateLP: (data: Partial<LP>) => Promise<boolean>;
  updateSlides: (slides: Slide[]) => Promise<boolean>;
  updateCTA: (cta: CTAConfig) => Promise<boolean>;
  updateTracking: (tracking: TrackingConfig) => Promise<boolean>;
  updateSettings: (settings: LPSettings) => Promise<boolean>;
  publish: () => Promise<boolean>;
  unpublish: () => Promise<boolean>;
  refreshLP: () => Promise<void>;
}

export function useLP(lpId: string | undefined): UseLPReturn {
  const [lp, setLP] = useState<LP | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchLP = useCallback(async () => {
    if (!lpId) {
      setLP(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fetchedLP = await getLP(lpId);
      setLP(fetchedLP);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch LP"));
      console.error("Error fetching LP:", err);
    } finally {
      setLoading(false);
    }
  }, [lpId]);

  useEffect(() => {
    fetchLP();
  }, [fetchLP]);

  const updateLP = async (data: Partial<LP>): Promise<boolean> => {
    if (!lpId || !lp) return false;

    setSaving(true);
    try {
      const updateData = {
        ...data,
        updatedAt: new Date(),
      };

      await updateLPInFirestore(lpId, updateData);
      setLP((prev) => (prev ? { ...prev, ...updateData } : null));
      return true;
    } catch (err) {
      console.error("Error updating LP:", err);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const updateSlides = async (slides: Slide[]): Promise<boolean> => {
    return updateLP({ slides });
  };

  const updateCTA = async (cta: CTAConfig): Promise<boolean> => {
    return updateLP({ cta });
  };

  const updateTracking = async (tracking: TrackingConfig): Promise<boolean> => {
    return updateLP({ tracking });
  };

  const updateSettings = async (settings: LPSettings): Promise<boolean> => {
    return updateLP({ settings });
  };

  const publish = async (): Promise<boolean> => {
    return updateLP({ status: "published" });
  };

  const unpublish = async (): Promise<boolean> => {
    return updateLP({ status: "draft" });
  };

  const refreshLP = async () => {
    await fetchLP();
  };

  return {
    lp,
    loading,
    error,
    saving,
    updateLP,
    updateSlides,
    updateCTA,
    updateTracking,
    updateSettings,
    publish,
    unpublish,
    refreshLP,
  };
}

export default useLP;
