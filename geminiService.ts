import { GoogleGenAI, Type } from "@google/genai";
import { InventoryItem } from "./types";

// Fix: Strictly initialize GoogleGenAI with process.env.API_KEY as per coding guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const semanticSearch = async (query: string, items: InventoryItem[]): Promise<string[]> => {
  if (!process.env.API_KEY) return items.map(i => i.id);

  try {
    const itemsContext = items.map(item => ({
      id: item.id,
      text: `${item.name} ${item.description} ${item.category} ${item.sku}`
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Search Query: "${query}"\n\nGiven the following item list, return ONLY a JSON array of IDs that best match the query. If none match, return an empty array.\n\nItems:\n${JSON.stringify(itemsContext)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    // Fix: Access response.text directly as a property, not a method
    const result = JSON.parse(response.text || '[]');
    return result;
  } catch (error) {
    console.error("Gemini Search Error:", error);
    return items.map(i => i.id);
  }
};

export const generateItemDescription = async (name: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a short, professional product description (max 20 words) for an item named: "${name}"`,
    });
    // Fix: Access response.text directly as a property
    return response.text || "";
  } catch (error) {
    return "";
  }
};