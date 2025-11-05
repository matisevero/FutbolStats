import { GoogleGenAI, Type, Chat } from "@google/genai";
import type { Match, AIHighlight, CoachingInsight, Goal, AIGoalSuggestion, Achievement, CustomAchievement, AIAchievementSuggestion, MoraleLevel, PlayerContextStats, GoalMetric, GoalType } from '../types';
import { calculateHistoricalRecords } from '../utils/analytics';

let ai: GoogleGenAI | null = null;

const getAI = () => {
    if (ai) return ai;
    
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.warn("Gemini API key is missing. AI features will be disabled.");
      return null;
    }
    ai = new GoogleGenAI({ apiKey });
    return ai;
}

export const generateHighlightsSummary = async (matches: Match[]): Promise<Omit<AIHighlight, 'match'>[]> => {
    const aiInstance = getAI();
    if (!aiInstance) throw new Error("La IA no está configurada.");
    if (matches.length < 3) throw new Error("Se necesitan al menos 3 partidos para generar un análisis.");
    
    const matchesPayload = JSON.stringify(
        matches.map(({ id, date, result, myGoals, myAssists }) => ({ id, date, result, myGoals, myAssists }))
    );

    const prompt = `
        Actúa como un analista de datos deportivos experto. A continuación, te proporciono una lista de mis partidos de fútbol personales en formato JSON. Tu tarea es analizar estos datos e identificar un máximo de 3 partidos destacados.
        Para cada partido destacado, proporciona un título creativo, una breve explicación (1-2 frases) de por qué es notable, y el 'id' del partido correspondiente.
        Considera destacar partidos por razones como: una actuación ofensiva excepcional, una victoria crucial, un partido donde mis contribuciones fueron decisivas.
        Datos de los partidos:
        ${matchesPayload}
        Devuelve tu análisis SÓLO como un objeto JSON que se ajuste al esquema proporcionado.
    `;

    try {
        // FIX: Standardize API response variable name to resolve reference error.
        const geminiResponse = await aiInstance.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: { highlights: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { matchId: { type: Type.STRING }, title: { type: Type.STRING }, reason: { type: Type.STRING } }, required: ["matchId", "title", "reason"] } } } }
                }
            }
        });
        
        const text = geminiResponse.text.trim();
        if (!text) {
            return [];
        }
        const jsonResponse = JSON.parse(text);
        return jsonResponse.highlights || [];
    } catch (error) {
        console.error("Gemini API call for highlights failed:", error);
        throw new Error("Failed to communicate with the AI model for analysis.");
    }
};

export const generateCoachingInsight = async (matches: Match[]): Promise<CoachingInsight> => {
    const aiInstance = getAI();
    if (!aiInstance) throw new Error("La IA no está configurada.");
    if (matches.length < 5) throw new Error("Se necesitan al menos 5 partidos para una perspectiva.");

    const matchesPayload = JSON.stringify(matches.map(({ date, result, myGoals, myAssists }) => ({ date, result, myGoals, myAssists })));
    const prompt = `
        Actúa como un entrenador de fútbol. Analiza el historial de partidos y proporciona una perspectiva concisa.
        Identifica UNA tendencia positiva clave y UN área principal para la mejora.
        Datos: ${matchesPayload}
        Devuelve tu análisis SÓLO como un objeto JSON.
    `;

    try {
        // FIX: Standardize API response variable name to resolve reference error.
        const geminiResponse = await aiInstance.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT, properties: { positiveTrend: { type: Type.STRING }, areaForImprovement: { type: Type.STRING } }, required: ["positiveTrend", "areaForImprovement"]
                }
            }
        });
        const text = geminiResponse.text.trim();
        if (!text) {
          throw new Error("Empty response from AI for coaching insight.");
        }
        return JSON.parse(text);
    } catch (error) {
        console.error("Gemini API call for coaching insight failed:", error);
        throw new Error("No se pudo obtener la perspectiva del entrenador.");
    }
};

export const generateConsistencyAnalysis = async (contributions: number[]): Promise<string> => {
  const aiInstance = getAI();
  if (!aiInstance) throw new Error("La IA no está configurada.");
  const contributionsString = contributions.join(', ');
  const prompt = `
    Actúa como un analista de rendimiento experto. Analiza la siguiente serie de contribuciones (goles + asistencias) de un jugador: [${contributionsString}].
    Describe su estilo de juego en términos de consistencia en 1-2 frases concisas y directas.
  `;

  try {
    // FIX: Standardize API response variable name to resolve reference error.
    const geminiResponse = await aiInstance.models.generateContent({
        model: 'gemini-2.5-flash', 
        contents: prompt, 
        config: { temperature: 0.7 } 
    });
    return geminiResponse.text.trim();
  } catch (error) {
    console.error("Gemini API call for consistency analysis failed:", error);
    throw new Error("No se pudo obtener el análisis de consistencia.");
  }
};

