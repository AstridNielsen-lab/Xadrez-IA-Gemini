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
  const [isProcessing, setIsProcessing] = useState(false);

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

  const formatMove = (from: string, to: string, piece: any, capture: boolean, check: boolean): string => {
    try {
      const pieceSymbol = piece.type.toUpperCase();
      const captureSymbol = capture ? 'x' : '';
      const checkSymbol = check ? '+' : '';
      return `${pieceSymbol}${from}${captureSymbol}${to}${checkSymbol}`;
    } catch (error) {
      console.error('Erro ao formatar movimento:', error);
      return `${from}-${to}`;
    }
  };

  const makeMove = async (move: any) => {
    if (isProcessing) return false;
    
    try {
      setIsProcessing(true);
      const piece = game.get(move.from);
      const capture = game.get(move.to) !== null;
      
      const result = game.move(move);
      if (result) {
        const isCheck = game.isCheck();
        const moveNotation = formatMove(move.from, move.to, piece, capture, isCheck);
        onMove(moveNotation);
        
        setGame(new Chess(game.fen()));
        
        if (!game.isGameOver()) {
          setIsPlayerTurn(false);
          try {
            const aiMove = await makeAIMove(game.fen());
            const [from, to] = [aiMove.slice(0, 2), aiMove.slice(2, 4)];
            const aiPiece = game.get(from);
            const aiCapture = game.get(to) !== null;
            
            const aiMoveResult = game.move({ from, to, promotion: 'q' });
            
            if (aiMoveResult) {
              const aiIsCheck = game.isCheck();
              const aiMoveNotation = formatMove(from, to, aiPiece, aiCapture, aiIsCheck);
              onMove(aiMoveNotation);
              setGame(new Chess(game.fen()));
            }
          } catch (error) {
            console.error('Erro durante movimento da IA:', error);
          } finally {
            setIsPlayerTurn(true);
          }
        } else {
          handleGameOver();
        }
      }
    } catch (error) {
      console.error('Erro ao fazer movimento:', error);
    } finally {
      setIsProcessing(false);
    }
    return true;
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
    setIsProcessing(false);
  };

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    if (!isPlayerTurn || isProcessing) return false;

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