// LP関連の型定義

export interface LP {
  id: string;
  title: string;
  description: string;
  slides: Slide[];
  cta: CTAConfig;
  tracking: TrackingConfig;
  settings: LPSettings;
  status: LPStatus;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface Slide {
  id: string;
  order: number;
  imageUrl: string;
  alt?: string;
  aiGenerated?: boolean;
  aiPrompt?: string;
}

export interface CTAConfig {
  text: string;
  url: string;
  backgroundColor: string;
  textColor: string;
  position: "fixed" | "inline";
}

export interface TrackingConfig {
  gtmId?: string;
  metaPixelId?: string;
  customHeadScript?: string;
  customBodyScript?: string;
}

export interface LPSettings {
  viewerType: "swipe" | "scroll";
  showProgressBar?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number; // milliseconds
}

export type LPStatus = "draft" | "published" | "archived";

// AI生成関連

export interface AIGenerationRequest {
  productName: string;
  targetAudience: string;
  keyBenefits: string[];
  tone?: string;
  slideCount?: number;
}

export interface AIGenerationResult {
  slides: GeneratedSlide[];
  metadata: AIMetadata;
}

export interface GeneratedSlide {
  order: number;
  type: SlideType;
  imageUrl: string;
  prompt: string;
}

export type SlideType =
  | "hook"
  | "problem"
  | "solution"
  | "benefit"
  | "social_proof"
  | "cta";

export interface AIMetadata {
  model: {
    text: string;
    image: string;
  };
  generatedAt: Date;
  productName: string;
  targetAudience: string;
  keyBenefits: string[];
  slideCount: number;
}

// User limits for AI generation
export interface UserLimits {
  maxLPs: number;
  maxSlidesPerLP: number;
  aiGenerationsPerMonth: number;
  aiGenerationsUsed: number;
  resetAt: Date;
}

// Plan-based limits
export const PLAN_LIMITS: Record<UserPlan, Partial<UserLimits>> = {
  free: {
    maxLPs: 3,
    maxSlidesPerLP: 10,
    aiGenerationsPerMonth: 10,
  },
  pro: {
    maxLPs: 20,
    maxSlidesPerLP: 20,
    aiGenerationsPerMonth: 100,
  },
  enterprise: {
    maxLPs: Infinity,
    maxSlidesPerLP: 50,
    aiGenerationsPerMonth: Infinity,
  },
};

// ユーザー関連

export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  plan: UserPlan;
  aiCredits: number;
  limits?: UserLimits;
}

export type UserPlan = "free" | "pro" | "enterprise";

// API レスポンス

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: APIError;
}

export interface APIError {
  code: string;
  message: string;
}
