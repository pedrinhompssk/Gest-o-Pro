import { Injectable } from '@angular/core';
import { GoogleGenAI } from "@google/genai";
import { Language } from './store.service';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI | null = null;
  private apiKey: string | undefined;

  constructor() {
    // Safely access the API key. In a browser environment without a build step, `process` is not defined.
    // This prevents a crash on startup if the environment doesn't polyfill `process`.
    this.apiKey = (globalThis as any).process?.env?.API_KEY;
    if (this.apiKey) {
      this.ai = new GoogleGenAI({ apiKey: this.apiKey });
    } else {
      console.warn('API_KEY environment variable not set. Gemini AI features will be disabled.');
    }
  }

  async getFinancialAdvice(context: string, userQuery: string, language: Language): Promise<string> {
    try {
      if (!this.ai) {
        if (language === 'pt') return "Chave de API ausente. As funcionalidades de IA estão desativadas.";
        if (language === 'es') return "Falta la clave API. Las funciones de IA están deshabilitadas.";
        if (language === 'fr') return "Clé API manquante. Les fonctionnalités d'IA sont désactivées.";
        if (language === 'de') return "API-Schlüssel fehlt. KI-Funktionen sind deaktiviert.";
        return "Missing API Key. AI features are disabled.";
      }

      const model = 'gemini-2.5-flash';
      
      const langMap: Record<Language, string> = {
        'pt': 'Portuguese',
        'en': 'English',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German'
      };

      const prompt = `
        You are FinWise AI, a personal financial expert.
        User Language: ${langMap[language]}.
        User Financial Context:
        ${context}

        User Question: ${userQuery}

        Instructions:
        1. Answer in the User's Language (${langMap[language]}).
        2. Be concise, professional, and encouraging.
        3. Use Markdown formatting.
      `;

      const response = await this.ai.models.generateContent({
        model: model,
        contents: prompt,
      });

      return response.text;
    } catch (error) {
      console.error('Gemini Error:', error);
      if (language === 'pt') return "Desculpe, erro ao processar sua solicitação.";
      if (language === 'es') return "Lo siento, error al procesar su solicitud.";
      if (language === 'fr') return "Désolé, erreur lors du traitement de votre demande.";
      if (language === 'de') return "Entschuldigung, Fehler bei der Bearbeitung Ihrer Anfrage.";
      return "Sorry, error processing your request.";
    }
  }
}