// aiService.js
// OpenAI GPT-4o wrapper
// Uses the official openai npm package
// API key loaded from process.env.OPENAI_API_KEY

const OpenAI = require('openai');

class AIService {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1'
    });
    this.model = 'openai/gpt-4o-mini';
  }

  /**
   * Send system + user prompt to GPT-4o
   * Returns the response text string
   */
  async analyze(systemPrompt, userPrompt, maxTokens = 2000) {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        max_tokens: maxTokens,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      });
      return response.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API Error:', error.message);
      throw new Error(`GPT-4o analysis failed: ${error.message}`);
    }
  }

  /**
   * Parse JSON from GPT-4o response
   * Strips markdown code fences if present
   */
  parseJSON(text) {
    try {
      const cleaned = text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      return JSON.parse(cleaned);
    } catch (error) {
      console.error('JSON Parse Error:', error.message);
      throw new Error('Failed to parse GPT-4o response as JSON');
    }
  }
}

module.exports = new AIService();
