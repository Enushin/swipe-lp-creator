// Cloudflare Pages Function: Generate LP with AI
// Uses OpenAI for storyboard generation and Gemini for image generation
import { enforceAIGenerationLimit, logAIGeneration } from "./_firebase";

interface Env {
  OPENAI_API_KEY: string;
  GOOGLE_AI_API_KEY: string;
  GEMINI_API_KEY?: string;
  FIREBASE_PROJECT_ID?: string;
  AUTH_REQUIRED?: string;
}

interface GenerateRequest {
  productName: string;
  targetAudience: string;
  keyBenefits: string[];
  tone?: string;
  slideCount?: number;
  lpId?: string;
}

interface StoryboardSlide {
  slideNumber: number;
  purpose: "hook" | "problem" | "solution" | "benefit" | "cta";
  headline: string;
  bodyText: string;
  imagePrompt: string;
}

interface GenerateResponse {
  success: boolean;
  storyboard?: StoryboardSlide[];
  images?: { slideNumber: number; imageUrl: string }[];
  error?: string;
}

// System prompt for storyboard generation
const STORYBOARD_SYSTEM_PROMPT = `You are an expert LP (Landing Page) copywriter and designer.
Given product information, generate a compelling slide storyboard for a mobile-first swipe LP.

Output JSON with the following structure:
{
  "slides": [
    {
      "slideNumber": 1,
      "purpose": "hook",
      "headline": "Attention-grabbing headline",
      "bodyText": "Supporting text (optional)",
      "imagePrompt": "Detailed image generation prompt for this slide"
    }
  ]
}

Slide structure:
1. Hook (1 slide) - Grab attention, create curiosity
2-3. Problem (2 slides) - Identify pain points
4-6. Solution (3 slides) - Introduce the product/service
7-8. Benefit (2 slides) - Show results/benefits
9-10. CTA (2 slides) - Call to action

Image prompts should be:
- Detailed and specific
- Include style: modern, clean, professional
- Specify aspect ratio: 9:16 vertical mobile format
- Japanese aesthetic appropriate for target audience
- No text in images (text will be overlaid)

Respond in Japanese for Japanese products.`;

// Generate storyboard using OpenAI
async function generateStoryboard(
  input: GenerateRequest,
  apiKey: string
): Promise<StoryboardSlide[]> {
  const userPrompt = `
商品/サービス名: ${input.productName}
ターゲット: ${input.targetAudience}
主なメリット: ${input.keyBenefits.join(", ")}
トーン: ${input.tone || "プロフェッショナル"}
スライド数: ${input.slideCount || 10}枚
`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: STORYBOARD_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  const content = JSON.parse(data.choices[0].message.content);
  return content.slides;
}

// Generate image using Gemini
async function generateImage(
  prompt: string,
  apiKey: string
): Promise<string | null> {
  // Enhanced prompt for better image generation
  const enhancedPrompt = `
Create a high-quality, modern, professional image for a mobile landing page slide.
Style: Clean, minimalist, Japanese aesthetic
Aspect ratio: 9:16 (vertical mobile format)
No text or words in the image.

${prompt}
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: enhancedPrompt }],
            },
          ],
          generationConfig: {
            responseModalities: ["IMAGE", "TEXT"],
          },
        }),
      }
    );

    if (!response.ok) {
      console.error("Gemini API error:", await response.text());
      return null;
    }

    const data = await response.json();

    // Extract image data if available
    const parts = data.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData?.mimeType?.startsWith("image/")) {
          // Return base64 data URL
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }

    return null;
  } catch (error) {
    console.error("Image generation error:", error);
    return null;
  }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const authRequired = env.AUTH_REQUIRED === "true" || env.AUTH_REQUIRED === "1";
  const user = (context as { data?: { user?: { uid: string; token: string } } })
    .data?.user;
  let input: GenerateRequest | null = null;

  try {
    input = await request.json();

    // Validate input
    if (
      !input.productName ||
      !input.targetAudience ||
      !input.keyBenefits?.length
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "Missing required fields: productName, targetAudience, keyBenefits",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check for API keys
    if (!env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "OpenAI API key not configured",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (authRequired && (!user || !env.FIREBASE_PROJECT_ID)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unauthorized",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    if (user && env.FIREBASE_PROJECT_ID) {
      const limitResult = await enforceAIGenerationLimit({
        projectId: env.FIREBASE_PROJECT_ID,
        idToken: user.token,
        uid: user.uid,
      });
      if (!limitResult.allowed) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "AI generation limit reached",
          }),
          { status: 429, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Generate storyboard
    const storyboard = await generateStoryboard(input, env.OPENAI_API_KEY);

    // Generate images if Gemini API is available
    let images: { slideNumber: number; imageUrl: string }[] = [];
    const geminiKey = env.GOOGLE_AI_API_KEY || env.GEMINI_API_KEY;
    if (geminiKey) {
      const imagePromises = storyboard.map(async (slide) => {
        const imageUrl = await generateImage(slide.imagePrompt, geminiKey);
        return imageUrl ? { slideNumber: slide.slideNumber, imageUrl } : null;
      });

      const results = await Promise.all(imagePromises);
      images = results.filter((r): r is NonNullable<typeof r> => r !== null);
    }

    const response: GenerateResponse = {
      success: true,
      storyboard,
      images,
    };

    if (user && env.FIREBASE_PROJECT_ID) {
      await logAIGeneration({
        projectId: env.FIREBASE_PROJECT_ID,
        idToken: user.token,
        uid: user.uid,
        lpId: input.lpId,
        type: "generate",
        success: true,
        model: "gpt-4o",
        slideCount: storyboard.length,
      });
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Generate LP error:", error);
    if (user && env.FIREBASE_PROJECT_ID) {
      await logAIGeneration({
        projectId: env.FIREBASE_PROJECT_ID,
        idToken: user.token,
        uid: user.uid,
        lpId: input?.lpId,
        type: "generate",
        success: false,
        model: "gpt-4o",
        slideCount: input?.slideCount,
      });
    }
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate LP",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
