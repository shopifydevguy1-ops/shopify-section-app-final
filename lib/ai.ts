// Free AI API integration
// Using resources from: https://github.com/cheahjs/free-llm-api-resources

const AI_API_KEY = process.env.AI_API_KEY!
const AI_API_URL = process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions'

export interface AIGenerationRequest {
  keyword: string
  sectionTemplate?: string
  customizations?: string
}

export async function generateSectionCode(request: AIGenerationRequest): Promise<string> {
  const { keyword, sectionTemplate, customizations } = request

  const systemPrompt = `You are an expert Shopify theme developer. Generate clean, production-ready Shopify Liquid section code based on user requirements.

Requirements:
- Use modern Shopify section schema format
- Include proper settings schema for theme editor
- Use semantic HTML
- Include proper accessibility attributes
- Follow Shopify best practices
- Return ONLY the Liquid code, no markdown formatting or explanations`

  const userPrompt = sectionTemplate
    ? `Generate a Shopify section based on this template and keyword "${keyword}". ${customizations ? `Customizations: ${customizations}` : ''}

Template:
${sectionTemplate}

Generate the final Liquid code:`
    : `Generate a Shopify section for: "${keyword}". ${customizations ? `Customizations: ${customizations}` : ''}

Generate the Liquid code:`

  try {
    const response = await fetch(AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to generate section code')
    }

    const data = await response.json()
    const generatedCode = data.choices[0]?.message?.content || ''

    // Clean up the response (remove markdown code blocks if present)
    return generatedCode.replace(/```liquid\n?/g, '').replace(/```\n?/g, '').trim()
  } catch (error) {
    console.error('AI Generation Error:', error)
    throw error
  }
}

