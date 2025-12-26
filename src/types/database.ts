// Database-specific types (Firestore document schemas)
import type { Timestamp } from "firebase/firestore";

// Firestore document types (with Timestamp instead of Date)
export interface LPDocument {
  title: string;
  description: string;
  slides: SlideDocument[];
  cta: CTAConfigDocument;
  tracking: TrackingConfigDocument;
  settings: LPSettingsDocument;
  status: LPStatusDocument;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId: string;
}

export interface SlideDocument {
  id: string;
  order: number;
  imageUrl: string;
  alt: string;
  aiGenerated: boolean;
  aiPrompt?: string;
}

export interface CTAConfigDocument {
  text: string;
  url: string;
  backgroundColor: string;
  textColor: string;
  position: "fixed" | "inline";
}

export interface TrackingConfigDocument {
  gtmId?: string;
  metaPixelId?: string;
  customHeadScript?: string;
  customBodyScript?: string;
}

export interface LPSettingsDocument {
  viewerType: "swipe" | "scroll";
  showProgressBar: boolean;
  autoPlay: boolean;
  autoPlayInterval: number;
}

export type LPStatusDocument = "draft" | "published" | "archived";

// User document
export interface UserDocument {
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Timestamp;
  plan: UserPlanDocument;
  aiCredits: number;
}

export type UserPlanDocument = "free" | "pro" | "enterprise";

// AI Generation tracking document
export interface AIGenerationDocument {
  userId: string;
  lpId: string;
  model: string;
  prompt: string;
  result: {
    success: boolean;
    slidesGenerated: number;
    tokensUsed: number;
    cost: number;
  };
  createdAt: Timestamp;
}

// Conversion helpers
export function lpDocumentToLP(
  id: string,
  doc: LPDocument
): import("@/types").LP {
  return {
    id,
    title: doc.title,
    description: doc.description,
    slides: doc.slides,
    cta: doc.cta,
    tracking: doc.tracking,
    settings: doc.settings,
    status: doc.status,
    createdAt: doc.createdAt.toDate(),
    updatedAt: doc.updatedAt.toDate(),
    userId: doc.userId,
  };
}
