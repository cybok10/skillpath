
import { GoogleGenAI, Type } from "@google/genai";
import { Roadmap, ChatMessage, Flashcard } from "../types";

// Exported for use in components requiring advanced sessions (e.g. Live API)
export const getGeminiClient = () => {
  let apiKey = '';
  try {
    // Safe access for browser environments where process might be undefined
    if (typeof process !== 'undefined' && process.env) {
      apiKey = process.env.API_KEY || '';
    }
  } catch (e) {
    console.warn("Unable to access process.env");
  }

  if (!apiKey) {
    console.warn("API_KEY is not set. Feature functionality will be limited.");
    // Return client with dummy key to allow initialization, but calls will fail gracefully
    return new GoogleGenAI({ apiKey: 'dummy-key-missing' });
  }
  return new GoogleGenAI({ apiKey });
};

export const generateRoadmap = async (goal: string, currentSkills: string[]): Promise<Roadmap> => {
  const ai = getGeminiClient();
  
  const prompt = `Create a learning roadmap for a student wanting to become a "${goal}". 
  They already know: ${currentSkills.join(', ') || "nothing specific"}.
  Generate 4-6 key milestones.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            goal: { type: Type.STRING },
            milestones: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  status: { type: Type.STRING, enum: ["pending", "in-progress", "completed"] },
                  estimatedHours: { type: Type.NUMBER },
                  resources: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        url: { type: Type.STRING },
                        type: { type: Type.STRING, enum: ["video", "article", "project"] }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as Roadmap;
  } catch (error) {
    console.error("Error generating roadmap:", error);
    // Fallback mock data
    return {
      goal: goal,
      milestones: [
        {
          id: 'm1',
          title: 'Fundamentals',
          description: 'Learn the basics of the domain.',
          status: 'in-progress',
          estimatedHours: 10,
          resources: [{ title: 'Intro Video', url: '#', type: 'video' }]
        },
        {
          id: 'm2',
          title: 'Advanced Concepts',
          description: 'Deep dive into complex topics.',
          status: 'pending',
          estimatedHours: 20,
          resources: [{ title: 'Advanced Docs', url: '#', type: 'article' }]
        }
      ]
    };
  }
};

export const generateFlashcards = async (topic: string): Promise<Flashcard[]> => {
  const ai = getGeminiClient();
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 5 flashcards for studying "${topic}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              front: { type: Type.STRING, description: "Question or term" },
              back: { type: Type.STRING, description: "Answer or definition" }
            }
          }
        }
      }
    });
    
    const text = response.text;
    if(!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Flashcard error", error);
    return [
      { id: '1', front: 'Error', back: 'Could not generate flashcards. Check API Key.' }
    ];
  }
};

export const chatWithMentorAI = async (history: ChatMessage[], newMessage: string): Promise<string> => {
  const ai = getGeminiClient();
  
  const formattedHistory = history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  }));

  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: "You are an expert career mentor and tutor. Be encouraging, concise, and helpful. Guide the student towards their career goals.",
    },
    history: formattedHistory
  });

  try {
    const result = await chat.sendMessage({
      message: newMessage
    });
    return result.text || "I'm having trouble thinking right now.";
  } catch (error) {
    console.error("Chat error", error);
    return "I am having trouble connecting to the AI service. Please check your internet connection.";
  }
};

export const predictFutureImpact = async (domain: string): Promise<string> => {
  const ai = getGeminiClient();
  const prompt = `Analyze the future impact of emerging technologies on the career path: "${domain}".
  
  Provide a structured Markdown response covering:
  1. **Impact on Jobs**: Will automation replace or augment this role? What new job titles might emerge?
  2. **Impact on Society**: How does this domain contribute to societal changes or ethical considerations?
  3. **Future Skills**: What specific skills will be crucial in 5-10 years?
  4. **Emerging Tech**: Which technologies (AI, Quantum, Blockchain, etc.) are driving this change?
  
  Keep the tone professional, insightful, and forward-looking. Use bolding for key terms.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "Unable to generate prediction analysis.";
  } catch (error) {
    console.error("Impact prediction error", error);
    return "Sorry, I couldn't generate the future impact analysis at this moment. Please check your connection and try again.";
  }
};
