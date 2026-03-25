import { GoogleGenAI } from "@google/genai";
import { MODEL_NAME, SYSTEM_INSTRUCTION } from "../constants";

// Initializing the client. Assuming process.env.API_KEY is available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateStoryPart = async (
  theme: string,
  currentPartIndex: number, // 1-based index
  previousParts: string[],
  avoidContext: string[] = [] // New parameter: list of intros from previous stories to avoid repetition
): Promise<string> => {
  
  // Construct the prompt for the Chain-of-Thought
  let contextPrompt = `TEMA ORIGINAL: "${theme}"\n\n`;

  // Variance Logic for Part 1
  if (currentPartIndex === 1 && avoidContext.length > 0) {
    contextPrompt += `\n[RESTRIÇÃO DE ORIGINALIDADE - CRÍTICO]\n`;
    contextPrompt += `Nas histórias anteriores, você já usou os seguintes personagens e inícios:\n`;
    contextPrompt += `--- INÍCIO DOS EXEMPLOS A EVITAR ---\n`;
    // Take the last 5 stories to avoid context window overload, limiting chars per entry
    const recentContexts = avoidContext.slice(-5).map(c => c.substring(0, 400).replace(/\n/g, ' ')).join('\n\n');
    contextPrompt += recentContexts;
    contextPrompt += `\n--- FIM DOS EXEMPLOS A EVITAR ---\n`;
    contextPrompt += `\nREGRA OBRIGATÓRIA: Para esta NOVA história, você DEVE usar um NOME DE PROTAGONISTA, uma PROFISSÃO, um OBJETO SIMBÓLICO e um CENÁRIO completamente diferentes dos exemplos acima. 
    NÃO REPITA Nomes, Profissões ou Objetos. Seja criativo e use a vasta cultura brasileira.\n\n`;
  }

  if (previousParts.length > 0) {
    contextPrompt += `CONTEXTO DE LO QUE YA SE ESCRIBIÓ (Partes 1 a ${currentPartIndex - 1}):\n\n`;
    contextPrompt += previousParts.join("\n\n... SEPARADOR ...\n\n");
    contextPrompt += `\n\n[FIN DEL CONTEXTO ANTERIOR]\n\n`;
  }

  contextPrompt += `TU TAREA AHORA: Escribe SOLAMENTE el CAPÍTULO ${currentPartIndex} siguiendo rigurosamente la estructura del PROMPT MAESTRO para este capítulo específico.
  Mantén la coherencia total con el contexto anterior (si existe).
  NO escribas títulos como 'Capítulo ${currentPartIndex}'. Comienza directamente la narración.
  Garantiza aproximadamente 2000 palabras.`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: contextPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.85, // Increased temperature slightly to encourage diversity
        maxOutputTokens: 8192,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No text generated from model.");
    }
    return text;
  } catch (error) {
    console.error("Error generating part:", error);
    throw error;
  }
};