const API_KEY = 'AIzaSyA4orZAiyXf-bMV5cNL03qz3ZzL0n2h5H8';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

export async function makeAIMove(fen: string): Promise<string> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a chess engine. Given this FEN string representing the current chess position: ${fen}
                   Calculate and return ONLY a valid chess move in the format 'e2e4' (source square to target square).
                   The move should be optimal for black. No explanation needed, just the move.`
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response format from AI');
    }

    const move = data.candidates[0].content.parts[0].text.trim();
    
    // Validate move format (e.g., 'e2e4')
    if (!/^[a-h][1-8][a-h][1-8]$/.test(move)) {
      throw new Error('Invalid move format from AI');
    }

    return move;
  } catch (error) {
    console.error('Error making AI move:', error);
    // Fallback move in case of error - simple pawn move
    const fallbackMoves = ['e7e6', 'd7d6', 'c7c6', 'b7b6', 'a7a6', 'h7h6', 'g7g6', 'f7f6'];
    return fallbackMoves[Math.floor(Math.random() * fallbackMoves.length)];
  }
}