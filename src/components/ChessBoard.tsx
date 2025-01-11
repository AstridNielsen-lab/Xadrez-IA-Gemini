import React, { useEffect, useState } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { GameState, Score } from '../types';
import { makeAIMove } from '../services/ai';

interface ChessBoardProps {
  onGameStateChange: (state: GameState) => void;
  score: Score;
  onScoreChange: (score: Score) => void;
  isTimerExpired: boolean;
  onMove: (move: string) => void;
}

export function ChessBoard({ onGameStateChange, score, onScoreChange, isTimerExpired, onMove }: ChessBoardProps) {
  const [game, setGame] = useState(new Chess());
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);

  useEffect(() => {
    updateGameState();
  }, [game]);

  useEffect(() => {
    if (isTimerExpired && isPlayerTurn) {
      handleTimeout();
    }
  }, [isTimerExpired]);

  const updateGameState = () => {
    onGameStateChange({
      fen: game.fen(),
      isCheck: game.isCheck(),
      isCheckmate: game.isCheckmate(),
      isDraw: game.isDraw(),
      turn: game.turn()
    });
  };

  const handleTimeout = () => {
    onScoreChange({
      ...score,
      ai: score.ai + 1
    });
    resetGame();
  };

  const formatMove = (from: string, to: string): string => {
    try {
      const piece = game.get(from);
      if (!piece) return `${from}-${to}`;
      
      const pieceSymbol = piece.type.toUpperCase();
      const capture = game.get(to) ? 'x' : '';
      return `${pieceSymbol}${from}${capture}${to}`;
    } catch (error) {
      console.error('Error formatting move:', error);
      return `${from}-${to}`;
    }
  };

  const makeMove = async (move: any) => {
    try {
      const result = game.move(move);
      if (result) {
        const moveNotation = formatMove(move.from, move.to);
        onMove(moveNotation);
        
        setGame(new Chess(game.fen()));
        
        if (!game.isGameOver()) {
          setIsPlayerTurn(false);
          try {
            const aiMove = await makeAIMove(game.fen());
            const [from, to] = [aiMove.slice(0, 2), aiMove.slice(2, 4)];
            const aiMoveResult = game.move({ from, to, promotion: 'q' });
            
            if (aiMoveResult) {
              const aiMoveNotation = formatMove(from, to);
              onMove(aiMoveNotation);
              setGame(new Chess(game.fen()));
            }
          } catch (error) {
            console.error('Error during AI move:', error);
          } finally {
            setIsPlayerTurn(true);
          }
        } else {
          handleGameOver();
        }
      }
    } catch (error) {
      console.error('Error making move:', error);
    }
  };

  const handleGameOver = () => {
    if (game.isCheckmate()) {
      if (game.turn() === 'b') {
        onScoreChange({ ...score, player: score.player + 1 });
      } else {
        onScoreChange({ ...score, ai: score.ai + 1 });
      }
    }
  };

  const resetGame = () => {
    setGame(new Chess());
    setIsPlayerTurn(true);
  };

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    if (!isPlayerTurn) return false;

    const move = {
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q'
    };

    makeMove(move);
    return true;
  };

  return (
    <div className="w-full max-w-[600px] aspect-square">
      <Chessboard
        position={game.fen()}
        onPieceDrop={onDrop}
        boardOrientation="white"
        animationDuration={200}
        customBoardStyle={{
          borderRadius: '4px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
        }}
      />
    </div>
  );
}