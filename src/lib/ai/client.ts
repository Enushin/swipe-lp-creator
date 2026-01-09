// AI Generation Client
// Calls the Cloudflare Functions API endpoints

export interface GenerateLPRequest {
  productName: string;
  targetAudience: string;
  keyBenefits: string[];
  tone?: string;
  slideCount?: number;
  lpId?: string;
}

export interface StoryboardSlide {
  slideNumber: number;
  purpose: "hook" | "problem" | "solution" | "benefit" | "cta";
  headline: string;
  bodyText: string;
  imagePrompt: string;
}

export interface GenerateLPResponse {
  success: boolean;
  storyboard?: StoryboardSlide[];
  images?: { slideNumber: number; imageUrl: string }[];
  error?: string;
}

export interface RegenerateSlideRequest {
  prompt: string;
  style?: string;
  lpId?: string;
}

export interface RegenerateSlideResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export interface AIRequestOptions {
  idToken?: string;
}

// Get API base URL
function getApiBaseUrl(): string {
  // In production, use relative path for Cloudflare Functions
  if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost"
  ) {
    return "/api";
  }
  // In development, use local or staging URL
  return process.env.NEXT_PUBLIC_API_URL || "/api";
}

// Generate LP with AI
export async function generateLP(
  request: GenerateLPRequest,
  options: AIRequestOptions = {}
): Promise<GenerateLPResponse> {
  const baseUrl = getApiBaseUrl();

  try {
    const response = await fetch(`${baseUrl}/generate-lp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(options.idToken ? { Authorization: `Bearer ${options.idToken}` } : {}),
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error: ${error}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Generate LP error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate LP",
    };
  }
}

// Regenerate a single slide image
export async function regenerateSlide(
  request: RegenerateSlideRequest,
  options: AIRequestOptions = {}
): Promise<RegenerateSlideResponse> {
  const baseUrl = getApiBaseUrl();

  try {
    const response = await fetch(`${baseUrl}/regenerate-slide`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(options.idToken ? { Authorization: `Bearer ${options.idToken}` } : {}),
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error: ${error}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Regenerate slide error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to regenerate slide",
    };
  }
}

// Convert base64 image to blob for upload
export async function base64ToBlob(base64: string): Promise<Blob> {
  const response = await fetch(base64);
  return await response.blob();
}

// Convert storyboard to LP slides
export function storyboardToSlides(
  storyboard: StoryboardSlide[],
  images: { slideNumber: number; imageUrl: string }[]
): Array<{
  id: string;
  order: number;
  imageUrl: string;
  alt: string;
  aiGenerated: boolean;
  aiPrompt: string;
}> {
  const imageMap = new Map(
    images.map((img) => [img.slideNumber, img.imageUrl])
  );

  return storyboard.map((slide, index) => ({
    id: `ai-slide-${Date.now()}-${index}`,
    order: index,
    imageUrl: imageMap.get(slide.slideNumber) || "/images/placeholder.png",
    alt: slide.headline,
    aiGenerated: true,
    aiPrompt: slide.imagePrompt,
  }));
}
