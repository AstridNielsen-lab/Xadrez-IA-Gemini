import React, { useState, useEffect } from 'react';
import { ChessBoard } from './components/ChessBoard';
import { GameStatus } from './components/GameStatus';
import { GameLogs } from './components/GameLogs';
import { Footer } from './components/Footer';
import { GameState, Score, Timer } from './types';

function App() {
  const [gameState, setGameState] = useState<GameState>({
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    isCheck: false,
    isCheckmate: false,
    isDraw: false,
    turn: 'w'
  });

  const [score, setScore] = useState<Score>({ player: 0, ai: 0 });
  const [timer, setTimer] = useState<Timer>({ minutes: 5, seconds: 0 });
  const [isTimerExpired, setIsTimerExpired] = useState(false);
  const [moves, setMoves] = useState<string[]>([]);

  useEffect(() => {
    let interval: number | undefined;
    
    if (gameState.turn === 'w' && !gameState.isCheckmate && !gameState.isDraw) {
      interval = window.setInterval(() => {
        setTimer(prevTimer => {
          if (prevTimer.minutes === 0 && prevTimer.seconds === 0) {
            setIsTimerExpired(true);
            return prevTimer;
          }
          
          if (prevTimer.seconds === 0) {
            return {
              minutes: prevTimer.minutes - 1,
              seconds: 59
            };
          }
          
          return {
            ...prevTimer,
            seconds: prevTimer.seconds - 1
          };
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [gameState]);

  useEffect(() => {
    if (gameState.turn === 'w') {
      setTimer({ minutes: 5, seconds: 0 });
      setIsTimerExpired(false);
    }
  }, [gameState.turn]);

  const handleMove = (move: string) => {
    setMoves(prevMoves => [...prevMoves, move]);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Xadrez contra IA
        </h1>
        <div className="flex flex-col items-center">
          <GameStatus
            gameState={gameState}
            timer={timer}
            score={score}
          />
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <ChessBoard
              onGameStateChange={setGameState}
              score={score}
              onScoreChange={setScore}
              isTimerExpired={isTimerExpired}
              onMove={handleMove}
            />
            <GameLogs moves={moves} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default App;