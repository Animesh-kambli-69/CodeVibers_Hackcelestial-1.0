/**
 * Provider-agnostic AI / LLM Service client.
 * Connects to LLM endpoint with timeouts and prompt grounding.
 */
const env = require('../config/env');
const appConfig = require('../config/app');
const { AiUnavailableError } = require('../utils/errors');
const logger = require('../utils/logger');

class AiService {
  constructor(apiKey = env.LLM_API_KEY, model = env.LLM_MODEL) {
    this.apiKey = apiKey;
    this.model = model;
  }

  isConfigured() {
    return !!this.apiKey && this.apiKey.trim() !== '';
  }

  async generateGroundedReply({ message, guestContext, sources = [] }) {
    if (!this.isConfigured()) {
      // In dev or unconfigured mode, return verified grounded template
      return this._generateTemplateReply(message, sources, guestContext);
    }

    try {
      // System instructions and grounding constraints
      const systemPrompt = `
You are the Smart Resort 360 AI Concierge.
Your purpose is to provide warm, personalized, accurate assistance to resort guests.
STRICT ANTI-HALLUCINATION RULES:
1. ONLY state facts, prices, timings, and policies explicitly mentioned in the provided VERIFIED SOURCES.
2. If the user asks about something not in the sources, politely inform them that you do not have that information and suggest contacting the front desk.
3. Tailor the tone using the guest's profile and preferences when appropriate.
`;

      const sourceContext = sources
        .map((s, idx) => `[Source ${idx + 1}] Category: ${s.category} | Title: ${s.title} | Content: ${s.content}`)
        .join('\n\n');

      const guestDetails = `
Guest Name: ${guestContext.name || 'Valued Guest'}
Preferences: ${(guestContext.preferences || []).map((p) => `${p.preferenceType}: ${p.preferenceValue}`).join(', ') || 'None recorded'}
`;

      const prompt = `${systemPrompt}\n\nGUEST CONTEXT:\n${guestDetails}\n\nVERIFIED SOURCES:\n${sourceContext}\n\nGUEST QUESTION:\n${message}\n\nRESPONSE:`;

      // Call Google Gemini API (or OpenAI compatible)
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 500,
          },
        }),
        signal: AbortSignal.timeout(appConfig.LLM.TIMEOUT_MS),
      });

      if (!res.ok) {
        throw new AiUnavailableError(`LLM API returned status ${res.status}`);
      }

      const data = await res.json();
      const generatedText =
        data.candidates &&
        data.candidates[0] &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        data.candidates[0].content.parts[0]
          ? data.candidates[0].content.parts[0].text.trim()
          : null;

      if (!generatedText) {
        throw new AiUnavailableError('Empty response from LLM');
      }

      return generatedText;
    } catch (err) {
      logger.error({ error: err.message }, 'Failed to generate LLM grounded reply');
      if (err instanceof AiUnavailableError) throw err;
      throw new AiUnavailableError(`AI Concierge unavailable: ${err.message}`);
    }
  }

  _generateTemplateReply(message, sources, guestContext) {
    if (!sources || sources.length === 0) {
      return appConfig.CONCIERGE.FALLBACK_MESSAGE;
    }

    const primary = sources[0];
    const guestGreeting = guestContext.name ? `Hello ${guestContext.name}, ` : '';
    return `${guestGreeting}regarding ${primary.title} (${primary.category}): ${primary.content}`;
  }
}

module.exports = AiService;
