import { Chess } from 'chess.js';

const API_KEY = 'AIzaSyA4orZAiyXf-bMV5cNL03qz3ZzL0n2h5H8';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const validateMove = (move: string, fen: string): boolean => {
  try {
    const chess = new Chess(fen);
    const [from, to] = [move.slice(0, 2), move.slice(2, 4)];
    const moveObj = { from, to, promotion: 'q' };
    return chess.move(moveObj) !== null;
  } catch {
    return false;
  }
};

const getFallbackMove = (fen: string): string => {
  const chess = new Chess(fen);
  const moves = chess.moves({ verbose: true });
  
  if (moves.length === 0) {
    throw new Error('No legal moves available');
  }
  
  // Prioriza capturas e xeques
  const prioritizedMoves = moves.sort((a, b) => {
    if (a.captured && !b.captured) return -1;
    if (!a.captured && b.captured) return 1;
    if (a.san.includes('+') && !b.san.includes('+')) return -1;
    if (!a.san.includes('+') && b.san.includes('+')) return 1;
    return Math.random() - 0.5;
  });
  
  const selectedMove = prioritizedMoves[0];
  return `${selectedMove.from}${selectedMove.to}`;
};

export async function makeAIMove(fen: string): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < RETRY_ATTEMPTS; attempt++) {
    try {
      if (attempt > 0) {
        await sleep(RETRY_DELAY * attempt);
      }

      const prompt = `Você é um motor de xadrez avançado. Analise esta posição FEN: ${fen}
                     Retorne APENAS um movimento legal para as pretas no formato 'e2e4'.
                     O movimento deve ser estratégico e forte.
                     Considere:
                     1. Controle do centro
                     2. Desenvolvimento de peças
                     3. Segurança do rei
                     4. Oportunidades táticas
                     Retorne apenas o movimento, sem explicação.`;

      const requestBody = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          topK: 1,
          topP: 1,
          maxOutputTokens: 8,
          candidateCount: 1
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE"
          }
        ]
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid AI response format');
      }

      const move = data.candidates[0].content.parts[0].text.trim().toLowerCase();
      
      if (!/^[a-h][1-8][a-h][1-8]$/.test(move)) {
        throw new Error(`Invalid move format: ${move}`);
      }

      if (!validateMove(move, fen)) {
        throw new Error(`Illegal move: ${move}`);
      }

      return move;
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt + 1} failed:`, error);
      
      if (attempt === RETRY_ATTEMPTS - 1) {
        console.warn('All attempts failed, using fallback move');
        return getFallbackMove(fen);
      }
    }
  }

  throw lastError || new Error('Failed to make AI move');
}