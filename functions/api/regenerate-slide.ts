// Cloudflare Pages Function: Regenerate a single slide image

interface Env {
  GOOGLE_AI_API_KEY: string;
}

interface RegenerateRequest {
  prompt: string;
  style?: string;
}

interface RegenerateResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const input: RegenerateRequest = await request.json();

    if (!input.prompt) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required field: prompt",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!env.GOOGLE_AI_API_KEY) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Google AI API key not configured",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Enhanced prompt
    const enhancedPrompt = `
Create a high-quality, modern, professional image for a mobile landing page slide.
Style: ${input.style || "Clean, minimalist, Japanese aesthetic"}
Aspect ratio: 9:16 (vertical mobile format)
No text or words in the image.

${input.prompt}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${env.GOOGLE_AI_API_KEY}`,
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
      const error = await response.text();
      throw new Error(`Gemini API error: ${error}`);
    }

    const data = await response.json();

    // Extract image data
    const parts = data.candidates?.[0]?.content?.parts;
    let imageUrl: string | undefined;

    if (parts) {
      for (const part of parts) {
        if (part.inlineData?.mimeType?.startsWith("image/")) {
          imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!imageUrl) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "No image generated",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const result: RegenerateResponse = {
      success: true,
      imageUrl,
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Regenerate slide error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to regenerate slide",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
