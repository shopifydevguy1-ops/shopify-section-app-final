// Free AI API integration
// Using resources from: https://github.com/cheahjs/free-llm-api-resources
// Supports OpenAI-compatible APIs and Google AI Studio (Gemini)

const AI_API_KEY = process.env.AI_API_KEY!
const AI_API_URL = process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions'
const AI_MODEL = process.env.AI_MODEL || 'gpt-3.5-turbo'

// Check if using Google AI Studio (Gemini API)
const isGoogleAI = AI_API_URL.includes('generativelanguage.googleapis.com') || 
                   AI_API_URL.includes('googleapis.com')

export interface AIGenerationRequest {
  keyword: string
  sectionTemplate?: string
  customizations?: string
  imageCount?: number
}

export async function generateSectionCode(request: AIGenerationRequest): Promise<string> {
  const { keyword, sectionTemplate, customizations, imageCount = 0 } = request

  if (!AI_API_KEY) {
    throw new Error("AI API key is not configured")
  }

  const systemPrompt = `You are an expert Shopify theme developer. Generate one production-ready Shopify Liquid section.

Rules:
- Return only the Liquid file. No markdown fences and no explanation.
- Include a single {% schema %} tag with a preset so the merchant can add the section in the theme editor.
- The schema name must be 25 characters or fewer.
- Include exactly one image_picker setting with id "image" and label "Image". This is the section's main picture.
- Render that image with image_url piped into image_tag. Never use the deprecated img_url or img_tag filters.
- Pass widths and sizes to image_tag. Give the image a CSS aspect-ratio so the layout does not shift.
- Hero and banner sections must set loading: 'eager' and fetchpriority: 'high'. Every other section must set loading: 'lazy'.
- When the image is blank, render {{ 'lifestyle-1' | placeholder_svg_tag: 'class-name' }}.
- Put component CSS in {% stylesheet %}. Liquid is not rendered inside stylesheet. Pass dynamic values with CSS variables on the root element.
- Use semantic HTML. Links need a visible label and a real href.
- Do not add comments.
- Do not load external CSS or JavaScript libraries.`

  const imageNote = imageCount > 0
    ? `The merchant uploaded ${imageCount} reference photos. Feature the image setting as the main visual. Do not hotlink external image URLs.`
    : `Include the image setting and a placeholder for when it is empty.`

  const userPrompt = sectionTemplate
    ? `Generate a Shopify section based on this template and keyword "${keyword}". ${customizations ? `Customizations: ${customizations}` : ""} ${imageNote}

Template:
${sectionTemplate}

Generate the final Liquid code:`
    : `Generate a Shopify section for: "${keyword}". ${customizations ? `Customizations: ${customizations}` : ""} ${imageNote}

Generate the Liquid code:`

  try {
    let response: Response
    let data: any

    if (isGoogleAI) {
      // Google AI Studio (Gemini) API format
      const fullPrompt = `${systemPrompt}\n\n${userPrompt}`
      const apiUrl = AI_API_URL.includes(':generateContent') 
        ? AI_API_URL 
        : `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODEL}:generateContent`

      response = await fetch(`${apiUrl}?key=${AI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: fullPrompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4000,
          },
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to generate section code')
      }

      data = await response.json()
      const generatedCode = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      return generatedCode.replace(/```liquid\n?/g, '').replace(/```\n?/g, '').trim()
    } else {
      // OpenAI-compatible API format (OpenAI, Groq, OpenRouter, etc.)
      response = await fetch(AI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AI_API_KEY}`,
        },
        body: JSON.stringify({
          model: AI_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Failed to generate section code')
      }

      data = await response.json()
      const generatedCode = data.choices[0]?.message?.content || ''
      return generatedCode.replace(/```liquid\n?/g, '').replace(/```\n?/g, '').trim()
    }
  } catch (error) {
    console.error('AI Generation Error:', error)
    throw error
  }
}

