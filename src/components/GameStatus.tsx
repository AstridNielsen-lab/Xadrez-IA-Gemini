import React from 'react';
import { GameState } from '../types';
import { Crown, Clock } from 'lucide-react';

interface GameStatusProps {
  gameState: GameState;
  timer: { minutes: number; seconds: number };
  score: { player: number; ai: number };
}

export function GameStatus({ gameState, timer, score }: GameStatusProps) {
  const getStatusMessage = () => {
    if (gameState.isCheckmate) {
      return gameState.turn === 'b' ? 'Xeque-mate! Você venceu!' : 'Xeque-mate! A IA venceu!';
    }
    if (gameState.isCheck) {
      return 'Xeque!';
    }
    if (gameState.isDraw) {
      return 'Empate!';
    }
    return gameState.turn === 'w' ? 'Sua vez' : 'IA pensando...';
  };

  return (
    <div className="w-full max-w-[600px] bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Crown className="text-yellow-500" />
          <span className="text-lg font-semibold">
            Você {score.player} x {score.ai} IA
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="text-blue-500" />
          <span className="text-lg font-semibold">
            {String(timer.minutes).padStart(2, '0')}:{String(timer.seconds).padStart(2, '0')}
          </span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xl font-medium text-gray-700">{getStatusMessage()}</p>
      </div>
    </div>
  );
}