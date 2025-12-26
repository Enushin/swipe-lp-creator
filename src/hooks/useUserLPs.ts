"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getLPsByUser,
  createLP as createLPInFirestore,
  updateLP as updateLPInFirestore,
  deleteLP as deleteLPInFirestore,
} from "@/lib/firebase/firestore";
import type { LP, LPStatus } from "@/types";

interface UseUserLPsReturn {
  lps: LP[];
  loading: boolean;
  error: Error | null;
  createLP: (title: string) => Promise<string | null>;
  updateLP: (lpId: string, data: Partial<LP>) => Promise<boolean>;
  deleteLP: (lpId: string) => Promise<boolean>;
  togglePublish: (lpId: string, currentStatus: LPStatus) => Promise<boolean>;
  refreshLPs: () => Promise<void>;
}

export function useUserLPs(userId: string | undefined): UseUserLPsReturn {
  const [lps, setLPs] = useState<LP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLPs = useCallback(async () => {
    if (!userId) {
      setLPs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fetchedLPs = await getLPsByUser(userId);
      setLPs(fetchedLPs);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch LPs"));
      console.error("Error fetching LPs:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchLPs();
  }, [fetchLPs]);

  const createLP = async (title: string): Promise<string | null> => {
    if (!userId) return null;

    const newLP: Omit<LP, "id"> = {
      title,
      description: "",
      slides: [],
      cta: {
        text: "詳しく見る",
        url: "",
        backgroundColor: "#2563eb",
        textColor: "#ffffff",
        position: "fixed",
      },
      tracking: {},
      settings: {
        viewerType: "swipe",
        showProgressBar: true,
        autoPlay: false,
        autoPlayInterval: 3000,
      },
      status: "draft",
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      const lpId = await createLPInFirestore(newLP);
      if (lpId) {
        await fetchLPs(); // Refresh list
      }
      return lpId;
    } catch (err) {
      console.error("Error creating LP:", err);
      return null;
    }
  };

  const updateLP = async (
    lpId: string,
    data: Partial<LP>
  ): Promise<boolean> => {
    try {
      await updateLPInFirestore(lpId, {
        ...data,
        updatedAt: new Date(),
      });
      setLPs((prev) =>
        prev.map((lp) =>
          lp.id === lpId ? { ...lp, ...data, updatedAt: new Date() } : lp
        )
      );
      return true;
    } catch (err) {
      console.error("Error updating LP:", err);
      return false;
    }
  };

  const deleteLP = async (lpId: string): Promise<boolean> => {
    try {
      await deleteLPInFirestore(lpId);
      setLPs((prev) => prev.filter((lp) => lp.id !== lpId));
      return true;
    } catch (err) {
      console.error("Error deleting LP:", err);
      return false;
    }
  };

  const togglePublish = async (
    lpId: string,
    currentStatus: LPStatus
  ): Promise<boolean> => {
    const newStatus: LPStatus =
      currentStatus === "published" ? "draft" : "published";
    return updateLP(lpId, { status: newStatus });
  };

  const refreshLPs = async () => {
    await fetchLPs();
  };

  return {
    lps,
    loading,
    error,
    createLP,
    updateLP,
    deleteLP,
    togglePublish,
    refreshLPs,
  };
}

export default useUserLPs;