export const generateGoalSuggestions = async (matches: Match[], existingGoals: Goal[]): Promise<AIGoalSuggestion[]> => {
    const aiInstance = getAI();
    if (!aiInstance) throw new Error("La IA no está configurada.");
    if (matches.length < 5) throw new Error("Se necesitan al menos 5 partidos para sugerencias.");

    const context = {
        totalMatches: matches.length,
        winRate: (matches.filter(m => m.result === 'VICTORIA').length / matches.length) * 100,
        historicalRecords: calculateHistoricalRecords(matches),
        existingGoals: existingGoals.map(({ title }) => title),
    };

    const prompt = `
      Actúa como un entrenador motivacional. Basado en el contexto de rendimiento, sugiere 2-3 metas personalizadas, inteligentes y alcanzables.
      Contexto: ${JSON.stringify(context)}
      INSTRUCCIONES ESTRICTAS:
      1. Genera metas relevantes, no repetidas, variadas y motivadoras.
      2. El campo 'metric' DEBE ser uno de los siguientes valores: 'myGoals', 'myAssists', 'VICTORIA', 'longestWinStreak', 'longestUndefeatedStreak', 'winRate', 'gpm', 'undefeatedRate'.
      3. El campo 'goalType' DEBE ser uno de los siguientes valores: 'accumulate', 'percentage', 'average', 'streak', 'peak'. Asegúrate de que el 'goalType' sea compatible con la 'metric' (ej: 'winRate' usa 'percentage', 'myGoals' puede usar 'accumulate' o 'peak').
      4. El campo 'year' DEBE ser el año actual (${new Date().getFullYear()}) como string, o la palabra 'all'.
      5. Devuelve SÓLO un objeto JSON que se ajuste al esquema.
    `;
    
    try {
        // FIX: Standardize API response variable name to resolve reference error.
        const geminiResponse = await aiInstance.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: { type: Type.OBJECT, properties: { suggestions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, metric: { type: Type.STRING }, goalType: { type: Type.STRING }, target: { type: Type.NUMBER }, year: { type: Type.STRING | Type.NUMBER } }, required: ["title", "description", "metric", "goalType", "target", "year"] } } } }
            }
        });
        const text = geminiResponse.text.trim();
        if (!text) {
          return [];
        }
        return JSON.parse(text).suggestions || [];
    } catch (error) {
        console.error("Gemini API call for goal suggestions failed:", error);
        throw new Error("No se pudieron generar las sugerencias de metas.");
    }
};

export const generateCreativeGoalTitle = async (metric: string, goalType: GoalType, target: number, period: string): Promise<string> => {
    const aiInstance = getAI();
    if (!aiInstance) throw new Error("La IA no está configurada.");

    const prompt = `
      Actúa como un cronista deportivo motivacional. Crea un título corto (máximo 6 palabras), épico y creativo para una meta personal de fútbol.
      - Métrica: ${metric}
      - Tipo de Meta: ${goalType} (Esto te da contexto, ej: 'accumulate' es un total, 'streak' es una racha, 'average' es un promedio, 'peak' es un hito en un solo partido)
      - Objetivo: ${target}
      - Período: ${period}

      Ejemplos:
      - Métrica: Goles, Tipo: accumulate, Objetivo: 25, Período: Temporada 2024 -> Misión 25: La Conquista del Gol
      - Métrica: Racha de Victorias, Tipo: streak, Objetivo: 5, Período: Histórico -> El Quinteto de la Victoria
      - Métrica: Goles por Partido, Tipo: average, Objetivo: 1.5, Período: Temporada 2025 -> Factor 1.5: Eficacia Total
      - Métrica: Goles, Tipo: peak, Objetivo: 3, Período: Histórico -> Noche de Hat-Trick

      INSTRUCCIONES ESTRICTAS:
      1. Responde ÚNICAMENTE con el título.
      2. NO uses comillas ni texto introductorio como "Aquí tienes un título:".
      3. Sé creativo y enérgico.
    `;

    try {
        // FIX: Standardize API response variable name to resolve reference error.
        const geminiResponse = await aiInstance.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { temperature: 0.9 }
        });
        return geminiResponse.text.trim().replace(/["']/g, '') || `Meta: ${target} ${metric}`;
    } catch (error) {
        console.error("Gemini API call for creative goal title failed:", error);
        return `Meta: ${target} ${metric}`; // Fallback title
    }
};


