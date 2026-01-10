import { Injectable } from '@angular/core';
import { GoogleGenAI } from "@google/genai";
import { Language } from './store.service';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async getFinancialAdvice(context: string, userQuery: string, language: Language): Promise<string> {
    try {
      if (!process.env.API_KEY) {
        if (language === 'pt') return "Chave de API ausente. (Configure API_KEY)";
        if (language === 'es') return "Falta la clave API. (Configurar API_KEY)";
        if (language === 'fr') return "Clé API manquante. (Configurez API_KEY)";
        if (language === 'de') return "API-Schlüssel fehlt. (API_KEY konfigurieren)";
        return "Missing API Key. (Configure API_KEY)";
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