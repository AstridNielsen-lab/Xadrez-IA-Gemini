import React from 'react';
import { ScrollText } from 'lucide-react';

interface GameLogsProps {
  moves: string[];
}

export function GameLogs({ moves }: GameLogsProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-full max-w-[300px] h-[600px]">
      <div className="flex items-center gap-2 mb-4">
        <ScrollText className="text-blue-500" />
        <h2 className="text-xl font-semibold">Histórico de Jogadas</h2>
      </div>
      <div className="overflow-y-auto h-[calc(100%-3rem)]">
        {moves.length === 0 ? (
          <p className="text-gray-500 text-center">O jogo ainda não começou</p>
        ) : (
          <div className="space-y-2">
            {moves.map((move, index) => (
              <div
                key={index}
                className="flex items-center p-2 bg-gray-50 rounded"
              >
                <span className="font-mono w-8 text-gray-500">
                  {Math.floor(index / 2) + 1}.
                </span>
                <span className="flex-1">
                  {index % 2 === 0 ? 'Você: ' : 'IA: '}
                  <span className="font-semibold">{move}</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}