export const generateAchievementSuggestions = async (matches: Match[], existingAchievements: (Achievement | CustomAchievement)[]): Promise<AIAchievementSuggestion[]> => {
  const aiInstance = getAI();
  if (!aiInstance) throw new Error("La IA no está configurada.");
  if (matches.length < 5) throw new Error("Se necesitan al menos 5 partidos para sugerencias.");

  const context = {
    totalMatches: matches.length,
    winRate: (matches.filter(m => m.result === 'VICTORIA').length / matches.length) * 100,
    historicalRecords: calculateHistoricalRecords(matches),
    existingAchievementTitles: existingAchievements.map(a => a.title)
  };
  const prompt = `
    Actúa como un "Game Master". Analiza el rendimiento y sugiere 2 logros personalizados y orientados al FUTURO para desbloquear. Los logros deben ser desafíos positivos.
    Contexto: ${JSON.stringify(context)}
    INSTRUCCIONES ESTRICTAS:
    1. Enfoque en el futuro y la motivación. Prioriza romper rachas negativas, luego extender rachas positivas, y finalmente batir récords.
    2. El campo 'metric' de la condición DEBE ser uno de los siguientes: 'winStreak', 'lossStreak', 'undefeatedStreak', 'winlessStreak', 'goalStreak', 'assistStreak', 'goalDrought', 'assistDrought', 'breakWinAfterLossStreak', 'breakUndefeatedAfterWinlessStreak'.
    3. El campo 'operator' de la condición DEBE ser 'greater_than_or_equal_to'.
    4. Devuelve SÓLO un objeto JSON que se ajuste al esquema.
  `;

  try {
    // FIX: Standardize API response variable name to resolve reference error.
    const geminiResponse = await aiInstance.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    suggestions: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                description: { type: Type.STRING },
                                icon: { type: Type.STRING },
                                condition: {
                                    type: Type.OBJECT,
                                    properties: {
                                        metric: { type: Type.STRING },
                                        operator: { type: Type.STRING },
                                        value: { type: Type.NUMBER },
                                        window: { type: Type.NUMBER }
                                    },
                                    required: ["metric", "operator", "value", "window"]
                                }
                            },
                            required: ["title", "description", "icon", "condition"]
                        }
                    }
                }
            }
        }
    });
    const text = geminiResponse.text.trim();
    if (!text) {
      return [];
    }
    return JSON.parse(text).suggestions || [];
  } catch (error) {
      console.error("Gemini API call for achievement suggestions failed:", error);
      throw new Error("No se pudieron generar las sugerencias de logros.");
  }
};

export const generateMatchHeadline = async (match: Match): Promise<string> => {
  const aiInstance = getAI();
  if (!aiInstance) throw new Error("La IA no está configurada.");

  const { result, myGoals, myAssists } = match;

  const prompt = `
    Actúa como un periodista deportivo. Crea un titular de no más de 5 palabras para un partido de fútbol con los siguientes detalles. Debe ser pegadizo y emocionante.
    - Resultado: ${result}
    - Mi Contribución Personal: ${myGoals} goles, ${myAssists} asistencias.

    INSTRUCCIONES ESTRICTAS:
    1. Responde ÚNICAMENTE con el titular. Sin introducciones.
    2. Máximo 5 palabras.
    3. NO uses comillas en la respuesta.
  `;

  try {
    // FIX: Standardize API response variable name to resolve reference error.
    const geminiResponse = await aiInstance.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.9,
      }
    });
    
    return geminiResponse.text.trim().replace(/["']/g, '');

  } catch (error) {
    console.error("Gemini API call for headline failed:", error);
    throw new Error("Failed to communicate with the AI model for a headline.");
  }
};

export const startChatSession = (matches: Match[]): Chat | null => {
  const aiInstance = getAI();
  if (!aiInstance) {
    return null;
  }

  const matchesContext = matches.slice(0, 20).reverse().map(m => 
    `- ${m.date}: ${m.result}, Goles: ${m.myGoals}, Asist.: ${m.myAssists}${m.notes ? `, Notas: ${m.notes}` : ''}`
  ).join('\n');

  const chat = aiInstance.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: `Eres un entrenador de fútbol personal y analista de rendimiento. Te he proporcionado un historial de los partidos recientes de un jugador. Tu tarea es responder a sus preguntas, ofrecer análisis, identificar tendencias y dar consejos constructivos para ayudarle a mejorar. Sé perspicaz, motivador y utiliza los datos proporcionados para respaldar tus respuestas. Aquí está el historial de partidos:\n${matchesContext}`
    }
  });

  return chat;
};
